using System.Collections.Generic;
using System.ServiceModel;
using System.ServiceModel.Web;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.Users;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Users;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class RolesController : BaseController
    {
        private readonly IPermissionsRepository _permissionsRepository;

        public RolesController(IPermissionsRepository permissionsRepository)
        {
            _permissionsRepository = permissionsRepository;
        }

        [WebGet(UriTemplate = "/")]
        public Response<List<Role>> GetAll()
        {
            var roles = _permissionsRepository.GetRoles();

            return roles.IsNullOrEmpty() ? EmptyList<Role>() : List(roles);
        }

        [WebGet(UriTemplate = "/role/{id}")]
        public Response<Role> GetRole(int? id)
        {
            var role = _permissionsRepository.GetRole(id);

            return role == null ? EmptySingle<Role>(false) : Single(role);
        }

        [WebInvoke(UriTemplate = "/create", Method = "POST")]
        public Response<Role> Create(Role role)
        {
            var addedRole = _permissionsRepository.AddRole(role);

            return addedRole == null ? EmptySingle<Role>(false) : Single(addedRole);
        }

        [WebInvoke(UriTemplate = "/update", Method = "POST")]
        public Response<Role> Update(Role role)
        {
            var updatedRole = _permissionsRepository.UpdateRole(role);

            return updatedRole == null ? EmptySingle<Role>(false) : Single(updatedRole);
        }

        [WebInvoke(UriTemplate = "/delete", Method = "POST")]
        public Response<Role> Delete(Role role)
        {
            _permissionsRepository.DeleteRole(role);

            return EmptySingle<Role>();
        }

        [WebGet(UriTemplate = "/tree")]
        public Response<BehaviorTree> GetTree()
        {
            var tree = _permissionsRepository.GetBehaviorTree();

            return Single(tree);
        }
    }
}