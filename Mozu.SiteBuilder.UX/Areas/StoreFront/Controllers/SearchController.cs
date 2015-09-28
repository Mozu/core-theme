using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using Newtonsoft.Json.Linq;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Filters;
using Mozu.Core.Actions;
using Mozu.SiteBuilder.Mvc.OAF;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using System.Collections.Generic;
using System;
using System.Net.Http;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [NoSslActionFilter]
    [ContextInitialization]
    [DataViewModeEnforcement]
    [SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController)]
    [SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageAfterAction, executionType: ActionExtensionExecutionTypes.AfterController)]
    public class SearchController : BaseApiController
    {
        readonly IProductCategoryRuntimeWebApiClient _catClient;
        readonly ICustomRouteHandler _customRouteHandler;
        readonly IProductRuntimeWebApiClient _productClient;

        readonly IProductSearchWebApiClient _searchClient;

        public SearchController(IProductCategoryRuntimeWebApiClient catClient, IProductRuntimeWebApiClient productClient, IProductSearchWebApiClient searchClient, ICustomRouteHandler customRouteHandler)
        {
            _catClient = catClient;
            _productClient = productClient;
            _searchClient = searchClient;
            _customRouteHandler = customRouteHandler;
        }

        [SbActionExtensionFilter(actionId: ActionFilterConstants.SearchIndexBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController)]
        [SbActionExtensionFilter(actionId: ActionFilterConstants.SearchIndexAfterAction, executionType: ActionExtensionExecutionTypes.AfterController)]
        [HttpGet]
        public async Task<HttpResponseMessage> Index(string query = null, int? categoryId = null, int? page = null,
            //adding w as an extra param for jelly belly.  Plan to remove in r6.1
            string w = null)
        {
   
            query = query ?? w;

            if ( categoryId == null )
            {
                int tmp;
                if ( int.TryParse(PageContext.Search.Facets["categoryId"], out tmp))
                {
                    PageContext.Search.CategoryId = categoryId = tmp;
                }
            }
            

           

            PageContext.PageType = "search";
            PageContext.CategoryId = categoryId;
            page = page.GetValueOrDefault(1);

            var themeSettings = SiteContext.ThemeSettings;
            var includeFacets = ((bool?)(JToken)themeSettings["showCategoryFacets"]);
            var searchQuery = new StringBuilder();
            string facetTemplate = null;
            string facetHierValue = null;
            string facetHierDepth = null;
            string searchTuningRuleContext = null;

            string facets = null;
            int? pageSize = PageContext.Search.PageSize;
            int? startIndex = PageContext.Search.StartIndex;

            if (categoryId.HasValue)
            {
                searchQuery.Append("categoryId req ");
                searchQuery.Append(categoryId);
                searchTuningRuleContext = "categoryId:" + categoryId;
            }

            if (pageSize == null)
            {
                pageSize = ((int?)(JToken)themeSettings["defaultPageSize"]) ?? 20;

            }

            if (startIndex == null && page != null)
            {
                startIndex = (page.Value - 1) * pageSize;
            }
            else
            {
                startIndex = startIndex.GetValueOrDefault(0);
            }

            if (includeFacets.GetValueOrDefault(true))
            {
                facets = "categoryId";
                facetHierDepth = "categoryId:2";
                if (categoryId.HasValue)
                {
                    facetTemplate = "categoryId:" + categoryId;
                    facetHierValue = "categoryId:" + categoryId;
                }
            }

            var searchResponse = (await _searchClient.Search(query, searchQuery.ToString(), facetHierValue: facetHierValue, facetTemplate: facetTemplate, facetHierDepth: facetHierDepth, facetValueFilter: PageContext.Search.ToFacetValueFilter(), startIndex: startIndex.Value, sortBy: PageContext.Search.SortBy, pageSize: pageSize.Value, facet: facets , searchTuningRuleContext: searchTuningRuleContext)).ReadAsSync();
            var pc = Mapper.Map<ProductSearchResult>(searchResponse);
            pc.Init(true, this.PageContext.Search);
            pc.UrlBase = "/search?query=" + query;

            var searchPageType = pc.TotalCount > 0 ? "search-results" : "no-search-results";

            PageContext.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = searchPageType,
                    DocumentTypeFQN = "pageTemplateContent@mozu",
                    IncludeInactiveDocument = PageContext.IsEditMode
                },
            };

            return Request.CreateResponse(System.Net.HttpStatusCode.OK, View(searchPageType, pc));
        }

        private IDictionary<string, object> MakeSearchDict(string query, int? categoryId, int? page, string w)
        {
            return new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase)
            {
                {"query", query },
                {"categoryId", categoryId },
                { "page", page},
                { "w", w}
            };
        }
    }
}