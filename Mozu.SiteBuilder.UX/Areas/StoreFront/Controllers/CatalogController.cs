using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.ServiceModel.Syndication;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Routing;
using AutoMapper;
using Autofac;
using Mozu.Core;
using Mozu.Core.Api.Contracts.Client;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using IProductWebApiClient = Mozu.ProductRuntime.Contracts.Clients.IProductRuntimeWebApiClient;
using ProductCollection = Mozu.ProductRuntime.Contracts.ProductCollection;
using ProductSearchResult = Mozu.ProductRuntime.Contracts.ProductSearchResult;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [SslOnlyActionFilter]
    [InitCmsPageContextActionFilter]
    public class CatalogController : BaseApiController
    {
        private readonly ISiteBuilderApiContext _apiCtx;
        private readonly ICategoryTreeProvider _categoryTreeProvider;
        private readonly IProductWebApiClient _productClient;
        private readonly IProductSearchWebApiClient _searchClient;

        public CatalogController(ICategoryTreeProvider categoryTreeProvider, ISiteBuilderApiContext apiCtx, IProductWebApiClient productClient, IProductSearchWebApiClient searchClient, ILifetimeScope lifetimeScope)
        {
            _categoryTreeProvider = categoryTreeProvider;
            _searchClient = searchClient;
            _productClient = productClient;
            _apiCtx = apiCtx;
        }

        private RequestContext RequestContext
        {
            get { return new RequestContext(HttpContext, new RouteData()); }
        }

        [HttpGet]
        public async Task<HttpResponseMessage> ProductDetail(string productCode)
        {
            ServiceClientResponse<ProductRuntime.Contracts.Product> res = await _productClient.GetProduct(productCode, null, "Categories,Properties,Options", PageContext.IsEditMode);

            if (!res.ResponseMessage.IsSuccessStatusCode)
            {
                if (res.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
                {
                    // show detailed error message if previewing from Admin
                    if (_apiCtx.DataViewMode == DataViewModeType.Pending)
                    {
                        if (res.HasException)
                        {
                            Exception ex = res.ReadException();
                            return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Product not found.", ex);
                        }
                    }
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Product not found");
                }
            }
            ProductRuntime.Contracts.Product prod = res.ReadAsAsync().Result;
            var product = Mapper.Map<Product>(prod);

            SetCatalogContext(product);

            PageContext.PageType = "product";
            PageContext.ProductCode = productCode;
            PageContext.MetaDescription = prod.Content.MetaTagDescription;
            PageContext.MetaTitle = prod.Content.MetaTagTitle;
            PageContext.MetaKeywords = prod.Content.MetaTagKeywords;


            PageContext.CmsContext = new CmsPageContext
                                         {
                                             Template = new DocumentRequest
                                                            {
                                                                Path = "product"
                                                            },
                                             Page = new DocumentRequest
                                                        {
                                                            Path = "product-" + productCode,
                                                            Collection = "catalog_pages",
                                                            DocumentType = "catalog_page"
                                                        }
                                         };
            ViewResult result = View("product", product);

            await InitCmsContext();
            var overrideTemplate = PageContext.CmsContext.Page.Document.Get<string>("template");
            if (!string.IsNullOrEmpty(overrideTemplate))
            {
                var template = this.SiteContext.Theme.PageTypes.FirstOrDefault(x => string.Equals(x.Id, overrideTemplate, StringComparison.OrdinalIgnoreCase));
                if (template != null)
                {
                    result.ViewName = template.Template ;    
                }
                
            }
            return Request.CreateResponse(HttpStatusCode.OK, result);
        }

        [HttpGet]
        public ActionResult ProductListing(int? categoryId = null, string sortBy = null, int? startIdx = null, int? itemsPerPage = null, List<object> productCodes = null, bool? includeFacets = null, bool? useUrlParams = null)
        {
            categoryId = categoryId.GetValueOrDefault(-1) < 1 ? null : categoryId;
            if (useUrlParams.GetValueOrDefault(false))
            {
                string itemsPerPageParam = HttpRequestBase.QueryString["pageSize"];
                string startIndexParam = HttpRequestBase.QueryString["startIndex"];
                itemsPerPage = String.IsNullOrWhiteSpace(itemsPerPageParam) ? Convert.ToInt32(SiteContext.ThemeSettings["defaultPageSize"]) : Convert.ToInt32(itemsPerPageParam);
                startIdx = String.IsNullOrWhiteSpace(startIndexParam) ? 0 : Convert.ToInt32(startIndexParam);
            }
            else
            {
                itemsPerPage = itemsPerPage.GetValueOrDefault(Convert.ToInt32(SiteContext.ThemeSettings["defaultPageSize"]));
                startIdx = startIdx.GetValueOrDefault(0);
            }
            bool recurse = categoryId.HasValue;
            string filter = null;
            if (productCodes != null && productCodes.Count > 0)
            {
                List<string> productCodes2 = productCodes.Select(x => x.ToString()).Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => string.Format("productCode eq {0}", x)).ToList();
                if (productCodes2.Count > 0)
                {
                    filter = string.Join(" or ", productCodes2);
                }

                itemsPerPage = productCodes.Count;
            }
            if (categoryId.HasValue)
            {
                if (!string.IsNullOrWhiteSpace(filter))
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
                if (includeFacets.GetValueOrDefault(false) && categoryId.HasValue)
                {
                    string facetValueFilter = HttpRequestBase.QueryString["facetValueFilter"];
                    ProductSearchResult pcDC = _searchClient.Search(query: "*:*", filter: filter, startIndex: startIdx, pageSize: itemsPerPage, sortBy: sortBy, facetTemplate: "categoryId:" + categoryId, facetHierValue: "categoryId:" + categoryId, facetHierDepth: "categoryId:2", facetValueFilter: facetValueFilter).Result.ReadAsSync();
                    var pc = Mapper.Map<Models.StoreFront.Catalog.ProductSearchResult>(pcDC);
                    return PartialView(pcDC);
                }
                else
                {
                    ProductCollection pcDC = _productClient.GetProducts(filter: filter, startIndex: startIdx, pageSize: itemsPerPage, sortBy: sortBy, responseGroups: "Categories,Measurements,Properties,Options").Result.ReadAsSync();
                    var pc = Mapper.Map<Models.StoreFront.Catalog.ProductCollection>(pcDC);
                    return PartialView(pc);
                }

                //`
                //pc.Paging.CurrentSort = sortBy;
                //pc.Paging.StartIndex = startIdx;
                //pc.Paging.UrlBase = "?";
            }
            catch (Exception ex)
            {
                return new ContentResult {Content = "[product service error]: " + ex.Message};
            }
        }

        [HttpGet]
        public async Task<ActionResult> Store()
        {
            CategoryTree catList = await _categoryTreeProvider.GetAllCategories();
            var cat = new Category
                          {
                              Content = new CategoryContent {Name = "Store"}
                          };
            PageContext.PageType = "category";
            PageContext.CategoryId = -1;
            cat.ChildrenCategories = catList.Items.Where(x => x.ParentCategory == null).ToList();
            return View("Category", cat);
        }

   
        [HttpGet]
        public async Task<HttpResponseMessage> Category(int? categoryId = null, string sortBy = null, int? page = null, int? itemsPerPage = null)
        {
            PageContext.PageType = "category";
            PageContext.CategoryId = categoryId;


            Uri feedUrl = HttpRequestBase.Url;

            PageContext.FeedUrl = "/feeds/category/" + categoryId;


            List<Category> catList = (await _categoryTreeProvider.GetAllCategories()).Items;


            Category cat = catList.Where(x => x.CategoryId == categoryId.GetValueOrDefault(-1)).FirstOrDefault();
            //SiteContext.PageContext.WidgetCreationTags.Add("category-" + categoryId );
            //SiteContext.PageContext.WidgetQuery.Add("category");

            if (cat == null)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, "category not found");
            }


            PageContext.MetaDescription = cat.Content.MetaTagDescription;
            PageContext.MetaTitle = cat.Content.MetaTagTitle;
            PageContext.MetaKeywords = cat.Content.MetaTagKeywords;

            var lts = (ILifetimeScope) ControllerContext.Request.GetDependencyScope().GetService(typeof (ILifetimeScope));


            PageContext.Title = cat.Name;

            PageContext.CmsContext = new CmsPageContext
                                         {
                                             Template = new DocumentRequest
                                                            {
                                                                Path = "category"
                                                            },
                                             Page = new DocumentRequest
                                                        {
                                                            Path = "category-" + categoryId,
                                                            Collection = "catalog_pages",
                                                            DocumentType = "catalog_page"
                                                        }
                                         };

            ;

            SetCatalogContext(cat);

            ViewResult result = View(cat);


            await InitCmsContext();
            var overrideTemplate = PageContext.CmsContext.Page.Document.Get<string>("template");
            if (!string.IsNullOrEmpty(overrideTemplate))
            {
                var template = this.SiteContext.Theme.PageTypes.FirstOrDefault(x => string.Equals(x.Id, overrideTemplate, StringComparison.OrdinalIgnoreCase));
                if (template != null)
                {
                    result.ViewName = template.Template ;    
                }
                
            }


            return Request.CreateResponse(HttpStatusCode.OK, result);

            //.Result.ReadAsSync();
            //AutoMapper.Mapper.Map< Category>( cat );
            //return View();
        }


        [HttpGet]
        public async Task<HttpResponseMessage> CategoryFeed(int? categoryId = null)
        {
            int itemsPerPage = 10;
            int startIdx = 0;
            // TODO: Sort by Date Last Modified DESC
            string sortBy = null; // "CreateDate DESC";

            List<Category> catList = (await _categoryTreeProvider.GetAllCategories()).Items;
            Category cat = catList.Where(x => x.CategoryId == categoryId.GetValueOrDefault(-1)).FirstOrDefault();
            if (cat == null)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, "category not found");
            }

            Uri feedUrl = HttpRequestBase.Url;
            Int32.TryParse(HttpRequestBase.QueryString["startIndex"], out startIdx);

            // Get Results and populate feed

            ActionResult resp = ProductListing(categoryId, sortBy, startIdx, itemsPerPage, null, false, false);
            if (!(resp is PartialViewResult))
            {
                return Request.CreateResponse(HttpStatusCode.OK, resp);
            }

            var result = ((PartialViewResult) resp).Model as Models.StoreFront.Catalog.ProductCollection;

            var feed = new SyndicationFeed(cat.Name, cat.Name, new Uri(feedUrl, ""));

            feed.Items = result.Items.Select(item =>
                {
                    var si = new SyndicationItem(
                        item.ProductName,
                        item.Content.ProductShortDescription + (item.Content.ProductImages.Main != null ? string.Format("<br /><img src=\"{0}\" />", new Uri(feedUrl, item.Content.ProductImages.Main.ImageUrl)) : ""),
                        new Uri(feedUrl, "/product/" + item.ProductCode),
                        string.Format("{0}-{1}", item.ProductCode, item.CreateDate.Ticks /* TODO: replace with ModifiedDate */),
                        item.CreateDate /* TODO: replace with ModifiedDate */
                        );
                    item.Categories.ForEach(itemCat => si.Categories.Add(new SyndicationCategory(itemCat.Name)));
                    return si;
                });

            // Pagination

            if (result.CurrentPage > 1)
            {
                int idx = Math.Min(0, result.StartIndex - result.PageSize);
                var uri = new Uri(feedUrl, "?startIndex=" + idx);
                feed.Links.Add(new SyndicationLink(uri) {RelationshipType = "prev"});
            }
            if (result.CurrentPage < result.PageCount)
            {
                int idx = result.StartIndex + result.PageSize;
                var uri = new Uri(feedUrl, "?startIndex=" + idx);
                feed.Links.Add(new SyndicationLink(uri) {RelationshipType = "next"});
            }

            var res = new RssActionResult {Feed = feed};
            return Request.CreateResponse(HttpStatusCode.OK, res);
        }

        /// <summary>
        ///     Updates the SiteContext.CatalogContext with the current product.
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