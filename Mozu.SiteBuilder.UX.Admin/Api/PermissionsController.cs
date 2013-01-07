using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using Mozu.SiteBuilder.Mvc.Users;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Users;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class PermissionsController : BaseController
    {
        private readonly IPermissionsRepository _permissionsRepository;

        public PermissionsController(IPermissionsRepository permissionsRepository)
        {
            _permissionsRepository = permissionsRepository;
        }

        [WebGet(UriTemplate = "/role/{id}")]
        public Response<Role> Role(int? id)
        {
            return Single(_permissionsRepository.GetRole(id));
        }

        [WebGet(UriTemplate = "/roles")]
        public Response<List<Role>> Roles(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            return List(_permissionsRepository.GetRoles().ToList());
        }

        /*[WebInvoke(UriTemplate = "/role/create", Method = "POST")]
        public Response<Role> CreateRole(Role role)
        {
            return Single(_permissionsRepository.AddRole(role));
        }

        [WebInvoke(UriTemplate = "/role/update", Method = "POST")]
        public Response<Role> UpdateRole(Role role)
        {
            return Single(_permissionsRepository.UpdateRole(role));
        }

        [WebInvoke(UriTemplate = "/role/delete", Method = "POST")]
        public Response<Role> DeleteRole(Role role)
        {
            _permissionsRepository.DeleteRole(role);

            return EmptySingle<Role>();
        }*/

        [WebGet(UriTemplate = "/behavior/{id}")]
        public Response<Behavior> Behaviors(int? id)
        {
            return Single(_permissionsRepository.GetBehavior(id));
        }

        [WebGet(UriTemplate = "/behaviors")]
        public Response<List<Behavior>> GetBehaviors(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            return List(_permissionsRepository.GetBehaviors().ToList());
        }
    }
}