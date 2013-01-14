using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
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

        [WebGet(UriTemplate = "role/{id}")]
        public Task<Response<Role>> Role(int? id)
        {
            return Single(_permissionsRepository.GetRole(id).Result);
        }

        [WebGet(UriTemplate = "roles")]
        public Task<Response<List<Role>>> Roles(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            return List(_permissionsRepository.GetRoles().Result.ToList());
        }

        /*[WebInvoke(UriTemplate = "role/create", Method = "POST")]
        public Response<Role> CreateRole(Role role)
        {
            return Single(_permissionsRepository.AddRole(role));
        }

        [WebInvoke(UriTemplate = "role/update", Method = "POST")]
        public Response<Role> UpdateRole(Role role)
        {
            return Single(_permissionsRepository.UpdateRole(role));
        }

        [WebInvoke(UriTemplate = "role/delete", Method = "POST")]
        public Response<Role> DeleteRole(Role role)
        {
            _permissionsRepository.DeleteRole(role);

            return EmptySingle<Role>();
        }*/

        [WebGet(UriTemplate = "behavior/{id}")]
        public Task<Response<Behavior>> Behaviors(int? id)
        {
            return Single(_permissionsRepository.GetBehavior(id).Result);
        }

        [WebGet(UriTemplate = "behaviors")]
        public Task<Response<List<Behavior>>> GetBehaviors(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            return List(_permissionsRepository.GetBehaviors().Result.ToList());
        }
    }
}