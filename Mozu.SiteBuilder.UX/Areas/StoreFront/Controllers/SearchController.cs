using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [InitCmsPageContextActionFilter]
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
        public async Task<ActionResult> Index(string query, int? categoryId, string sortBy = null, int? page = null, int? pageSize = null, string facetValueFilter = null)
        {
            ThemeRuntimeSettingsCollection themeSettings = SiteContext.ThemeSettings;

            page = page.GetValueOrDefault(1);


            // ProductRuntime.Contracts.ProductSearchResult ret = _searchClient.Search(query, sortBy: sortBy, startIndex: startIdx, pageSize: itemsPerPage).Result.ReadAsAsync().Result;
            //start paste

            var includeFacets = ((bool?) (JToken) themeSettings["showCategoryFacets"]);


            var searchQuery = new StringBuilder();
            string facetTemplate = null;


            string facetHierValue = null;
            string facetHierDepth = null;


            if (categoryId.HasValue)
            {
                searchQuery.Append("categoryId req ");
                searchQuery.Append(categoryId.Value);
            }


            int tmp;
            if (pageSize == null)
            {
                pageSize = ((int?) (JToken)themeSettings["defaultPageSize"]) ?? 20;
            }


            int startIndex = (page.Value - 1)*pageSize.Value;


            if (includeFacets.GetValueOrDefault(true) && categoryId.HasValue)
            {
                facetHierDepth = "categoryId:2";
                facetTemplate = "categoryId:" + categoryId;
                facetHierValue = "categoryId:" + categoryId;
                // facetValueFilter = facetValueFilter;
            }

            if (categoryId != null)
            {
                this.PageContext.CategoryId = categoryId;
            }
            ProductRuntime.Contracts.ProductSearchResult res = (await _searchClient.Search(query, searchQuery.ToString(), facetHierValue: facetHierValue, facetTemplate: facetTemplate, facetHierDepth: facetHierDepth, facetValueFilter: facetValueFilter, startIndex: startIndex, sortBy: sortBy, pageSize: pageSize)).ReadAsSync();


            //end paste

            // var ret = _searchClient.Search(query, null, categoryId, categoryId == null ? false : true, sortBy, itemsPerPage, startIdx, true, true, null).Result.ReadAsAsync().Result;
            var pc = Mapper.Map<ProductSearchResult>(res);

            pc.Query = query;

            pc.CurrentSort = sortBy;
            // pc.Paging.StartIndex = startIdx;
            pc.UrlBase = "/search?query=" + query;

            ProcessFacetts(pc);
            ViewResult view = null;


            PageContext.Search = new SearchContext
                                 {
                                     Query = query
                                 };
            if (pc.TotalCount > 0)
            {
                view = View("search-results", pc);
            }
            else
            {
                view = View("no-search-results", pc);
            }
            return view;
        }

        private void ProcessFacetts(ProductSearchResult res)
        {
            //while (true)
            //{
            //    if ( res.CategoryFacet == null || res.CategoryFacet.Items.Count  == 0 )
            //    {
            //        return ;
            //    }
            //    if (res.CategoryFacet.Items.Count > 1)
            //    {
            //        break;
            //    }
            //    res.CategoryFacet.Items = res.CategoryFacet.Items[0].Children;
            //}


            //var stack = new Stack<CategoryFacetItem>();

            //res.CategoryFacet.Items.ForEach(cf => stack.Push(AutoMapper.Mapper.Map <CategoryFacetItem >(cf)));


            //while (stack.Count > 0)
            //{
            //    var curr = stack.Pop();

            //    curr.Name = this.SiteContext.CatalogContext.AllCategories .Where(_cat => _cat.CategoryId == curr.CategoryId).Select(_cat => _cat.Name).FirstOrDefault();
            //    curr.Url = string.Format("/search?query={0}&categoryId={1}", res.Query, curr.CategoryId);

            //    if (curr.Children != null) curr.Children.ForEach(c => stack.Push(AutoMapper.Mapper.Map <CategoryFacetItem >(c)));
            //}
        }
    }
}