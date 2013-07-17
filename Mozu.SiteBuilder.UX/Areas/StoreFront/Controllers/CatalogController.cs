using AutoMapper;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.ServiceModel.Syndication;
using System.Threading.Tasks;
using System.Web.Mvc;
using IProductWebApiClient = Mozu.ProductRuntime.Contracts.Clients.IProductRuntimeWebApiClient;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    public class CatalogController : BaseController
    {
        IProductWebApiClient   _productClient;
        IProductSearchWebApiClient _searchClient;
        ISiteBuilderContext _ctx;
        public CatalogController(ISiteBuilderContext ctx , IProductWebApiClient productClient, IProductSearchWebApiClient searchClient)
        {
            _ctx = ctx;
            _searchClient = searchClient;
            _productClient = productClient;

        }

        public async Task<ActionResult> ProductDetail(string productCode)
        {
            var res = await _productClient.GetProduct(productCode, null, "Categories,Properties,Options", _ctx.IsEditMode);
        
            if ( !res.ResponseMessage.IsSuccessStatusCode )
            {
                if (res.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
                {
                    return new HttpNotFoundResult();
                }
               
            }
            var prod = res.ReadAsAsync().Result;
            var product = Mapper.Map<Models.StoreFront.Catalog.Product>(prod);

            SetCatalogContext(product);

            SiteContext.PageContext.PageType = "product";
            SiteContext.PageContext.ProductCode = productCode;


            SiteContext.PageContext.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = "product"
                }

            };


            await this.AsyncInitData();

            //SiteContext.PageContext.WidgetCreationTags.Add ("product-" + productCode);
            //SiteContext.PageContext.WidgetQuery.Add ("product");


            return View("product", prod);
        }

        public ActionResult ProductListing(int? categoryId= null , string sortBy = null, int? startIdx = null, int? itemsPerPage = null,  List<object> productCodes = null , bool? includeFacets=null, bool? useUrlParams=null)
        {

            categoryId = categoryId.GetValueOrDefault(-1) <1  ? null : categoryId;
            if (useUrlParams.GetValueOrDefault(false)) {
                var itemsPerPageParam = Request.QueryString["pageSize"];
                var startIndexParam = Request.QueryString["startIndex"];
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
                    string facetValueFilter = Request.QueryString["facetValueFilter"];
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

        public ActionResult Store ()
        {
            var catList = _ctx.CatalogContext.AllCategories;
            var cat = new Category()
            {
                Content = new CategoryContent (){Name = "Store"}
               
            };
            this.SiteContext.PageContext.PageType = "category";
            SiteContext.PageContext.CategoryId = -1;
            cat.ChildrenCategories = catList.Where(x => x.ParentCategory == null).ToList();
            return View("Category", cat);
        }

   


        public async Task<ActionResult> Category(int? categoryId = null, string sortBy = null, int? page = null, int? itemsPerPage = null )
        {
            _ctx.PageContext.PageType = "category";
            _ctx.PageContext.CategoryId = categoryId;
            var catList = _ctx.CatalogContext.AllCategories;



            var cat = catList.Where(x => x.CategoryId == categoryId.GetValueOrDefault (-1)).FirstOrDefault();
            //SiteContext.PageContext.WidgetCreationTags.Add("category-" + categoryId );
            //SiteContext.PageContext.WidgetQuery.Add("category");

            if (cat == null)
            {
               return new HttpNotFoundResult();
                 
            }

            SiteContext.PageContext.CmsContext = new CmsPageContext()
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

            await this.AsyncInitData(); 
            return View(cat);
          
            //.Result.ReadAsSync();
            //AutoMapper.Mapper.Map< Category>( cat );
            //return View();
        }



        public ActionResult CategoryFeed(int? categoryId = null)
        {
            var itemsPerPage = 10;
            var startIdx = 0;
            // TODO: Sort by Date Last Modified DESC
            string sortBy = null;
            var cat = _ctx.CatalogContext.AllCategories.Where(x => x.CategoryId == categoryId.GetValueOrDefault (-1)).FirstOrDefault();
            if (cat == null)
            {
                return new HttpNotFoundResult();
            }
            var helper = new UrlHelper(ControllerContext.RequestContext);
            var feedUrl = ControllerContext.RequestContext.HttpContext.Request.Url;
            Int32.TryParse(Request.QueryString["startIndex"], out startIdx);

            // Get Results and populate feed

            var resp = ProductListing(categoryId, sortBy, startIdx, itemsPerPage, null, false, false);
            var result = (ProductCollection)((PartialViewResult)resp).Model;
            var feed = new SyndicationFeed(cat.Name, cat.Name, new Uri(feedUrl, helper.RouteUrl("StoreFront_home")));

            feed.Items = result.Items.Select(item =>
                {
                    var si = new SyndicationItem(
                        item.ProductName,
                        item.Content.ProductShortDescription + (item.Content.ProductImages.Main != null ? string.Format("<br /><img src=\"{0}\" />", new Uri(feedUrl, item.Content.ProductImages.Main.ImageUrl)) : ""),
                        new Uri(feedUrl, helper.RouteUrl("StoreFront_productDetails", new { ProductCode = item.ProductCode }) ),
                        item.ProductCode, item.CreateDate
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

            return new RssActionResult() { Feed = feed };
        }

        /// <summary>
        /// Updates the SiteContext.CatalogContext with the current product.
        /// </summary>
        private void SetCatalogContext(Product product)
        {
            _ctx.CatalogContext.CurrentProduct = product;
            _ctx.Navigation.SetContext(product);
        }

        private void SetCatalogContext(Category category)
        {
            _ctx.Navigation.SetContext(category);
        }
       
    }
}
