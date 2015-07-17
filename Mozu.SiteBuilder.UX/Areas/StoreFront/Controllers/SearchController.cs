using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using Newtonsoft.Json.Linq;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Filters;
using Mozu.Core.Actions;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [NoSslActionFilter]
    [ContextInitialization]
    [DataViewModeEnforcement]
    [ActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageAfterAction, executionType: ActionExtensionExecutionTypes.AfterController)]
    [ActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController)]
    public class SearchController : BaseApiController
    {
        private readonly IProductCategoryRuntimeWebApiClient _catClient;
        private readonly IProductRuntimeWebApiClient _productClient;

        private readonly IProductSearchWebApiClient _searchClient;

        public SearchController(IProductCategoryRuntimeWebApiClient catClient, IProductRuntimeWebApiClient productClient, IProductSearchWebApiClient searchClient)
        {
            _catClient = catClient;
            _productClient = productClient;
            _searchClient = searchClient;
        }

        [HttpGet]
        public async Task<ActionResult> Index(string query= null, int? categoryId = null, int? page = null,
            //adding w as an extra param for jelly belly.  Plan to remove in r6.1
            string w=null)
        {
            int filterCatId = 0;
            bool isCatFiltered = false;
            query = query ?? w;

            var categoryIdFacet = PageContext.Search.Facets["categoryId"];
            if (!categoryIdFacet.IsNullOrEmpty())
            {
                int facetCategoryId;
                if(int.TryParse(categoryIdFacet, out facetCategoryId))
                {
                    filterCatId = facetCategoryId;
                }
            }

            if (isCatFiltered && !categoryId.HasValue)
            {
                categoryId = filterCatId;
            }
            
            PageContext.PageType = "search";
            PageContext.CategoryId = categoryId;
            page = page.GetValueOrDefault(1);

            var themeSettings = SiteContext.ThemeSettings;
            var includeFacets = ((bool?) (JToken) themeSettings["showCategoryFacets"]);
            var searchQuery = new StringBuilder();
            string facetTemplate = null;
            string facetHierValue = null;
            string facetHierDepth = null;
            string facets = null;

            if (categoryId.HasValue)
            {
                searchQuery.Append("categoryId req ");
                searchQuery.Append(categoryId);
            }

            if (PageContext.Search.PageSize == null)
            {
                PageContext.Search.PageSize = ((int?) (JToken)themeSettings["defaultPageSize"]) ?? 20;
            }

            if (PageContext.Search.StartIndex == null && page != null)
            {
                PageContext.Search.StartIndex = (page.Value - 1) * PageContext.Search.PageSize.Value;
            }
            else
            {
                PageContext.Search.StartIndex = PageContext.Search.StartIndex.GetValueOrDefault(0);
            }

            if (includeFacets.GetValueOrDefault(true) )
            {
                facets = "categoryId";
                facetHierDepth = "categoryId:2";
                if (categoryId.HasValue)
                {
                    facetTemplate = "categoryId:" + categoryId;
                    facetHierValue = "categoryId:" + categoryId;
                }
            }
            
            var searchResponse = (await _searchClient.Search(query, searchQuery.ToString(), facetHierValue: facetHierValue, facetTemplate: facetTemplate, facetHierDepth: facetHierDepth, facetValueFilter: PageContext.Search.ToFacetValueFilter(), startIndex: PageContext.Search.StartIndex, sortBy: PageContext.Search.SortBy, pageSize: PageContext.Search.PageSize, facet: facets)).ReadAsSync();
            var pc = Mapper.Map<ProductSearchResult>(searchResponse);

            pc.Query = query;
            pc.CurrentSort = PageContext.Search.SortBy;
            pc.UrlBase = "/search?query=" + query;

            var searchPageType = pc.TotalCount > 0 ? "search-results" : "no-search-results";

            PageContext.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = searchPageType,
                    DocumentTypeFQN = "pageTemplateContent@mozu"
                },

            };

            return View(searchPageType, pc);
        }
    }
}