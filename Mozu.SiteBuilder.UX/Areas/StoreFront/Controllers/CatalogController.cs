using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Mozu.Core;
using Mozu.Core.Api.Serialization;
using Mozu.Core.Expressions;
using Mozu.Core.Extensions;
using Mozu.Core.Logging;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.Caching;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Helpers;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Filters;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.ServiceModel.Syndication;
using System.Threading.Tasks;
using Mozu.SiteBuilder.Mvc.Middleware;
using IProductWebApiClient = Mozu.ProductRuntime.Contracts.Clients.IProductRuntimeWebApiClient;
using Mozu.SiteBuilder.Mvc.OAF;
using Mozu.Core.Actions;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [NoSslActionFilter]
    [ContextInitialization]
    [DataViewModeEnforcement]
    [SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController, Priority = ActionFilterConstants.GlobalPageBeforePriority)]
    [SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageAfterAction, executionType: ActionExtensionExecutionTypes.AfterController, Priority = ActionFilterConstants.GlobalPageAfterPriority)]
    public class CatalogController : BaseApiController
    {
      
        readonly ICategoryTreeProvider _categoryTreeProvider;
        readonly IProductWebApiClient _productClient;
        readonly IProductSearchWebApiClient _searchClient;
       
        readonly ICustomRouteHandler _customRouteHandler;
        private readonly IStorefrontCache _storeFrontCache;
        private readonly UrlHelper _urlhelper;
        private readonly Lazy<ExpressionEvaluatorVisitor<CmsPageRuleContext>> _pageRuleVisitor;
        private readonly Lazy<IExpressionEvaluator> _expressionEvaluator;
        private static readonly JsonSerializer ProductSerializer = JsonSerializer.Create(new JsonSerializerSettings { Converters = new List<JsonConverter> { new ExpandoObjectConverter() }, ContractResolver = new CamelCaseResolver() });
        private readonly ILogger _logger;
        public CatalogController(ICategoryTreeProvider categoryTreeProvider, IProductWebApiClient productClient,
            IProductSearchWebApiClient searchClient, ICustomRouteHandler customRouteHandler,
            IStorefrontCache storeFrontCache, UrlHelper urlhelper,
            Lazy<ExpressionEvaluatorVisitor<CmsPageRuleContext>> pageRuleVisitor,
            Lazy<IExpressionEvaluator> expressionEvaluator, ILogger<CatalogController> logger)
        {
            _categoryTreeProvider = categoryTreeProvider;
            _searchClient = searchClient;
            _productClient = productClient;
            _logger = logger;
            _customRouteHandler = customRouteHandler;
            _storeFrontCache = storeFrontCache;
            _urlhelper = urlhelper;
            _pageRuleVisitor = pageRuleVisitor;
            _expressionEvaluator = expressionEvaluator;
        }

        /// <summary>
        /// Retrieves information about a single product given its product code.  
        /// </summary>
        /// <param name="productCode">Required. Merchant-created code associated with the product, for example, a SKU. Max length: 30.</param>
        /// <param name="vpc">Optional vpc = variation product code. Merchant-created code associated with a specific product variation. Max length: #.</param>
        /// <returns>Returns information about a single product given its product code including its ... to be continued.</returns>
        [SbActionExtensionFilter(actionId: ActionFilterConstants.ProductDetailsBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController)]
        [SbActionExtensionFilter(actionId: ActionFilterConstants.ProductDetailsAfterAction, executionType: ActionExtensionExecutionTypes.AfterController)]
        [HttpHead]
        [HttpGet]
        public async Task<IActionResult> ProductDetail(string productCode, string vpc = null, string sliceValue = null)
        {
            var productResponse = await _productClient.GetProduct(productCode, vpc, 
                "Categories,Properties,Options", PageContext.IsEditMode, supressOutOfStock404: true, sliceValue:sliceValue).ConfigureAwait(false);

            if (!productResponse.ResponseMessage.IsSuccessStatusCode)
            {
                if (productResponse.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
                {
                    // show detailed error message if previewing from Admin
                    if (this.SbApiContext.DataViewMode != DataViewModeType.Pending)
                        return NotFound("Product not found");
                    if (!productResponse.HasException) return NotFound("Product not found");
                    var ex = productResponse.ReadException();
                    return NotFound(ex);
                }
            }

            var prod = await productResponse.ReadAsAsync();

            var product = Mapper.Map<Product>(prod);
            //todo... ugh.. too many maps.
            var redirect =
                _customRouteHandler.RedirectWithContext(Request, FancyRoute.ProductDetails,
                        () => Mapper.Map<IDictionary<string, object>>(product));
            if (redirect != null)
            {
                return redirect;
            }

            if (Request.Method == HttpMethod.Head.Method)
            {
                return Ok();
            }

            PageContext.PageType = "product";
            PageContext.ProductCode = productCode;
            PageContext.MetaDescription = prod.Content.MetaTagDescription;
            PageContext.MetaTitle = prod.Content.MetaTagTitle;
            PageContext.MetaKeywords = prod.Content.MetaTagKeywords;
            PageContext.CmsContext ??= new CmsPageContext();
            PageContext.CmsContext.Page = new DocumentRequest
            {
                Path = "product-" + productCode,
                ListFQN = "catalogContent@mozu",
                DocumentTypeFQN = "productContent@mozu",
                IncludeInactiveDocument = PageContext.IsEditMode
            };
            PageContext.CmsContext.Template = new DocumentRequest
            {
                Path = "product",
                ListFQN = "pageTemplateContent@mozu",
                IncludeInactiveDocument = PageContext.IsEditMode
            };

            await GetContextInitializationTasks();

            PageContext.CmsContext.Template = new DocumentRequest
            {
                Path = PageContext.CmsContext.Page.Document.Get<string>("page_type_definition", "product"),
                IncludeInactiveDocument = PageContext.IsEditMode
            };


            PageContext.CrawlerInfo.CanonicalUrl = _urlhelper.MakeUrl(UrlHelper.UrlType.Product, product, null);
       

            var template = PageContext.CmsContext.Page.GetTemplate(SiteContext, "product");

            
            SetCatalogContext(product);
            var dynamicProd = JObject.FromObject(product, ProductSerializer).ToObject<ExpandoObject>(ProductSerializer);
            var result = View(template, dynamicProd);
            return Ok(result);
        }

        [HttpGet]
        public async Task<UX.Models.StoreFront.Catalog.ProductCollection> ProductListing(int? categoryId = null, string sortBy = null, int? startIdx = null, int? itemsPerPage = null, List<object> productCodes = null, bool? includeFacets = null, bool? useUrlParams = null)
        {
            categoryId = categoryId.GetValueOrDefault(-1) < 1 ? null : categoryId;
            if (useUrlParams.GetValueOrDefault(false))
            {
                string itemsPerPageParam = Request.Query["pageSize"];
                string startIndexParam = Request.Query["startIndex"];
                itemsPerPage = string.IsNullOrWhiteSpace(itemsPerPageParam) ? Convert.ToInt32(SiteContext.ThemeSettings["defaultPageSize"]) : Convert.ToInt32(itemsPerPageParam);
                startIdx = string.IsNullOrWhiteSpace(startIndexParam) ? 0 : Convert.ToInt32(startIndexParam);
            }
            else
            {
                itemsPerPage = itemsPerPage.GetValueOrDefault(Convert.ToInt32(SiteContext.ThemeSettings["defaultPageSize"]));
                startIdx = startIdx.GetValueOrDefault(0);
            }
            var recurse = categoryId.HasValue;
            string filter = null;
            if (productCodes != null && productCodes.Count > 0)
            {
                var productCodes2 = productCodes.Select(x => x.ToString()).Where(x => !string.IsNullOrWhiteSpace(x)).Select(x =>
                    $"productCode eq {x}").ToList();
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

            var isVolumePricingBandsEnabled = ((bool?)SiteContext.ThemeSettings["listVolumePricing"]);
            var responseOptions = isVolumePricingBandsEnabled.GetValueOrDefault() ? "volumePriceBands" : null;

            if (includeFacets.GetValueOrDefault(false) && categoryId.HasValue)
            {
                string facetValueFilter = Request.Query["facetValueFilter"];
                var pcDC = await (await _searchClient.Search(query: "*:*", filter: filter, startIndex: startIdx, pageSize: itemsPerPage, sortBy: sortBy, facetTemplate: "categoryId:" + categoryId, facetHierValue: "categoryId:" + categoryId, facetHierDepth: "categoryId:2", facetValueFilter: facetValueFilter, responseOptions: responseOptions)).ReadAsAsync();
                var pc = Mapper.Map<UX.Models.StoreFront.Catalog.ProductSearchResult>(pcDC);
                pc.Init(true, this.PageContext.Search);
                return pc;
            }
            else
            {
                var pcDC = await (await _productClient.GetProducts(filter: filter, startIndex: startIdx, pageSize: itemsPerPage, sortBy: sortBy, responseOptions: responseOptions)).ReadAsAsync();
                var pc = Mapper.Map<UX.Models.StoreFront.Catalog.ProductCollection>(pcDC);
                pc.Init(true, this.PageContext.Search);
                return pc;
            }
        }

        [HttpGet]
        public async Task<IActionResult> Store()
        {
            var catList = _categoryTreeProvider.GetAllCategories();
            var cat = new Category
            {
                Content = new CategoryContent { Name = "Store" }
            };
            PageContext.PageType = "category";
            PageContext.CategoryId = -1;
            cat.ChildrenCategories = catList.AllCategories.Where(x => x.ParentCategory == null).ToList();
            return await Task.Run(() => View("Category", cat));
        }



        bool ShouldAddCrawlerLinks()
        {

            if (PageContext.Search.Facets != null && PageContext.Search.Facets.Count > 0)
            {
                return false;
            }
            var defaultPageSize = SiteContext.ThemeSettings.GetInt("defaultPageSize");

            if (PageContext.Search.PageSize.HasValue && defaultPageSize.GetValueOrDefault(0) != PageContext.Search.PageSize.Value)
            { 
                return false;
            }

            var defaultSortOrder = ((string)SiteContext.ThemeSettings["defaultSort"]);
            if (!string.IsNullOrEmpty(PageContext.Search.SortBy) && !string.Equals(defaultSortOrder, PageContext.Search.SortBy))
            { 
                return false;
            }

            return true;
        }
        
      
        async Task<Category> AddCrawlerLinks(Category category)
        {
            //var catDic = new Lazy<IDictionary<string, object>>(() => Mapper.Map<IDictionary<string, object>>(category));

            //var categoryDictionary = Mapper.Map<IDictionary<string, object>>(category);

            var urlBase = (_customRouteHandler.GetCanonicalUrl(FancyRoute.Category, () => new Dictionary<string, object>(), true)) ?? category.Url;

            PageContext.CrawlerInfo.CanonicalUrl = PageContext.Search.ToUrl(new SearchContextOverrides() { UrlBase = urlBase });

            var pageLimit = DeepPagingLimitingMiddleware.GetPageLimit(Mozu.Core.Settings.MozuConfigurationManager.Settings);
            var defaultPageSize = PageContext.Search.PageSize  ??  SiteContext.ThemeSettings.GetInt("defaultPageSize") ?? 15;
            var currentIdx = PageContext.Search.StartIndex.GetValueOrDefault(0);

            if (PageContext.Search.StartIndex.GetValueOrDefault(0) > 0)
            {
                var previousIdx = Math.Max(0, currentIdx - defaultPageSize);
                PageContext.CrawlerInfo.PreviousUrl = PageContext.Search.ToUrl(new SearchContextOverrides() { UrlBase = urlBase, StartIndex = previousIdx });
            }
            var key = "categoryproductcount-" + category.Id;
            var totCount = _storeFrontCache.Get<int?>(key);
            if (!totCount.HasValue)
            {
                try
                {
                    totCount = (await _searchClient.Search(
                        query: "*:*",
                        pageSize: 0,
                        filter: "categoryId req " + category.Id).ConfigureAwait(false)).ReadAsSync()?.TotalCount ?? 0;

                    _storeFrontCache.Set(key, totCount.GetValueOrDefault(0));
                }
                catch (Exception ex)
                {
                    _logger.Warn(ex.Message);
                    _storeFrontCache.Set(key, 0);
                }
                   
            }

            if (currentIdx + defaultPageSize >= totCount.GetValueOrDefault(0) ||
                currentIdx / defaultPageSize >= pageLimit) return category;

            var nextIndx = currentIdx + defaultPageSize;
            PageContext.CrawlerInfo.NextUrl = PageContext.Search.ToUrl(new SearchContextOverrides() { UrlBase = urlBase, StartIndex = nextIndx });

            return category;

        }


        [SbActionExtensionFilter(actionId: ActionFilterConstants.CategoryBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController)]
        [SbActionExtensionFilter(actionId: ActionFilterConstants.CategoryAfterAction, executionType: ActionExtensionExecutionTypes.AfterController)]
        [HttpHead]
        [HttpGet]
        public async Task<IActionResult> Category(int? categoryId = null, string categoryCode=null, string categorySlug = null, string variationId = "")
        {

            var catTree = ( _categoryTreeProvider.GetAllCategories());
            var cat = catTree.FindById(categoryId) ?? catTree.FindByCode(categoryCode) ?? catTree.FindBySlug(categorySlug)?.FirstOrDefault();
            if (cat == null)
            {
                return NotFound("category not found");
            }

            if (!string.IsNullOrEmpty(variationId))
            {
                PageContext.VariationId = variationId;
            }

            var redirect =  _customRouteHandler.RedirectWithContext(Request, FancyRoute.Category, () => Mapper.Map<IDictionary<string,object>>(cat));
            if (redirect != null)
            {
                return redirect;
            }
            if (Request.Method == HttpMethod.Head.Method)
            {
                return Ok();
            }

            PageContext.PageType = "category";
            PageContext.CategoryId = cat.CategoryId;
            PageContext.CategoryCode = cat.CategoryCode;
            PageContext.FeedUrl = "/feeds/category/" + cat.CategoryId;

            PageContext.MetaDescription = cat.Content.MetaTagDescription;
            PageContext.MetaTitle = cat.Content.MetaTagTitle;
            PageContext.MetaKeywords = cat.Content.MetaTagKeywords;
            PageContext.Title = cat.Name;
            PageContext.CmsContext ??= new CmsPageContext();
            PageContext.CmsContext.Page = new DocumentRequest
            {
                Path = "category-" + cat.CategoryId.ToString(),
                ListFQN = "catalogContent@mozu",
                DocumentTypeFQN = "categoryContent@mozu",
                IncludeInactiveDocument = PageContext.IsEditMode
            };
            PageContext.CmsContext.Template = new DocumentRequest()
            {
                Path = "category",
                ListFQN = "pageTemplateContent@mozu",

            };

            await Task.WhenAll(GetContextInitializationTasks());

            //await _expressionEvaluator.Value.EvaluatePageRules(PageContext, _pageRuleVisitor.Value);

            PageContext.CmsContext.Template = new DocumentRequest
            {
                Path = PageContext.CmsContext.Page.Document.Get<string>("page_type_definition", "category"),
                IncludeInactiveDocument = PageContext.IsEditMode
            };


            var template = this.PageContext.CmsContext.Page.GetTemplate(this.SiteContext, "category");

            var result = View(template, cat);

            SetCatalogContext(cat);

            if (ShouldAddCrawlerLinks())
            {
                await AddCrawlerLinks(cat).ConfigureAwait(false);
            }

            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> CategoryFeed(int? categoryId = null)
        {
            var itemsPerPage = 10;
            var startIdx = 0;
            // TODO: Sort by Date Last Modified DESC
            string sortBy = null; // "CreateDate DESC";

            var catList = _categoryTreeProvider.GetAllCategories().AllCategories;
            var cat = catList.FirstOrDefault(x => x.CategoryId == categoryId.GetValueOrDefault(-1));
            if (cat == null)
            {
                return NotFound("category not found");
            }

            var feedUrl = new Uri(PageContext.Url);
            int.TryParse(Request.Query["startIndex"], out startIdx);

            // Get Results and populate feed
            var result = await ProductListing(categoryId, sortBy, startIdx, itemsPerPage, null, false, false);
            var feed = new SyndicationFeed(cat.Name, cat.Name, new Uri(feedUrl, ""))
            {
                Items = result.Items.Select(item =>
                {
                    var si = new SyndicationItem(
                        item.ProductName,
                        item.Content.ProductShortDescription + (item.Content.ProductImages.Main != null
                            ? $"<br /><img src=\"{new Uri(feedUrl, item.Content.ProductImages.Main.ImageUrl)}\" />"
                            : ""),
                        new Uri(feedUrl, "/product/" + item.ProductCode),
                        $"{item.ProductCode}-{item.CreateDate.Ticks}",
                        item.UpdateDate /* TODO: replace with ModifiedDate UPDATE:20200410:Cole:Done */
                    );
                    item.Categories.ForEach(itemCat => si.Categories.Add(new SyndicationCategory(itemCat.Name)));
                    return si;
                })
            };

            // Pagination
            if (result.CurrentPage > 1)
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

            var res = new RssActionResult { Feed = feed };
            return Ok(res);
        }

        /// <summary>
        ///     Updates the SiteContext.CatalogContext with the current product.
        /// </summary>
        private void SetCatalogContext(Product product)
        {
            NavigationContext.SetContext(product);
        }

        private void SetCatalogContext(Category category)
        {
            NavigationContext.SetContext(category);
        }
    }
}