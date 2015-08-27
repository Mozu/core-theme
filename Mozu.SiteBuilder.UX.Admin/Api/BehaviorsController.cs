using System.Collections.Generic;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using Mozu.Core.Api.Routing;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.Users;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Users;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/bahaviors", SuppressDescriptorGeneration = true)]
    public class BehaviorsController : BaseController
    {
        private readonly IPermissionsRepository _permissionsRepository;

        public BehaviorsController(IPermissionsRepository permissionsRepository)
        {
            _permissionsRepository = permissionsRepository;
        }

		[HttpGetRoute(UriTemplate = "")]
        public async Task<Response<List<Behavior>>> GetAll()
        {
            var behaviors = await _permissionsRepository.GetBehaviors();

            return behaviors.IsNullOrEmpty() ? EmptyList2<Behavior>() : List2(behaviors);
        }

		[HttpGetRoute(UriTemplate = "behavior/{id}")]
        public async Task<Response<Behavior>> Get(int? id)
        {
            var behavior = await _permissionsRepository.GetBehavior(id);

            return behavior == null ? EmptySingle2<Behavior>(false) : Single2(behavior);
        }
    }
}