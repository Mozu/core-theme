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
    [WebApi("app/behaviorcategories", SuppressDescriptorGeneration = true)]
    public class BehaviorCategoriesController : BaseController
    {
        private readonly IPermissionsRepository _permissionsRepository;

        public BehaviorCategoriesController(IPermissionsRepository permissionsRepository)
        {
            _permissionsRepository = permissionsRepository;
        }

		[HttpGetRoute(UriTemplate = "")]
        public async Task<Response<List<BehaviorCategory>>> GetAll()
        {
            var behaviorCategories = await _permissionsRepository.GetCategories();

            return behaviorCategories.IsNullOrEmpty() ? EmptyList2<BehaviorCategory>() : List2(behaviorCategories);
        }

		[HttpGetRoute(UriTemplate = "behaviorcategory/{id}")]
        public async Task<Response<BehaviorCategory>> Get(int? id)
        {
            var behaviorCategory = await _permissionsRepository.GetCategory(id);

            return behaviorCategory == null ? EmptySingle2<BehaviorCategory>(false) : Single2(behaviorCategory);
        }
    }
}