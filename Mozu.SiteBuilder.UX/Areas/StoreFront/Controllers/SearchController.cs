using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.Core.Api.Contracts.Client;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    public class SearchController : BaseController
    {
        private readonly IProductCategoryRuntimeWebApiClient _catClient;
        private readonly IProductRuntimeWebApiClient _productClient;
        private readonly ISiteBuilderContext _ctx;
        private readonly IProductSearchWebApiClient _searchClient;

        public SearchController(IProductCategoryRuntimeWebApiClient catClient, ISiteBuilderContext ctx, IProductRuntimeWebApiClient productClient, IProductSearchWebApiClient searchClient)
        {
            _ctx = ctx;
            _catClient = catClient;
            _productClient = productClient;
            _searchClient = searchClient;

            SiteContext = SiteContext ?? _ctx;

            if (searchClient is ServiceClientBase)
            {
                var client = searchClient as ServiceClientBase;
                client.Options.MaxSize = int.MaxValue;
            }
            if (productClient is ServiceClientBase)
            {
                var client = productClient as ServiceClientBase;
                client.Options.MaxSize = int.MaxValue;
            }
        }

        public ActionResult Index( string query, int? categoryId, string sortBy = null, int? page = null, int? itemsPerPage = null)
        {
            itemsPerPage = itemsPerPage.GetValueOrDefault(15);
            page = page.GetValueOrDefault(1);
            int startIdx = (page.Value - 1) * itemsPerPage.Value;

            var ret = _searchClient.Search(query, null, categoryId, categoryId == null ? false : true, sortBy, itemsPerPage, startIdx, true, true, null).Result.ReadAsAsync().Result;
            var pc = AutoMapper.Mapper.Map<ProductSearchResult>(ret);

            pc.Query = query;

            pc.CurrentSort = sortBy;
           // pc.Paging.StartIndex = startIdx;
            pc.UrlBase = "/search?query=" + query;

            ProcessFacetts(pc);
            if (ret.TotalCount > 0 )
            {
                return View("searchresults", pc);
            }
            else
            {
                return View("noresults", pc);
            }

        }
        void ProcessFacetts ( ProductSearchResult res )
        {
            
            


            while (true)
            {
                if ( res.CategoryFacet == null || res.CategoryFacet.Items.Count  == 0 )
                {
                    return ;
                }
                if (res.CategoryFacet.Items.Count > 1)
                {
                    break;
                }
                res.CategoryFacet.Items = res.CategoryFacet.Items[0].Children;
            }


            var stack = new Stack<CategoryFacetItem>();

            res.CategoryFacet.Items.ForEach(cf => stack.Push(AutoMapper.Mapper.Map <CategoryFacetItem >(cf)));



            while (stack.Count > 0)
            {
                var curr = stack.Pop();
              
                curr.Name = this.SiteContext.CatalogContext.AllCategories .Where(_cat => _cat.CategoryId == curr.CategoryId).Select(_cat => _cat.Name).FirstOrDefault();
                curr.Url = string.Format("/search?query={0}&categoryId={1}", res.Query, curr.CategoryId);

                if (curr.Children != null) curr.Children.ForEach(c => stack.Push(AutoMapper.Mapper.Map <CategoryFacetItem >(c)));
            }

            
            
          
        }


    }
}
