using Mozu.Core.Api.Client;
using Mozu.Core.Settings;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Caching;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Tags;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using NDjango.FiltersCS.Compatibility;
using NDjango.Interfaces;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Formatting;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder.Extensions;
using MongoDB.Bson.Serialization.Conventions;

namespace Mozu.SiteBuilder.UX.Hypr.Tags
{
    /// <summary>
    /// The include_products tag is a special kind of include tag, that includes a named template, 
    /// but also sets that template's Model to be a list of products. 
    /// This is useful on category pages, featured products widgets, 
    /// and any number of other uses. 
    /// 
    /// It has a number of extra argumentss:
    /// 
    /// 
    /// viewName=the path to the template
    /// 
    /// includeFacets=Set this to true to add a list of available Facets to the Model, 
    /// which is necessary when building a faceted, drill-down UI. 
    /// The Model will have a Facets list. Default false.
    /// 
    /// pageWithUrl=Set this to true to use URL parameters for paging. 
    /// If this is true then the list will use StartIndex and PageSize parameters in the URL if they exist. 
    /// Default false.
    /// 
    /// sortWithUrl=Set this to true to use URL parameters for sorting. 
    /// If this is true then the list will use SortAsc or SortDesc parameters in the URL if they exist.
    /// 
    /// startIndex=refer to product api documentation
    /// 
    /// pageSize=refer to product api documentation
    /// 
    /// query=refer to product api documentation
    /// 
    /// sort=refer to product api documentation
    /// 
    /// productCodes=alternate to query.  An array of product codes
    /// </summary>

    [NDjango.ParserNodes.Description("tbd")]
    [NDjango.Interfaces.Name("include_products")]
    public class IncludeProductsTag : SimpleTagBaseAsync
    {
        protected override async Task<IEnumerable<WalkResult>> ProcessTagAsync(ArgumentCollection arguments, NDjango.Interfaces.IContext context, Func<string, ITemplate> getTemplateFunction)
        {
            var pageContext = context.PageContext();
            var siteContext = context.SiteContext();
            var themeSettings = siteContext.ThemeSettings;
            var searchContext = pageContext.Search;
            var sbAPIContext = context.SiteBuilderApiContext();
            var httpContext = context.HttpContext();
            
            var template = arguments.GetValueOrDefault<string>("viewName") ?? (string)arguments[0].Value;
            var includeFacets = arguments.GetValueOrDefault("includeFacets", false);
            var pageWithUrl = arguments.GetValueOrDefault("pageWithUrl", false);
            var sortWithUrl = arguments.GetValueOrDefault("sortWithUrl", false);
            var startIndex = arguments.GetValueOrDefault("startIndex", 0);
            var pageSize = arguments.GetValueOrDefault("pageSize", 15);
            var filter = arguments.GetValueOrDefault<string>("query" , arguments.GetValueOrDefault<string>("filter"));
            var searchQueryString = arguments.GetValueOrDefault<string>("searchQuery", "*:*");
            var sort = arguments.GetValueOrDefault<string>("sort");
            var customerSegments = arguments.GetValueOrDefault<string>("customerSegments");
            if (customerSegments == null)
            {
                var customerSegmentArray = arguments.GetValueOrDefault<List<string>>("customerSegments");
                customerSegments = customerSegmentArray?.Count> 0 ? string.Join(",", customerSegmentArray) : null;
            }
            
            

            IEnumerable productCodes = null;
            if ( !arguments.TryGetValue< IEnumerable>("productCodes", out productCodes ))
            {
                productCodes = null;
            }
           
            var facetHierDepthInt = arguments.GetValueOrDefault<int>("facetHierDepth", 2);
            var responseFields = arguments.GetValueOrDefault<string>("responseFields");
            var responseGroups = arguments.GetValueOrDefault<string>("responseGroups");
            var facet = arguments.GetValueOrDefault<string>("facet");
            var searchTuningRuleCode = arguments.GetValueOrDefault<string>("searchTuningRuleCode");
            var enableSearchTuningRules = arguments.GetValueOrDefault<bool?>("enableSearchTuningRules");
            var searchTuningRuleContext = arguments.GetValueOrDefault<string>("searchTuningRuleContext");
            var facetTemplateExclude = arguments.GetValueOrDefault<string>("facetTemplateExclude");
            var suppressErrors = arguments.GetValueOrDefault<bool>("suppressErrors", MozuConfigurationManager.Settings.AppSettingsAsNullableBool("sitebuilder_includeproducttag_suppressErrors").GetValueOrDefault(false));
            var facetPrefix = arguments.GetValueOrDefault<string>("facetPrefix");
            var includeUserClaims = arguments.GetValueOrDefault<bool>("includeUserClaims", false);

            var searchSettings =
                arguments.GetValueOrDefault<string>("searchSettings", httpContext.Request.Query["searchSettings"]);
            GetCategoryCodes(arguments, context, pageContext, out var facetCategoryId, out var categoryId);

            var isVolumePricingBandsEnabled = ((bool?)themeSettings["listVolumePricing"]);
            var responseOptions = isVolumePricingBandsEnabled.GetValueOrDefault() ? "volumePriceBands" : null;
            
            var productSearchWebApiClient = context.Resolve<IProductSearchWebApiClient>();

            var cacheResults = arguments.GetValueOrDefault<bool>("cacheResults", true) &&
                               siteContext.CurrencyExchangeRate == null &&
                               (arguments.GetValueOrDefault<bool>("personalize", false) &&!string.IsNullOrEmpty(pageContext.MonetateId)); 
            if (includeUserClaims == true && cacheResults == true)
            {
                throw new NDjango.Interfaces.RenderingError("If includeUserClaims or personalize is true then cacheResults must be set to false", Microsoft.FSharp.Core.FSharpOption<Exception>.None);
            }

            string facetTemplate = null;

            string facetValueFilter = null;
            string facetHierValue = null;
            string facetHierDepth = null;
           
            

            var productCodesFilters = new string[0];
        

            if (!ProcessFilter( ref productCodes, categoryId, ref filter, ref productCodesFilters))
            {
                return Enumerable.Empty<WalkResult>();
            }

            ProcessPaging(siteContext, searchContext, pageWithUrl, ref startIndex, ref pageSize, productCodesFilters);

            ProcessFacets(searchContext, includeFacets, ref cacheResults, facetHierDepthInt, facetCategoryId, categoryId, ref facetTemplate, ref facetValueFilter, ref facetHierValue, ref facetHierDepth);

            ProcessSearchTuningRuleContext(categoryId, ref searchTuningRuleContext);
            var sortBy = ProcessSortBy(siteContext, searchContext, sortWithUrl, sort);
            cacheResults = cacheResults && string.IsNullOrEmpty(customerSegments);
            
            var cache = context.Resolve<ILiveModeOnlyCache>();
            var pc = await DoSearch(
                cache, 
                searchContext ,
                startIndex, 
                pageSize, 
                cacheResults, 
                facetTemplate, 
                facetValueFilter, 
                facetHierValue, 
                facetHierDepth, 
                searchQueryString, 
                sortBy, 
                filter, 
                productSearchWebApiClient, 
                pageContext, 
                productCodesFilters, 
                productCodes, 
                responseFields, 
                facet, 
                searchTuningRuleCode, 
                enableSearchTuningRules ,
                searchTuningRuleContext ,
                facetTemplateExclude,
                sbAPIContext.PriceListCode,
                sbAPIContext.PurchaseLocation,
                facetPrefix,
                responseOptions,
                suppressErrors,
                responseGroups,
                includeUserClaims,
                mid:pageContext.MonetateId,
                searchSettings:searchSettings,
                customerSegments:customerSegments
             ).ConfigureAwait(false);

            var dict = new Dictionary<string, object> { { "model", pc } };
            var nodes = getTemplateFunction(template).Nodes;
            
            return new[] { WalkResultHelpers.RenderNodesWithContextMods(nodes, dict, Enumerable.Empty<string>()) };
        }

        // there was a bug when caching sort because default was being cached for two sorts -- the default, and the sort 
        class SortContext
        {
            public SortContext (string key, string value)
            {
                cacheKey = key;
                sortValue = value;
            }
            public string cacheKey { get; private set; }
            public string sortValue { get; private set; }
        }


        private async Task<ProductSearchResult> DoSearch(
            ILiveModeOnlyCache cache, 
            IProductListingState productListingState,
            int startIndex, 
            int pageSize, 
            bool cacheResults, 
            string facetTemplate, 
            string facetValueFilter, 
            string facetHierValue, 
            string facetHierDepth, 
            string searchQueryString, 
            SortContext sortBy, 
            string filter, 
            IProductSearchWebApiClient productSearchWebApiClient, 
            IPageContext pageContext, 
            string[] productCodesFilters, 
            IEnumerable productCodes, 
            string responseFields, 
            string facet,
            string searchTuningRuleCode,
            bool?  enableSearchTuningRules,
            string searchTuningRuleContext,
            string facetTemplateExclude,
            string priceList,
            string locationCode,
            string facetPrefix,
            string responseOptions,
            bool suppressErrors,
            string responseGroups,
            bool includeUserClaims,
            string mid,
            string searchSettings,
            string customerSegments
            )
        {
            string cacheKey = null;
            ProductSearchResult pc = null;

            var parsedFilter = filter;
            // use the inStockLocation - TODO: could make sure it isn't already in the _.filter already
            if (!string.IsNullOrWhiteSpace(((SearchContext)productListingState)?.InStockLocation))
            {
                var locationFilter = $"locationsinstock eq {(((SearchContext)productListingState).InStockLocation)}";
                parsedFilter = string.IsNullOrWhiteSpace(parsedFilter)
                    ? locationFilter
                    : $"(({parsedFilter}) and ({locationFilter}))";
            }

            if (cacheResults)
            {
                var sb = new StringBuilder()
                    .Append(searchQueryString)
                    .Append(parsedFilter)
                    .Append(facetHierValue)
                    .Append(facetTemplate)
                    .Append(facetHierDepth)
                    .Append(facetValueFilter)
                    .Append(startIndex)
                    .Append(sortBy.cacheKey)
                    .Append (responseFields)
                    .Append(pageSize)
                    .Append(facet)
                    .Append(searchTuningRuleCode)
                    .Append(enableSearchTuningRules)
                    .Append(searchTuningRuleContext)
                    .Append(facetTemplateExclude)
                    .Append (priceList)
                    .Append(locationCode)
                    .Append(facetPrefix)
                    .Append(responseOptions)
                    .Append(responseGroups)
                    .Append(searchSettings);
                cacheKey = sb.ToString();
                pc = cache.Get<ProductSearchResult>(cacheKey, scope:CacheScope.Site , cacheType:StorefrontCacheTypes.ProductSearch);
            }
            if (pc == null)
            {
                var res = includeUserClaims ?
                    await productSearchWebApiClient.Search(
                        query: searchQueryString,
                        filter: parsedFilter,
                        facetHierValue: facetHierValue,
                        facetTemplate: facetTemplate,
                        facetHierDepth: facetHierDepth,
                        facetValueFilter: facetValueFilter,
                        facet: facet,
                        facetPrefix: facetPrefix,
                        startIndex: startIndex,
                        sortBy: sortBy.cacheKey.Equals("default") ? null : sortBy.sortValue,
                        responseFields: responseFields,
                        responseOptions: responseOptions,
                        responseGroups: responseGroups,
                        pageSize: pageSize,
                        searchTuningRuleCode: searchTuningRuleCode,
                        enableSearchTuningRules: enableSearchTuningRules,
                        searchTuningRuleContext: searchTuningRuleContext,
                        mid:mid,
                        searchSettings: searchSettings,
                        defaultSort: sortBy.cacheKey.Equals("default") ? sortBy.sortValue : null,
                        customerSegments: customerSegments
                    ).ConfigureAwait(false)
                    : await productSearchWebApiClient.CloneWithoutUserClaims().Search(
                        query: searchQueryString,
                        filter: parsedFilter,
                        facetHierValue: facetHierValue,
                        facetTemplate: facetTemplate,
                        facetHierDepth: facetHierDepth,
                        facetValueFilter: facetValueFilter,
                        facet: facet,
                        facetPrefix: facetPrefix,
                        startIndex: startIndex,
                        sortBy: sortBy.cacheKey.Equals("default") ? null : sortBy.sortValue,
                        responseFields: responseFields,
                        responseOptions: responseOptions,
                        responseGroups: responseGroups,
                        pageSize: pageSize,
                        searchTuningRuleCode: searchTuningRuleCode,
                        enableSearchTuningRules: enableSearchTuningRules,
                        searchTuningRuleContext: searchTuningRuleContext,
                        mid:mid,
                        searchSettings: searchSettings,
                        defaultSort: sortBy.cacheKey.Equals("default") ? sortBy.sortValue : null,
                        customerSegments: customerSegments
                    ).ConfigureAwait(false);


                if (res.HasException)
                {
                   
                    if ( pageContext.IsDebugMode || 
                         pageContext.DebugFlags.HasFlag(DebugModeFlagValues.ShowErrors))
                    {
                        suppressErrors = false;
                    }

                    if (suppressErrors)
                    {
                        pc = new ProductSearchResult();
                    }
                    else
                    {
                        var ex = res.ReadException();
                        throw ex;
                    }
                }
                else
                {
                    await using var stream = await res.ResponseMessage.Content.ReadAsStreamAsync().ConfigureAwait(false);
                        var jmtf = new JsonMediaTypeFormatter();
                        using var rdr = jmtf.CreateJsonReader(typeof(ProductSearchResult), stream, Encoding.UTF8);
                            var ser = jmtf.CreateJsonSerializer();
                            pc = ser.Deserialize<ProductSearchResult>(rdr);
                            pc.Init(true, productListingState);
                            if (productCodesFilters != null && productCodesFilters.Length > 0 && pc.Items != null)
                            {
                                pc.Items = productCodes
                                    .Cast<string>()
                                    .Select(x => pc.Items.FirstOrDefault(y => y.ProductCode.Equals(x, StringComparison.OrdinalIgnoreCase)))
                                    .Where(x => x != null).ToList();
                            }
                }
                if (cacheResults  && !res.HasException)
                {
                    cache.Set(cacheKey, pc, scope:CacheScope.Site, cacheType :StorefrontCacheTypes.ProductSearch);
                }
            }

            return pc;
        }

        private static SortContext ProcessSortBy(Mvc.Contexts.ISiteContext siteContext, Mvc.Contexts.SearchContext searchContext, bool sortWithUrl, string sort)
        {

            // sortWithUrl is true in the newer instances of our sort implementation -- it will usually fall in this case, unless the searchContext.sortBy is null -- which means the default sort
            if (sortWithUrl && !string.IsNullOrEmpty(searchContext.SortBy))
            {
                return new SortContext(searchContext.SortBy, searchContext.SortBy);
            }

            if (string.IsNullOrEmpty(sort))
            {
                return new SortContext("default", (siteContext.ThemeSettings["defaultSort"] ?? "").ToString());
            }

            return new SortContext(sort, sort);
        }

        private static bool ProcessFilter( ref IEnumerable productCodes, int? categoryId, ref string filter, ref string[] productCodesFilters)
        {
            var filterStringBuilder = new StringBuilder();
        
            if (filter != null)
            {
                filterStringBuilder.Append(filter);
            }
            else if (productCodes != null)
            {
                if (productCodes is string)
                {
                    productCodes = ((string)productCodes).Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
                }
                productCodesFilters = (productCodes).Cast<object>().Where(x => x != null).Select(x =>
                    $"productCode eq {x}").ToArray();
                if (productCodesFilters.Length == 0)
                {
                    return false; 
                }
                else
                {
                    filterStringBuilder.Append(string.Join(" or ", productCodesFilters));
                }
            }
            else
            {
                if (categoryId.HasValue)
                {
                    filterStringBuilder.Append("categoryId req ");
                    filterStringBuilder.Append(categoryId.Value);
                }
            }
            filter = filterStringBuilder.ToString();
            return true;
        }

        static void ProcessSearchTuningRuleContext( int? categoryId,  ref string searchTuningRuleContext)
        {
            if (!string.IsNullOrEmpty(searchTuningRuleContext))
            {
                return;
            }
            if ( categoryId.HasValue)
            {
                searchTuningRuleContext = "categoryId:" + categoryId.Value;
            }
        }

        private static void ProcessFacets(Mvc.Contexts.SearchContext searchContext, bool includeFacets, ref bool cacheResults, int facetHierDepthInt, int? facetCategoryId, int? categoryId, ref string facetTemplate, ref string facetValueFilter, ref string facetHierValue, ref string facetHierDepth)
        {
            if (includeFacets && (categoryId.HasValue || facetCategoryId.HasValue))
            {
                facetHierDepth = "categoryId:" + facetHierDepthInt;
                facetTemplate = "categoryId:" + (facetCategoryId.HasValue ? facetCategoryId : categoryId);
                facetHierValue = "categoryId:" + (facetCategoryId.HasValue ? facetCategoryId : categoryId);

                //dont cache results if faceting... too much mem consumed caching... eg more money==more problems
                if (searchContext.Facets.Count > 0)
                {
                    cacheResults = false;
                }

                facetValueFilter = searchContext.ToFacetValueFilter();

            }
        }

        private static void ProcessPaging(Mvc.Contexts.ISiteContext siteContext, Mvc.Contexts.SearchContext searchContext, bool pageWithUrl, ref int startIndex, ref int pageSize, string[] productCodesFilters)
        {
            if (pageWithUrl)
            {
                if (searchContext.PageSize.HasValue)
                {
                    pageSize = searchContext.PageSize.Value;
                }
                else if (int.TryParse((siteContext.ThemeSettings["defaultPageSize"] ?? new object()).ToString(), out var tmp))
                {
                    pageSize = tmp;
                }
                else
                {
                    pageSize = 15;
                }

                if (searchContext.StartIndex.HasValue)
                {
                    startIndex = searchContext.StartIndex.Value;
                }
            }
            else if(productCodesFilters != null && pageSize < productCodesFilters.Length)
            {
                pageSize = productCodesFilters.Length;
            }
        }

        private static void GetCategoryCodes(ArgumentCollection arguments, NDjango.Interfaces.IContext context, Mvc.Contexts.IPageContext pageContext, out int? facetCategoryId, out int? categoryId)
        {
            facetCategoryId = arguments.GetValueOrDefault<int?>("facetCategoryId");
            categoryId = arguments.GetValueOrDefault<int?>("categoryId", pageContext.CategoryId);

            var faceCategoryCode = arguments.GetValueOrDefault<string>("facetCategoryCode");
            var categoryCode = arguments.GetValueOrDefault<string>("categoryCode");

            if (!string.IsNullOrWhiteSpace(faceCategoryCode) || !string.IsNullOrWhiteSpace(categoryCode))
            {
                var catTree = context.Resolve<ICategoryTreeProvider>().GetAllCategories();
                if (!string.IsNullOrWhiteSpace(faceCategoryCode))
                {
                    var tempCat = catTree.FindByCode(faceCategoryCode);
                    if (tempCat != null)
                    {
                        facetCategoryId = tempCat.Id;
                    }
                }
                if (!string.IsNullOrWhiteSpace(categoryCode))
                {
                    var tempCat = catTree.FindByCode(categoryCode);
                    if (tempCat != null)
                    {
                        categoryId = tempCat.Id;
                    }
                }
            }
        }
    }
}