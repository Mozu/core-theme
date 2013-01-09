using System.Collections.Generic;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.Users;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Users;
using System.Linq;
namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class RoleBehaviorsController : BaseController
    {
        private readonly IPermissionsRepository _permissionsRepository;

        public RoleBehaviorsController(IPermissionsRepository permissionsRepository)
        {
            _permissionsRepository = permissionsRepository;
        }

        [WebGet(UriTemplate = "/read")]
        public Task<Response<List<Mozu.SiteBuilder.UX.Models.Users.BehaviorTree.BehaviorTreeNode >>> GetRoleBehaviors( FilterCollection extFilter)
        {
            int roleId = extFilter.GetValue("roleId", 0);
            var roleBehavior = _permissionsRepository.GetRoleBehavior(extFilter.GetValue("roleId",0));

            var tree = _permissionsRepository.GetBehaviorTree();
        
            tree.Nodes.ForEach( x =>  x.Children.ForEach(y => y.RoleId = roleId));

            return  this.List(tree.Assign(roleBehavior).Nodes);
        }

        [WebInvoke(UriTemplate = "/edit", Method = "POST")]
        public Task<Response<List<RoleBehavior>>> EditRoleBehaviors([FromBody] List<RoleBehavior> behaviors)
        {
            List<RoleBehavior> retList = new List<RoleBehavior>();
            foreach (var beh in behaviors)
            {
                retList.Add(_permissionsRepository.UpdateRoleBehavior(beh));
            }

            return this.List<RoleBehavior>(retList);
        }
    }

    [ServiceContract]
    public class RolesController : BaseController
    {
        private readonly IPermissionsRepository _permissionsRepository;

        public RolesController(IPermissionsRepository permissionsRepository)
        {
            _permissionsRepository = permissionsRepository;
        }

        [WebGet(UriTemplate = "/")]
        public Task<Response<List<Role>>> GetAll()
        {
            var roles = _permissionsRepository.GetRoles();

            return roles.IsNullOrEmpty() ? EmptyList<Role>() : List(roles);
        }

        [WebGet(UriTemplate = "/role/{id}")]
        public Task<Response<Role>> GetRole(int? id)
        {
            var role = _permissionsRepository.GetRole(id);

            return role == null ? EmptySingle<Role>(false) : Single(role);
        }

        [WebInvoke(UriTemplate = "/create", Method = "POST")]
        public Task<Response<Role>> Create(Role role)
        {
            var addedRole = _permissionsRepository.AddRole(role);

            return addedRole == null ? EmptySingle<Role>(false) : Single(addedRole);
        }

        [WebInvoke(UriTemplate = "/update", Method = "POST")]
        public Task<Response<Role>> Update(Role role)
        {
            var updatedRole = _permissionsRepository.UpdateRole(role);

            return updatedRole == null ? EmptySingle<Role>(false) : Single(updatedRole);
        }

        [WebInvoke(UriTemplate = "/delete", Method = "POST")]
        public Task<Response<Role>> Delete(Role role)
        {
            _permissionsRepository.DeleteRole(role);

            return EmptySingle<Role>();
        }

        [WebGet(UriTemplate = "/tree")]
        public Task<Response<BehaviorTree>> GetTree()
        {
            var tree = _permissionsRepository.GetBehaviorTree();

            return Single(tree);
        }
    }
}