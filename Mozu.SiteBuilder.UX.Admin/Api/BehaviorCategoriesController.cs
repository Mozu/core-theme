using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.WebPages;
using Mozu.Core.Api.Routing;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.Users;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Users;
using ProtoBuf.Meta;

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

        [HttpGetRoute(UriTemplate = "behaviors")]
        public async Task<Response<List<Behavior>>> GetCategoryBehaviors(FilterCollection extFilter)
        {
            var searchId = 0;
            if (!extFilter.IsNullOrEmpty())
            {
                foreach (var filter in extFilter.Where(filter => filter.property.ToLowerInvariant() == "id"))
                {
                    searchId = (int)filter.value;
                }
            }

            var behaviorsAll = await _permissionsRepository.GetBehaviors();
            var benaviorList = behaviorsAll.Where(item => item.CategoryId == searchId).ToList();

            return await (benaviorList == null ? EmptyList<Behavior>() : List<Behavior>(benaviorList));
        }
    }
}