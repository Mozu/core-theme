using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using Newtonsoft.Json.Linq;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Filters;
using Mozu.Core.Actions;
using Mozu.SiteBuilder.Mvc.OAF;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using System.Collections.Generic;
using System;
using System.Net.Http;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.Mvc.Helpers;
using Mozu.SiteBuilder.Mvc.Catalog;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.IO;
using System.Net;
using System.Linq;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Mozu.Core.Configuration;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [NoSslActionFilter]
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

        public SearchController(IProductCategoryRuntimeWebApiClient catClient,
            IProductRuntimeWebApiClient productClient, IProductSearchWebApiClient searchClient,
            ICustomRouteHandler customRouteHandler)
        {
            _catClient = catClient;
            _productClient = productClient;
            _searchClient = searchClient;
            _customRouteHandler = customRouteHandler;
        }

        [HttpOptions]
        public IActionResult OptionsIndex()
        {
            this.HttpContext.Response.Headers["Access-Control-Allow-Origin"] = "*";
            this.HttpContext.Response.Headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
            
            return Ok();
        }

        [SbActionExtensionFilter(actionId: ActionFilterConstants.SearchIndexBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController)]
        [SbActionExtensionFilter(actionId: ActionFilterConstants.SearchIndexAfterAction, executionType: ActionExtensionExecutionTypes.AfterController)]
        [HttpGet]
        [HttpOptions]
        public async Task<IActionResult> Index(
            string query = null, 
            int? categoryId = null, 
            string categoryCode = null , 
            int? page = null,
            //adding w as an extra param for jelly belly.  Plan to remove in r6.1
            string w = null,
            string inStockLocation = null,
            [FromQuery]AdvancedSearchParamaters searchParams = null,
            [FromQuery(Name = "debug.explain.structured")]bool  debug_explain_structure = false)
        {
            if (string.Equals(this.HttpContext.Request.Method , "OPTIONS", StringComparison.OrdinalIgnoreCase))
            {
                return OptionsIndex();
            }
            var _ = searchParams;

            //commenting out until bluefly can change their arc actions.
            //nulled out in asp model binder  ... should only be set if done in arcjs
            //if (query != null)
            //{
            //    searchParams.query = query;
            //}
            
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
                // responseFields: _.responseFields,
                //  responseGroups: _.responseGroups,
                //   responseOptions: _.responseOptions,
                searchSettings: _.searchSettings,
                searchTuningRuleCode: _.searchTuningRuleCode,
                searchTuningRuleContext: _.searchTuningRuleContext,
                sortBy: _.sortBy,
                startIndex: _.startIndex,
                targetContextLevel: _.targetContextLevel))
                .ResponseMessage
                .Content
                .ReadAsStringAsync();
                return CreateDebugResponse(debugTxt);
            }

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
                targetContextLevel: _.targetContextLevel)).ReadAsSync();

            var pc = Mapper.Map<ProductSearchResult>(searchResponse);

            pc.Init(true, this.PageContext.Search);
            pc.UrlBase = "/search?query=" + _.query;

            var searchPageType = pc.TotalCount > 0 ? "search-results" : "no-search-results";

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
            public Task BindModelAsync(ModelBindingContext bindingContext)
            {
                var actionContext = bindingContext.ActionContext;

                //null out action arguments so that we can detect if they were modified in arcjs

                //actionContext.ActionArguments["categoryCode"] = null;
                //actionContext.ActionArguments["page"] = null;
                //actionContext.ActionArguments["w"] = null;
                // commenting out till we can change blue fly actions
                // actionContext.ActionArguments["query"] = null;
                //  actionContext.ActionArguments["categoryId"] = null;

                var avp = new AdvancedSearchParamaters();

                var sc = bindingContext.HttpContext.RequestServices.Resolve<ISiteContext>();
                var pc = bindingContext.HttpContext.RequestServices.Resolve<IPageContext>();
                var includeFacets = ((bool?)sc.ThemeSettings["showCategoryFacets"]);
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
                    var categoryCode = res.FirstValue;
                    categoryId = actionContext.HttpContext.RequestServices.Resolve<ICategoryTreeProvider>().GetAllCategories().FindByCode(categoryCode)?.Id;
                }
                if (categoryId == null)
                {
                    if (int.TryParse(pc.Search.Facets["categoryId"], out var tempInt))
                    {
                        pc.Search.CategoryId = categoryId = tempInt;
                    }
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
                if (includeFacets.GetValueOrDefault(true))
                {
                    avp.facet = "categoryId";
                    avp.facetHierDepth = "categoryId:2";
                    if (categoryId.HasValue)
                    {
                        avp.facetTemplate = "categoryId:" + categoryId;
                        avp.facetHierValue = "categoryId:" + categoryId;
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
            public Core.Api.Contracts.TargetContextLevelType targetContextLevel { get; set; }
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