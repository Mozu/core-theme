using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Dependencies;
using System.Web.Routing;
using AutoMapper;
using Autofac;
using Mozu.Core;
using Mozu.Core.Api.Contracts;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.ServiceModel.Syndication;
using System.Threading.Tasks;

using IProductWebApiClient = Mozu.ProductRuntime.Contracts.Clients.IProductRuntimeWebApiClient;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{



    public class CatalogController : BaseApiController
    {
        IProductWebApiClient   _productClient;
        private readonly ICategoryTreeProvider _categoryTreeProvider;
        IProductSearchWebApiClient _searchClient;
        ISiteBuilderContext _ctx;
        ISiteBuilderApiContext _apiCtx;

        public CatalogController(ICategoryTreeProvider categoryTreeProvider, ISiteBuilderApiContext apiCtx, IProductWebApiClient productClient, IProductSearchWebApiClient searchClient, Autofac.ILifetimeScope lifetimeScope)
        {
            
            
     


            _categoryTreeProvider = categoryTreeProvider;
            _searchClient = searchClient;
            _productClient = productClient;
            _apiCtx = apiCtx;

        }
         [System.Web.Http.HttpGet]
        public async Task<HttpResponseMessage> ProductDetail(string productCode)
         {
             

            var res = await _productClient.GetProduct(productCode, null, "Categories,Properties,Options", PageContext.IsEditMode);
        
            if ( !res.ResponseMessage.IsSuccessStatusCode )
            {
                if (res.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
                {
                    // show detailed error message if previewing from Admin
                    if (_apiCtx.DataViewMode == DataViewModeType.Pending)
                    {
                        if (res.HasException)
                        {
                            var ex = res.ReadException();
                            throw ex;
                        }
                    }
                    return this.Request.CreateErrorResponse(HttpStatusCode.NotFound, "Product not found");
                }
               
            }
            var prod = res.ReadAsAsync().Result;
            var product = Mapper.Map<Models.StoreFront.Catalog.Product>(prod);

            SetCatalogContext(product);

            PageContext.PageType = "product";
            PageContext.ProductCode = productCode;


            PageContext.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = "product"
                },
                Page = new DocumentRequest()
                {
                    Path = "product-" + productCode,
                    Collection = "catalog_pages"
                }


            };




            //SiteContext.PageContext.WidgetCreationTags.Add ("product-" + productCode);
            //SiteContext.PageContext.WidgetQuery.Add ("product");

             return this.Request.CreateResponse(HttpStatusCode.OK, View("product", product));
         }
         [System.Web.Http.HttpGet]
        public ActionResult ProductListing(int? categoryId= null , string sortBy = null, int? startIdx = null, int? itemsPerPage = null,  List<object> productCodes = null , bool? includeFacets=null, bool? useUrlParams=null)
        {

            categoryId = categoryId.GetValueOrDefault(-1) <1  ? null : categoryId;
            if (useUrlParams.GetValueOrDefault(false)) {
                var itemsPerPageParam = HttpRequestBase.QueryString["pageSize"];
                var startIndexParam = HttpRequestBase.QueryString["startIndex"];
                itemsPerPage = String.IsNullOrWhiteSpace(itemsPerPageParam) ? Convert.ToInt32(SiteContext.ThemeSettings["defaultPageSize"]) : Convert.ToInt32(itemsPerPageParam);
                startIdx = String.IsNullOrWhiteSpace(startIndexParam) ? 0 : Convert.ToInt32(startIndexParam);
            } else {
                itemsPerPage = itemsPerPage.GetValueOrDefault(Convert.ToInt32(SiteContext.ThemeSettings["defaultPageSize"]));
                startIdx = startIdx.GetValueOrDefault(0);
            }
            var recurse = categoryId.HasValue ;
            string filter = null;
            if (productCodes != null && productCodes.Count > 0)
            {
                var productCodes2 = productCodes.Select(x => x.ToString()).Where( x=> !string.IsNullOrWhiteSpace(x)).Select(x => string.Format("productCode eq {0}", x)).ToList();
                if (productCodes2.Count > 0)
                {
                    filter = string.Join(" or ", productCodes2);
                }
                
                itemsPerPage = productCodes.Count;
             
            }
            if (categoryId.HasValue)
            {
                if ( !string.IsNullOrWhiteSpace( filter))
                {
                    filter = "(categoryId req " + categoryId + ") and (" + filter + ")";
                }
                else
                {
                    filter = "categoryId req " + categoryId;
                }
            }
            //todo do i need to replace recurese
            // recurse: recurse,
            try
            {

                

                if (includeFacets.GetValueOrDefault(false) && categoryId.HasValue )
                {
                    string facetValueFilter = HttpRequestBase.QueryString["facetValueFilter"];
                    var pcDC = _searchClient.Search(query: "*:*", filter: filter, startIndex: startIdx, pageSize: itemsPerPage, sortBy: sortBy, facetTemplate:"categoryId:" + categoryId, facetHierValue: "categoryId:" + categoryId, facetHierDepth : "categoryId:2", facetValueFilter: facetValueFilter).Result.ReadAsSync();
                    var pc = Mapper.Map<ProductSearchResult>(pcDC);
                    return PartialView(pcDC);
                }
                else
                {
                    var pcDC = _productClient.GetProducts(filter: filter, startIndex: startIdx, pageSize: itemsPerPage, sortBy: sortBy, responseGroups: "Categories,Measurements,Properties,Options").Result.ReadAsSync();
                    var pc = Mapper.Map<ProductCollection>(pcDC);
                    return PartialView(pc);
                
                }

                //`
                //pc.Paging.CurrentSort = sortBy;
                //pc.Paging.StartIndex = startIdx;
                //pc.Paging.UrlBase = "?";



                
            }
            catch (Exception ex)
            {
                return new ContentResult() {Content = "[product service error]: " + ex.Message};
            }
        }
         [System.Web.Http.HttpGet]
        public async Task<ActionResult> Store ()
         {
             var catList = await _categoryTreeProvider.GetAllCategories();
            var cat = new Category()
            {
                Content = new CategoryContent (){Name = "Store"}
               
            };
            this.PageContext.PageType = "category";
            PageContext.CategoryId = -1;
            cat.ChildrenCategories = catList.Where(x => x.ParentCategory == null).ToList();
            return View("Category", cat);
        }

        private RequestContext RequestContext
        {
            get { return new RequestContext(this.HttpContext, new RouteData()); }
        }


         [System.Web.Http.HttpGet]
        public async Task<HttpResponseMessage > Category(int? categoryId = null, string sortBy = null, int? page = null, int? itemsPerPage = null )
        {
            PageContext.PageType = "category";
            PageContext.CategoryId = categoryId;

          
            var feedUrl = HttpRequestBase.Url;

             PageContext.FeedUrl = "/feeds/category/" + categoryId;

             var catList = await _categoryTreeProvider.GetAllCategories();
            



            var cat = catList.Where(x => x.CategoryId == categoryId.GetValueOrDefault (-1)).FirstOrDefault();
            //SiteContext.PageContext.WidgetCreationTags.Add("category-" + categoryId );
            //SiteContext.PageContext.WidgetQuery.Add("category");

            if (cat == null)
            {
                return this.Request.CreateErrorResponse(HttpStatusCode.NotFound, "category not found");

                 
            }

             var lts = (ILifetimeScope) this.ControllerContext.Request.GetDependencyScope().GetService(typeof (ILifetimeScope));

             var sbccc = lts.Resolve<ISiteBuilderContext>();
            PageContext.Title = cat.Name;

            PageContext.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = "category"
                },
                Page = new DocumentRequest()
                           {
                               Path ="category-"+ categoryId ,
                               Collection = "catalog_pages"
                           }

            };
          
            ;

            SetCatalogContext(cat);

        
            var result= View(cat);

            return this.Request.CreateResponse(HttpStatusCode.OK, result);

            //.Result.ReadAsSync();
            //AutoMapper.Mapper.Map< Category>( cat );
            //return View();
        }


         [System.Web.Http.HttpGet]
        public async Task< HttpResponseMessage>  CategoryFeed(int? categoryId = null)
        {
            var itemsPerPage = 10;
            var startIdx = 0;
            // TODO: Sort by Date Last Modified DESC
            string sortBy = null;// "CreateDate DESC";

            var catList = await _categoryTreeProvider.GetAllCategories();
            var cat = catList.Where(x => x.CategoryId == categoryId.GetValueOrDefault(-1)).FirstOrDefault();
            if (cat == null)
            {
                return this.Request.CreateErrorResponse(HttpStatusCode.NotFound, "category not found");

                
            }
         
            var feedUrl = HttpRequestBase.Url;
            Int32.TryParse(HttpRequestBase.QueryString["startIndex"], out startIdx);

            // Get Results and populate feed

            var resp = ProductListing(categoryId, sortBy, startIdx, itemsPerPage, null, false, false);
            if (!(resp is PartialViewResult))
            {
                return this.Request.CreateResponse(HttpStatusCode.OK, resp);

            }
             
            var result = ((PartialViewResult)resp).Model as ProductCollection;

             var feed = new SyndicationFeed(cat.Name, cat.Name, new Uri(feedUrl, ""));

            feed.Items = result.Items.Select(item =>
                {
                    var si = new SyndicationItem(
                        item.ProductName,
                        item.Content.ProductShortDescription + (item.Content.ProductImages.Main != null ? string.Format("<br /><img src=\"{0}\" />", new Uri(feedUrl, item.Content.ProductImages.Main.ImageUrl)) : ""),
                        
                        
                        new Uri(feedUrl, "/product/"+ item.ProductCode  ),
                        string.Format("{0}-{1}", item.ProductCode, item.CreateDate.Ticks  /* TODO: replace with ModifiedDate */),
                        item.CreateDate /* TODO: replace with ModifiedDate */
                        );
                    item.Categories.ForEach(itemCat => si.Categories.Add(new SyndicationCategory(itemCat.Name)));
                    return si;
                });

            // Pagination

            if (result.CurrentPage>1)
            {
                var idx = Math.Min(0, result.StartIndex - result.PageSize);
                var uri = new Uri(feedUrl, "?startIndex=" + idx);
                feed.Links.Add(new SyndicationLink(uri) { RelationshipType = "prev" });
            }
            if (result.CurrentPage < result.PageCount)
            {
                var idx = result.StartIndex + result.PageSize;
                var uri = new Uri(feedUrl, "?startIndex=" + idx);
                feed.Links.Add(new SyndicationLink(uri) { RelationshipType = "next" });
            }

            var res= new RssActionResult() { Feed = feed };
            return this.Request.CreateResponse(HttpStatusCode.OK, res);

        }

        /// <summary>
        /// Updates the SiteContext.CatalogContext with the current product.
        /// </summary>
        private void SetCatalogContext(Product product)
        {
           // _ctx.CatalogContext.CurrentProduct = product;
            NavigationContext.SetContext(product);
        }

        private void SetCatalogContext(Category category)
        {
            NavigationContext.SetContext(category);
        }
       
    }
}
