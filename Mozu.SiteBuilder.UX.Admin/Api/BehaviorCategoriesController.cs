using System.Collections.Generic;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.Users;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Users;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class BehaviorCategoriesController : BaseController
    {
        private readonly IPermissionsRepository _permissionsRepository;

        public BehaviorCategoriesController(IPermissionsRepository permissionsRepository)
        {
            _permissionsRepository = permissionsRepository;
        }

        [WebGet(UriTemplate = "")]
        public Task<Response<List<BehaviorCategory>>> GetAll()
        {
            var behaviorCategories = _permissionsRepository.GetCategories();

            return behaviorCategories.IsNullOrEmpty() ? EmptyList<BehaviorCategory>() : List(behaviorCategories);
        }

        [WebGet(UriTemplate = "behaviorcategory/{id}")]
        public Task<Response<BehaviorCategory>> Get(int? id)
        {
            var behaviorCategory = _permissionsRepository.GetCategory(id);

            return behaviorCategory == null ? EmptySingle<BehaviorCategory>(false) : Single(behaviorCategory);
        }
    }
}