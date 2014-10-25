using System;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.ProductAdmin.Contracts;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [NoSslActionFilter]
    [ContextInitialization]
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

        private readonly Regex categoryIdRE = new Regex("categoryId:(?<categoryId>\\w+)");

        [HttpGet]
        public async Task<ActionResult> Index(string query, int? categoryId = null, string sortBy = null, int? startIndex = null, int? page = null, int? pageSize = null, string facetValueFilter = null)
        {
          
            int filterCatId = 0;
            bool isCatFiltered = false;
            Match m;
            if (facetValueFilter != null)
            {
                m = categoryIdRE.Match(facetValueFilter);
                if (m.Success) {
                    isCatFiltered = int.TryParse(m.Groups["categoryId"].Value, out filterCatId);
                }
            }

            if (isCatFiltered && !categoryId.HasValue)
            {
                categoryId = filterCatId;
            }

            
            PageContext.Search  = new SearchContext
            {
                Query = query
            };
            
            PageContext.PageType = "search";
            PageContext.CategoryId = categoryId;

            ThemeRuntimeSettingsCollection themeSettings = SiteContext.ThemeSettings;

            page = page.GetValueOrDefault(1);

            // ProductRuntime.Contracts.ProductSearchResult ret = _searchClient.Search(query, sortBy: sortBy, startIndex: startIdx, pageSize: itemsPerPage).Result.ReadAsAsync().Result;
            //start paste

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


            if (pageSize == null)
            {
                pageSize = ((int?) (JToken)themeSettings["defaultPageSize"]) ?? 20;
            }


            if (startIndex == null && page != null)
            {
                startIndex = (page.Value - 1) * pageSize.Value;
            }

            startIndex = startIndex.GetValueOrDefault(0);


            if (includeFacets.GetValueOrDefault(true) )
            {
                facets = "categoryId";
                facetHierDepth = "categoryId:2";
                if (categoryId.HasValue)
                {
                    facetTemplate = "categoryId:" + categoryId;
                    facetHierValue = "categoryId:" + categoryId;
                }

                // facetValueFilter = facetValueFilter;
            }
            


            ProductRuntime.Contracts.ProductSearchResult res = (await _searchClient.Search(query, searchQuery.ToString(), facetHierValue: facetHierValue, facetTemplate: facetTemplate, facetHierDepth: facetHierDepth, facetValueFilter: facetValueFilter, startIndex: startIndex, sortBy: sortBy, pageSize: pageSize, facet: facets)).ReadAsSync();


            //end paste

            // var ret = _searchClient.Search(query, null, categoryId, categoryId == null ? false : true, sortBy, itemsPerPage, startIdx, true, true, null).Result.ReadAsAsync().Result;
            var pc = Mapper.Map<ProductSearchResult>(res);

            pc.Query = query;

            pc.CurrentSort = sortBy;
            // pc.Paging.StartIndex = startIdx;
            pc.UrlBase = "/search?query=" + query;

            //ProcessFacetts(pc);
            //ViewResult view = null;

            string searchPageType = pc.TotalCount > 0 ? "search-results" : "no-search-results";

            PageContext.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = searchPageType,
                    DocumentTypeFQN = "pageTemplateContent@mozu"
                },

            };

            return View(searchPageType, pc);
            
            //if (pc.TotalCount > 0)
            //{
            //    view = View("search-results", pc);
            //}
            //else
            //{
            //    view = View("no-search-results", pc);
            //}
            //return view;
        }

        //private void ProcessFacetts(ProductSearchResult res)
        //{
        //    //while (true)
        //    //{
        //    //    if ( res.CategoryFacet == null || res.CategoryFacet.Items.Count  == 0 )
        //    //    {
        //    //        return ;
        //    //    }
        //    //    if (res.CategoryFacet.Items.Count > 1)
        //    //    {
        //    //        break;
        //    //    }
        //    //    res.CategoryFacet.Items = res.CategoryFacet.Items[0].Children;
        //    //}


        //    //var stack = new Stack<CategoryFacetItem>();

        //    //res.CategoryFacet.Items.ForEach(cf => stack.Push(AutoMapper.Mapper.Map <CategoryFacetItem >(cf)));


        //    //while (stack.Count > 0)
        //    //{
        //    //    var curr = stack.Pop();

        //    //    curr.Name = this.SiteContext.CatalogContext.AllCategories .Where(_cat => _cat.CategoryId == curr.CategoryId).Select(_cat => _cat.Name).FirstOrDefault();
        //    //    curr.Url = string.Format("/search?query={0}&categoryId={1}", res.Query, curr.CategoryId);

        //    //    if (curr.Children != null) curr.Children.ForEach(c => stack.Push(AutoMapper.Mapper.Map <CategoryFacetItem >(c)));
        //    //}
        //}
    }
}