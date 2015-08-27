using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.Mvc.Users;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Users;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/permissions", SuppressDescriptorGeneration = true)]
    public class PermissionsController : BaseController
    {
        private readonly IPermissionsRepository _permissionsRepository;

        public PermissionsController(IPermissionsRepository permissionsRepository)
        {
            _permissionsRepository = permissionsRepository;
        }

		[HttpGetRoute(UriTemplate = "role/{id}")]
        public async Task<Response<Role>> Role(int? id)
        {
            var role = await _permissionsRepository.GetRole(id);
            return Single2(role);
        }

		[HttpGetRoute(UriTemplate = "roles")]
        public async Task<Response<List<Role>>> Roles([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            var roles = await _permissionsRepository.GetRoles();
            return List2(roles);
        }

		/*[HttpPostRoute(UriTemplate = "role/create")]
		public Response<Role> CreateRole(Role role)
		{
			return Single(_permissionsRepository.AddRole(role));
		}

		[HttpPostRoute(UriTemplate = "role/update")]
		public Response<Role> UpdateRole(Role role)
		{
			return Single(_permissionsRepository.UpdateRole(role));
		}

		[HttpPostRoute(UriTemplate = "role/delete")]
		public Response<Role> DeleteRole(Role role)
		{
			_permissionsRepository.DeleteRole(role);

			return EmptySingle<Role>();
		}*/

		[HttpGetRoute(UriTemplate = "behavior/{id}")]
        public async Task<Response<Behavior>> Behaviors(int? id)
        {
            var res = await _permissionsRepository.GetBehavior(id);
            return Single2(res);
        }

		[HttpGetRoute(UriTemplate = "behaviors")]
        public async Task<Response<List<Behavior>>> GetBehaviors([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            var res = await _permissionsRepository.GetBehaviors();
            return List2(res.ToList());
        }
    }
}