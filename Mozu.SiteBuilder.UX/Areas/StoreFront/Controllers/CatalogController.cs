using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.ServiceModel.Syndication;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Routing;
using System.Web.UI;
using AutoMapper;
using Autofac;
using Mozu.Core;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Extensions;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.MessageHandler;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using IProductWebApiClient = Mozu.ProductRuntime.Contracts.Clients.IProductRuntimeWebApiClient;
using ProductCollection = Mozu.ProductRuntime.Contracts.ProductCollection;
using ProductSearchResult = Mozu.ProductRuntime.Contracts.ProductSearchResult;
using Mozu.SiteBuilder.Mvc.Models.CMS;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [NoSslActionFilter]
    [ContextInitialization]

    public class CatalogController : BaseApiController
    {
        private readonly ISiteBuilderApiContext _apiCtx;
        private readonly ICategoryTreeProvider _categoryTreeProvider;
        private readonly IProductWebApiClient _productClient;
        private readonly IProductSearchWebApiClient _searchClient;
        private readonly ISlugNormalizer _slugNormalizer;

        public CatalogController(ICategoryTreeProvider categoryTreeProvider, ISiteBuilderApiContext apiCtx, IProductWebApiClient productClient, IProductSearchWebApiClient searchClient, ILifetimeScope lifetimeScope, ISlugNormalizer slugNormalizer)
        {
            _categoryTreeProvider = categoryTreeProvider;
            _searchClient = searchClient;
            _slugNormalizer = slugNormalizer;
            _productClient = productClient;
            _apiCtx = apiCtx;
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
            ProductRuntime.Contracts.Product prod =  await res.ReadAsAsync();
            var product = Mapper.Map<Product>(prod);

            HttpResponseMessage msg;
            if (RedirectToCanonicle(product.Url , out msg))
            {
                return msg;
            }


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
                                                            ListFQN = "catalogContent@mozu",
                                                            DocumentTypeFQN = "productContent@mozu"
                                                        }
                                         };

            await ContextInitilaztionTasks;

            string template = this.PageContext.CmsContext.Page.GetTemplate(this.SiteContext, "product");
            var  result = View(template, product);

           
           
            
            SetCatalogContext( product );

            return Request.CreateResponse(HttpStatusCode.OK, result);
        }

        [HttpGet]
        public async Task<Models.StoreFront.Catalog.ProductCollection> ProductListing(int? categoryId = null, string sortBy = null, int? startIdx = null, int? itemsPerPage = null, List<object> productCodes = null, bool? includeFacets = null, bool? useUrlParams = null)
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
           
                if (includeFacets.GetValueOrDefault(false) && categoryId.HasValue)
                {
                    string facetValueFilter = HttpRequestBase.QueryString["facetValueFilter"];
                    ProductSearchResult pcDC = await (await _searchClient.Search(query: "*:*", filter: filter, startIndex: startIdx, pageSize: itemsPerPage, sortBy: sortBy, facetTemplate: "categoryId:" + categoryId, facetHierValue: "categoryId:" + categoryId, facetHierDepth: "categoryId:2", facetValueFilter: facetValueFilter)).ReadAsAsync();
                    var pc = Mapper.Map<Models.StoreFront.Catalog.ProductSearchResult>(pcDC);
                    return pc;
                }
                else
                {
                    ProductCollection pcDC = await (await _productClient.GetProducts(filter: filter, startIndex: startIdx, pageSize: itemsPerPage, sortBy: sortBy, responseGroups: "Categories,Measurements,Properties,Options")).ReadAsAsync();
                    var pc = Mapper.Map<Models.StoreFront.Catalog.ProductCollection>(pcDC);
                    return pc;
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
            HttpResponseMessage msg;
            if (RedirectToCanonicle(cat.Url , out msg))
            {
                return msg;
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
                                                            ListFQN = "catalogContent@mozu",
                                                            DocumentTypeFQN = "categoryContent@mozu"
                                                         
                                                        }
                                         };

            await ContextInitilaztionTasks;

            string template = this.PageContext.CmsContext.Page.GetTemplate(this.SiteContext, "category");
            var result = View(template, cat);

            
            SetCatalogContext(cat);

            return Request.CreateResponse(HttpStatusCode.OK, result);

        }
        private bool RedirectToCanonicle(string url, out HttpResponseMessage msg)
        {
            msg = null;
            var requestUrl = this.Request.RequestUri.AbsolutePath;
            var cleanedRequestUrl = _slugNormalizer.StripUrl(requestUrl);
            var cleanedUrl = _slugNormalizer.StripUrl(url);



            if (!this.SiteContext.IsEditMode && !string.Equals(cleanedRequestUrl, cleanedUrl, StringComparison.OrdinalIgnoreCase) && !SeoDelegatingHandler.IsSeoRewrite(this.Request))
            {
                msg = this.Request.CreateResponse(HttpStatusCode.MovedPermanently);
                if (!string.IsNullOrEmpty(this.Request.RequestUri.Query))
                {
                    var qs = this.Request.GetQueryNameValuePairs().ToArray();
                    if ( ! (qs.Length == 1 &&  qs[0].Key.Equals("productcode", StringComparison.OrdinalIgnoreCase ) ))
                    {
                        url = url + this.Request.RequestUri.Query;    
                    }
                    
                }
                msg.Headers.Location = new Uri(url, UriKind.Relative);
                return true;
            }
            return false;
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

            var result = await  ProductListing(categoryId, sortBy, startIdx, itemsPerPage, null, false, false);
            

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