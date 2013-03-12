using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
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
        public async Task<Response<Role>> Role(int? id)
        {
            var role = await _permissionsRepository.GetRole(id);
            return Single2(role);
        }

        [WebGet(UriTemplate = "roles")]
        public async Task<Response<List<Role>>> Roles([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            var roles = await _permissionsRepository.GetRoles();
            return List2(roles);
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
        public async Task<Response<Behavior>> Behaviors(int? id)
        {
            var res = await _permissionsRepository.GetBehavior(id);
            return Single2(res);
        }

        [WebGet(UriTemplate = "behaviors")]
        public async Task<Response<List<Behavior>>> GetBehaviors([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            var res = await _permissionsRepository.GetBehaviors();
            return List2(res.ToList());
        }
    }
}