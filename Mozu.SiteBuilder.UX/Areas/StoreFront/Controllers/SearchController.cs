using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using Mozu.SiteBuilder.UX.Filters;
using Mozu.Core.Actions;
using Mozu.SiteBuilder.Mvc.OAF;
using Mozu.SiteBuilder.Mvc.SEO;
using System.Collections.Generic;
using System;
using Mozu.SiteBuilder.Mvc.Catalog;
using System.IO;
using System.Linq;
using System.Reflection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Mozu.Core.Configuration;
using Mozu.SiteBuilder.Mvc;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ContextInitialization]
    [DataViewModeEnforcement]
    [SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageBeforeAction,
        executionType: ActionExtensionExecutionTypes.BeforeController, Priority =
            ActionFilterConstants.GlobalPageBeforePriority)]
    [SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageAfterAction,
        executionType: ActionExtensionExecutionTypes.AfterController, Priority =
            ActionFilterConstants.GlobalPageAfterPriority)]
    public class SearchController : BaseApiController
    {
        readonly IProductCategoryRuntimeWebApiClient _catClient;
        readonly ICustomRouteHandler _customRouteHandler;
        readonly IProductRuntimeWebApiClient _productClient;

        readonly IProductSearchWebApiClient _searchClient;
        readonly ICustomerSegmentPricingService _customerSegmentPricingService;

        public SearchController(IProductCategoryRuntimeWebApiClient catClient,
            IProductRuntimeWebApiClient productClient, IProductSearchWebApiClient searchClient,
            ICustomRouteHandler customRouteHandler,
            ICustomerSegmentPricingService customerSegmentPricingService)
        {
            _catClient = catClient;
            _productClient = productClient;
            _searchClient = searchClient;
            _customRouteHandler = customRouteHandler;
            _customerSegmentPricingService = customerSegmentPricingService;
        }

        [HttpOptions]
        public IActionResult OptionsIndex()
        {
            this.HttpContext.Response.Headers["Access-Control-Allow-Origin"] = "*";
            this.HttpContext.Response.Headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
            
            return Ok();
        }

        [SbActionExtensionFilter(actionId: ActionFilterConstants.SearchIndexBeforeAction,
            executionType: ActionExtensionExecutionTypes.BeforeController)]
        [SbActionExtensionFilter(actionId: ActionFilterConstants.SearchIndexAfterAction,
            executionType: ActionExtensionExecutionTypes.AfterController)]
        [HttpGet]
        [HttpOptions]
        public async Task<IActionResult> Index(
            string query = null,
            int? categoryId = null,
            string categoryCode = null,
            int? page = null,
            //adding w as an extra param for jelly belly.  Plan to remove in r6.1
            string w = null,
            string inStockLocation = null,
            [FromQuery] AdvancedSearchParamaters searchParams = null,
            [FromQuery(Name = "debug.explain.structured")]
            bool debug_explain_structure = false,
            [FromQuery(Name = "debug")] string debug = null)
        {
            
            if (string.Equals(this.HttpContext.Request.Method, "OPTIONS", StringComparison.OrdinalIgnoreCase))
            {
                return OptionsIndex();
            }

            var _ = searchParams;

            _.customerSegments  = await _customerSegmentPricingService.GetAllowedCustomerSegmentsAsString(_.customerSegments);

            //set back for post actions
            //todo:cole revisit for server-side JS
            //this.ActionContext.ActionArguments["query"] = query ?? _.query;
            //this.ActionContext.ActionArguments["categoryId"] = categoryId ?? this.PageContext.Search.CategoryId;
            PageContext.PageType = "search";

            var parsedFilter = _.filter;
            // use the inStockLocation - TODO: could make sure it isn't already in the _.filter already
            if (!string.IsNullOrWhiteSpace(inStockLocation))
            {
                var locationFilter = $"locationsinstock eq {inStockLocation}";
                parsedFilter = string.IsNullOrWhiteSpace(parsedFilter)
                    ? locationFilter
                    : $"(({_.filter}) and ({locationFilter}))";
            }

            if (debug_explain_structure)
            {
                var debugTxt = await (await _searchClient.SearchDebug(
                        query: _.query,
                        filter: parsedFilter,
                        facetTemplate: _.facetTemplate,
                        facetTemplateSubset: _.facetTemplateSubset,
                        facet: _.facet,
                        facetFieldRangeQuery: _.facetFieldRangeQuery,
                        facetHierPrefix: _.facetHierPrefix,
                        facetHierValue: _.facetHierValue,
                        facetStartIndex: _.facetStartIndex,
                        facetPageSize: _.facetPageSize,
                        cursorMark: _.cursorMark,
                        enableSearchTuningRules: _.enableSearchTuningRules,
                        facetHierDepth: _.facetHierDepth,
                        facetPrefix: _.facetPrefix,
                        facetSettings: _.facetSettings,
                        facetTemplateExclude: _.facetTemplateExclude,
                        facetValueFilter: _.facetValueFilter,
                        pageSize: _.pageSize,
                        searchSettings: _.searchSettings,
                        searchTuningRuleCode: _.searchTuningRuleCode,
                        searchTuningRuleContext: _.searchTuningRuleContext,
                        sortBy: _.sortBy,
                        startIndex: _.startIndex,
                        mid: this.PageContext.MonetateId,
                        targetContextLevel: _.targetContextLevel,
                        customerSegments: _.customerSegments))
                    .ResponseMessage
                    .Content
                    .ReadAsStringAsync();
                return CreateDebugResponse(debugTxt);
            }

            if (debug == "suggest.explain" || debug == "suggest.returnUrl")
            {
                var debugTxt = await (await _searchClient.SuggestDebug(
                        query: _.query,
                        pageSize: _.pageSize,
                        groups: _.groups,
                        searchSettingsName: _.searchSettings,
                        mid: this.PageContext.MonetateId,
                        returnUrl: debug == "suggest.returnUrl",
                        targetContextLevel: _.targetContextLevel,
                        customerSegments: _.customerSegments))
                    .ResponseMessage
                    .Content
                    .ReadAsStringAsync();
                return CreateDebugResponse(debugTxt);
            }
           // _.responseFields = "items(-categories,-measurements,content(-productFullDescription),*),facets(values(-childrenFacetValues,*),*)";

            var searchResponse = (await _searchClient.Search(
                query: _.query,
                filter: parsedFilter,
                facetTemplate: _.facetTemplate,
                facetTemplateSubset: _.facetTemplateSubset,
                facet: _.facet,
                facetFieldRangeQuery: _.facetFieldRangeQuery,
                facetHierPrefix: _.facetHierPrefix,
                facetHierValue: _.facetHierValue,
                facetStartIndex: _.facetStartIndex,
                facetPageSize: _.facetPageSize,
                cursorMark: _.cursorMark,
                enableSearchTuningRules: _.enableSearchTuningRules,
                facetHierDepth: _.facetHierDepth,
                facetPrefix: _.facetPrefix,
                facetSettings: _.facetSettings,
                facetTemplateExclude: _.facetTemplateExclude,
                facetValueFilter: _.facetValueFilter,
                pageSize: _.pageSize,
                responseFields: _.responseFields,
                responseGroups: _.responseGroups,
                responseOptions: _.responseOptions,
                searchSettings: _.searchSettings,
                searchTuningRuleCode: _.searchTuningRuleCode,
                searchTuningRuleContext: _.searchTuningRuleContext,
                sortBy: _.sortBy,
                startIndex: _.startIndex,
                mid: this.PageContext.MonetateId,
                targetContextLevel: _.targetContextLevel,
                spellcorrectOverride: _.spellcorrectOverride,
                customerSegments: _.customerSegments)).ReadAsSync();

            
            var pc = Mapper.Map<ProductSearchResult>(searchResponse);

            pc.Init(true, this.PageContext.Search);
            pc.UrlBase = "/search?query=" + _.query;
                        
            if (!String.IsNullOrEmpty(pc.SearchRedirect))
            {
                return Redirect(pc.SearchRedirect);
            }

            var searchPageType = pc.TotalCount > 0 
                ? "search-results" 
                : "no-search-results";

            PageContext.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = searchPageType,
                    DocumentTypeFQN = "pageTemplateContent@mozu",
                    IncludeInactiveDocument = PageContext.IsEditMode
                },
            };

            return Ok(View(searchPageType, pc));
        }

        SolrDebugActionResult CreateDebugResponse (string debugTxt)
        {
            var jsonPfn = Request.Query.Where(kvp => kvp.Key.Equals("json.wrf", StringComparison.OrdinalIgnoreCase)).Select(kvp=> kvp.Value).FirstOrDefault();

            var resp = new SolrDebugResp()
            {
                JsonPFn = jsonPfn,
                SolrDebug = debugTxt
            };

            return new SolrDebugActionResult(resp);
        }
        public class SolrDebugResp
        {
            public string SolrDebug;
            public string JsonPFn;
        }
        public class SolrDebugActionResult : IActionResult
        {
            private readonly SolrDebugResp _solrDebugResp;

            public SolrDebugActionResult(SolrDebugResp solrDebugResp)
            {
                _solrDebugResp = solrDebugResp;
            }

            public async Task ExecuteResultAsync(ActionContext context)
            {
                var response = context.HttpContext.Response;

                await using var sw = new StreamWriter(response.Body, Encoding.UTF8, 4096, true);
                if (!string.IsNullOrEmpty(_solrDebugResp.JsonPFn))
                {
                    await sw.WriteAsync($"{_solrDebugResp.JsonPFn}(");
                }
                await sw.WriteAsync(_solrDebugResp.SolrDebug);
                if (!string.IsNullOrEmpty(_solrDebugResp.JsonPFn))
                {
                    await sw.WriteAsync(");");
                }
            }
        }
        class AdvancdSearchParamterModelBinder : IModelBinder
        {
            static Lazy<Action<ModelBindingContext>>  _propBinder = new Lazy<Action<ModelBindingContext>>(CreatePropBinder);
            public static Action<ModelBindingContext> CreatePropBinder()
            {
                var binders =  typeof(AdvancedSearchParamaters).GetProperties().Select<PropertyInfo, Action<ModelBindingContext>>(prop =>
                {
                    if (prop.PropertyType == typeof(string))
                    {
                        return (ModelBindingContext ctx) =>
                        {
                            var propValRes = ctx.ValueProvider.GetValue(prop.Name);
                            if (propValRes != ValueProviderResult.None && !string.IsNullOrEmpty(propValRes.FirstValue))
                            {
                                prop.SetValue(ctx.Model, propValRes.FirstValue);
                            }
                        };
                    }
                    else
                    {
                        return (ModelBindingContext ctx) =>
                        {
                            var propValRes = ctx.ValueProvider.GetValue(prop.Name);
                            if (propValRes != ValueProviderResult.None && !string.IsNullOrEmpty(propValRes.FirstValue))
                            {
                                try
                                {
                                    var obj = Convert.ChangeType(propValRes.FirstValue, prop.PropertyType);
                                    prop.SetValue(ctx.Model, obj);
                                }
                                catch
                                {
                                }
                            }
                        };
                    }
                }).ToArray();
                return (ModelBindingContext ctx) =>
                {
                    foreach (var binder in binders)
                    {
                        binder(ctx);
                    }
                };
            }
            public Task BindModelAsync(ModelBindingContext bindingContext)
            {
                var actionContext = bindingContext.ActionContext;
                var categoryCode = default(string);
                var avp = new AdvancedSearchParamaters();
                bindingContext.Model = avp;

                _propBinder.Value(bindingContext);
                
                var sc = bindingContext.HttpContext.RequestServices.Resolve<ISiteContext>();
                var pc = bindingContext.HttpContext.RequestServices.Resolve<IPageContext>();
                var includeFacets = ((bool?)sc.ThemeSettings["showCategoryFacets"]);
                var includeCategoryCodeFacets = ((bool?)sc.ThemeSettings["showCategoryCodeFacets"]);
                var isVolumePricingBandsEnabled = ((bool?)sc.ThemeSettings["listVolumePricing"]);
                var pageStr = bindingContext.ValueProvider.GetValue("page");
                if (!int.TryParse(pageStr.FirstValue, out var pageInt))
                {
                    pageInt = 0;
                }

                avp.pageSize = pc.Search.PageSize;
                avp.startIndex = pc.Search.StartIndex;

                if (avp.pageSize == null)
                {
                    avp.pageSize = pc.Search.PageSize = ((int?)sc.ThemeSettings["defaultPageSize"]) ?? 20;
                }

                if (avp.startIndex == null && pageInt > 0)
                {
                    avp.startIndex = pc.Search.StartIndex = (pageInt - 1) * avp.pageSize;
                }

                avp.sortBy = pc.Search.SortBy;

                var query = (string)null;
                var res = bindingContext.ValueProvider.GetValue("query");
                if (res.Length > 0)
                {
                    query = res.FirstValue;
                }

                //need to support for jellybelly
                if (query == null)
                {
                    res = bindingContext.ValueProvider.GetValue("w");
                    query = res.Length > 0 ? res.FirstValue : null;
                }

                avp.query = query;

                int? categoryId = null;
                res = bindingContext.ValueProvider.GetValue("categoryId");
                if (res.Length > 0 && int.TryParse(res.FirstValue, out var tmpInt))
                {
                    categoryId = tmpInt;
                }
                res = bindingContext.ValueProvider.GetValue("categoryCode");
                if (categoryId == null && res.Length > 0 && res.FirstValue != null)
                {
                    categoryCode = res.FirstValue;
                    categoryId = actionContext.HttpContext.RequestServices.Resolve<ICategoryTreeProvider>().GetAllCategories().FindByCode(categoryCode)?.Id;
                }
                if (categoryId == null)
                {
                    if (int.TryParse(pc.Search.Facets["categoryId"], out var tempInt))
                    {
                        pc.Search.CategoryId = categoryId = tempInt;
                    }
                }

                if (categoryId == null && actionContext.HttpContext.Request.Query.TryGetValue("facetValueFilter", out var queryStr))
                {
                    categoryCode = queryStr.ToString().Split(",")
                        .Where(x => x.StartsWith("categoryCode:", StringComparison.OrdinalIgnoreCase))
                        .Select(x => x.Substring(13))
                        .FirstOrDefault();
                    categoryId = actionContext.HttpContext.RequestServices.Resolve<ICategoryTreeProvider>().GetAllCategories().FindByCode(categoryCode)?.Id;
                   
                }

                if (categoryId != null)
                {
                    avp.filter = $"categoryId req {categoryId}";
                    avp.searchTuningRuleContext = $"categoryId:{categoryId}";
                }

                pc.Search.CategoryId = categoryId;
                pc.CategoryId = categoryId;

                avp.responseOptions = isVolumePricingBandsEnabled.GetValueOrDefault() ? "volumePriceBands" : null;
                avp.facetValueFilter = pc.Search.ToFacetValueFilter();
                if (includeCategoryCodeFacets.GetValueOrDefault(true) )
                {
                    avp.facet = "categoryCode";
                    avp.facetHierDepth = "categoryCode:2";
                    if (!string.IsNullOrEmpty(categoryCode))
                    {
                        avp.facetTemplate = "categoryCode:" + categoryCode;
                        avp.facetHierValue = "categoryCode:" + categoryCode;
                    }
                    else if (categoryId.HasValue)
                    {
                        avp.facetTemplate = "categoryId:" + categoryId;
                        avp.facetHierValue = "categoryId:" + categoryId;
                    }
                    else
                    {
                        avp.facetTemplate = "categoryCode:_root";
                        avp.facetHierValue = "categoryCode:_root";
                    }
                }
                else if (includeFacets.GetValueOrDefault(true))
                {
                    avp.facet = "categoryId";
                    avp.facetHierDepth = "categoryId:2";
                    if (categoryId.HasValue)
                    {
                        avp.facetTemplate = "categoryId:" + categoryId;
                        avp.facetHierValue = "categoryId:" + categoryId;
                    }
                    else
                    {
                        avp.facetTemplate = "categoryCode:_root";
                        avp.facetHierValue = "categoryCode:_root";
                    }
                }
              
                
                bindingContext.Result = ModelBindingResult.Success(avp);
                return Task.CompletedTask;
            }
        }

        [ModelBinder(BinderType=typeof(AdvancdSearchParamterModelBinder))]
        public class AdvancedSearchParamaters
        {
            public string query { get; set; }
            public string filter { get; set; }
            public string facetTemplate { get; set; }
            public string facetTemplateSubset { get; set; }
            public string facet { get; set; }
            public string facetFieldRangeQuery { get; set; }
            public string facetHierPrefix { get; set; }
            public string facetHierValue { get; set; }
            public string facetHierDepth { get; set; }
            public string facetStartIndex { get; set; }
            public string facetPageSize { get; set; }
            public string facetSettings { get; set; }
            public string facetValueFilter { get; set; }
            public string sortBy { get; set; }
            public int? pageSize { get; set; }
            public int? startIndex { get; set; }
            public string searchSettings { get; set; }
            public bool? enableSearchTuningRules { get; set; }
            public string searchTuningRuleContext { get; set; }
            public string searchTuningRuleCode { get; set; }
            public string responseGroups { get; set; }
            public string facetTemplateExclude { get; set; }
            public string facetPrefix { get; set; }
            public string responseOptions { get; set; }
            public string cursorMark { get; set; }
            public string responseFields { get; set; }
            public string groups { get; set; }
            public Core.Api.Contracts.TargetContextLevelType targetContextLevel { get; set; }
            public string spellcorrectOverride { get; set; }
            
            public string customerSegments { get; set; }
        }

        private IDictionary<string, object> MakeSearchDict(string query, int? categoryId, int? page, string w)
        {
            return new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase)
            {
                {"query", query },
                {"categoryId", categoryId },
                {"page", page},
                {"w", w}
            };
        }
    }
}