using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using AutoMapper;
using Mozu.Core.Api.Client.Exceptions;
using Mozu.Core;
using Mozu.Core.Api.Routing;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Search;
using DC = Mozu.ProductAdmin.Contracts.Search;
using System.Text;
using Mozu.Core.Api.Client;
using Mozu.Core.Extensions;
using Mozu.ProductAdmin.Contracts;
using Mozu.SiteBuilder.UX.Admin.Helpers;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Helpers.SearchTuningHelpers;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    /// <summary>
    /// Controller for searchTuningRules.
    /// </summary>
    [WebApi("app/searchtuningrule", SuppressDescriptorGeneration = true)]
    public class SearchTuningRuleController : BaseController
    {
        private readonly ISearchWebApiClient _searchWebApiClient;
        private readonly Lazy<ISearchTuningRuleFilterBuilder> _searchTuningRuleFilterBuilder;
        private readonly Lazy<ISearchTuningRuleSortBuilder> _searchtuningRuleSortBuilder;
        private readonly Lazy<IProductWebApiClient> _productWebApiClient;
        private readonly Lazy<IProductTypeWebApiClient> _productTypeWebApiClient;
        private readonly Lazy<ICategoryWebApiClient> _categoryWebApiClient;
        private Lazy<ISearchWebApiClient> _lazySearchClient;

        private readonly IApiContext _apiCtx;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public SearchTuningRuleController(IApiContext apiCtx,
            ISearchWebApiClient searchWebApiClient,
            Lazy<ISearchTuningRuleFilterBuilder> searchTuningRuleFilterBuilder,
            Lazy<ISearchTuningRuleSortBuilder> searchtuningRuleSortBuilder,
            Lazy<IProductWebApiClient> productWebApiClient,
            Lazy<IProductTypeWebApiClient> productTypeWebApiClient,
            Lazy<ICategoryWebApiClient> categoryWebApiClient)
        //
        {
            _searchWebApiClient = searchWebApiClient;
            _searchTuningRuleFilterBuilder = searchTuningRuleFilterBuilder;
            _searchtuningRuleSortBuilder = searchtuningRuleSortBuilder;
            _productWebApiClient = productWebApiClient;
            _productTypeWebApiClient = productTypeWebApiClient;
            _categoryWebApiClient = categoryWebApiClient;
            _apiCtx = apiCtx;
        }

        /// <summary>
        /// Get a list of searchTuningRules.
        /// </summary>
		[HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<SearchTuningRule>>> ListSearchTuningRules(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            if (pagingParams.id != null)
            {
                var searchClient = _searchWebApiClient;
                var siteIdQueryString = extFilter.QueryString.Get("siteId");
                int siteId;
                if (!string.IsNullOrEmpty(siteIdQueryString) && int.TryParse(siteIdQueryString, out siteId))
                {
                    searchClient = GetSearchClientForSite(siteId);
                }
                var singleSearchTuningRule = (await searchClient.GetSearchTuningRule(pagingParams.id)).ReadAsSync();
                //We only add the whole blocked products & boosted products when there is a single item requested (edit mode)  Greg made me do this....
                var mapped = Mapper.Map<SearchTuningRule>(singleSearchTuningRule);
                await AddSearchProducts(mapped);
                return List2(mapped);
            }

            var searchListClient = _searchWebApiClient;

            var query = extFilter.QueryString.Get("query");
            if (!String.IsNullOrEmpty(query))
            {
                extFilter.Add(new FilterCollectionItem { comparison = "eq", field = "all", value = query });
            }

            var categoryCode = extFilter.QueryString.Get("categoryCode");
            if (!String.IsNullOrEmpty(categoryCode))
            {
                extFilter.Add(new FilterCollectionItem { comparison = "eq", field = "categorycode", value = categoryCode });
                searchListClient = GetSearchClientForSite((int?)null);
            }

            string filter = null;
            if (extFilter.Count > 0)
            {
                filter = _searchTuningRuleFilterBuilder.Value.ToFilterString(extFilter);
            }
            string sortBy = _searchtuningRuleSortBuilder.Value.ToSortString(pagingParams.sort);

            const string responseFields = "items(searchTuningRuleCode,searchTuningRuleName,active,activeStartDate,activeEndDate,keywords,filters,isDefault,auditInfo)";
            try
            {
                var searchTuningRuleList = (await searchListClient.GetSearchTuningRules(pagingParams.startIndex, 
                    pagingParams.pageSize, 
                    sortBy: sortBy, 
                    filter: filter, 
                    responseFields:responseFields)).ReadAsSync();

                var searchTuningRules = Mapper.Map<List<SearchTuningRule>>(searchTuningRuleList.Items);
                if (searchTuningRuleList.TotalCount > 0)
                {
                    await AddCategoryNames(searchTuningRules);
                }
                return List2(searchTuningRules, (int?)searchTuningRuleList.TotalCount);
            }
            catch (ApiWebClientConnectionException e)
            {
                return this.FailureList2<SearchTuningRule>(e.Message);
            }
        }
        
        private async Task AddCategoryNames(List<SearchTuningRule> searchTuningRules)
        {
            var cats = await GetAllCategories() ;
          
            if (!cats.Any())
                return;

            var catLookup = cats.ToDictionary(x => x.CategoryCode, y => y.Content.Name);
            foreach (var rule in searchTuningRules)
            {
                rule.CategoryNames = rule.Filters
                    .Where(x => x.Key == "categoryCode" && catLookup.ContainsKey(x.Value))
                    .Select(y => catLookup[y.Value]).OrderBy(z => z).ToArray();
            }
        }

        /// <summary>
        ///     Get all categories, using paging if required
        /// </summary>
        /// <returns></returns>
        private async Task<List<Category>> GetAllCategories()
        {
            int start = 0;
            var categories = new List<Category>();

            while (true)
            {
                var cats = (await _categoryWebApiClient.Value
                    .GetCategories(startIndex: start,
                        pageSize: 200, //current API maximum is 200 - May 2016
                        responseFields: "items(categoryCode,content(name)"
                    ))
                    .ReadAsSync();
                categories.AddRange(Mapper.Map<List<Category>>(cats.Items));
                start = cats.PageSize + cats.StartIndex;
                if (cats.TotalCount <= start)
                {
                    break;
                }
            }
            return categories;
        }

        private async Task AddSearchProducts(SearchTuningRule singleSearchTuningRule)
        {
            var boosted = await GetSimpleSearchProducts(singleSearchTuningRule.BoostedProducts.Select(p => p.ProductCode).ToList());
            var boostedDic = boosted.ToDictionary(k => k.ProductCode);

            //Have to keep the same order as on the original instance
            foreach (var boostedProduct in singleSearchTuningRule.BoostedProducts)
            {
                var prod = boostedDic.Get(boostedProduct.ProductCode);
                if (prod != null)
                {
                    MapSimpleSearchProduct(boostedProduct, prod);
                }
            }


            var blocked = await GetSimpleSearchProducts(singleSearchTuningRule.BlockedProducts.Select(p => p.ProductCode).ToList());
            var blockedDic = blocked.ToDictionary(k => k.ProductCode);
            //Have to keep the same order as on the original instance
            foreach (var blockedProduct in singleSearchTuningRule.BlockedProducts)
            {
                var prod = blockedDic.Get(blockedProduct.ProductCode);
                if (prod != null)
                {
                    MapSimpleSearchProduct(blockedProduct, prod);
                }
            }
        }

        private static void MapSimpleSearchProduct(SimpleSearchProduct boostedProduct, SimpleSearchProduct prod)
        {
            boostedProduct.ProductName = prod.ProductName;
            boostedProduct.Price = prod.Price;
            boostedProduct.SalePrice = prod.SalePrice;
            boostedProduct.LastModifiedDate = prod.LastModifiedDate;
            boostedProduct.ProductTypeName = prod.ProductTypeName;
            boostedProduct.ProductUsage = prod.ProductUsage;
        }

        /// <summary>
        /// Gets a distinct list of <see cref="SimplSearchProduct"/>s based on the provided 
        /// list of product codes.
        /// </summary>
        /// <param name="productCodes"></param>
        private async Task<List<SimpleSearchProduct>> GetSimpleSearchProducts(List<string> productCodes)
        {
            const string responseFields = "items(ProductCode, ProductUsage, Content, Price, AuditInfo, ProductTypeId)";
            const int batchSize = 50;
            var results = new List<SimpleSearchProduct>();
            var filters = new List<string>();

            if (productCodes.IsNullOrEmpty()) return results;

            var start = 0;
            while (start <= productCodes.Count)
            {
                var remaining = productCodes.Count - start;
                string filter;
                if (productCodes.Count - start > batchSize)
                {
                    filter = BuildSearchProductFilter(productCodes.GetRange(start, batchSize));
                    filters.Add(filter);
                    start += batchSize;
                    continue;
                }
                filter = BuildSearchProductFilter(productCodes.GetRange(start, remaining));
                filters.Add(filter);
                break;
            }

            //why doesn't the product model inclue the string representation of the product type?  DOH!
            var queries = filters.Select(f => _productWebApiClient.Value.GetProducts(0, batchSize, filter: f, responseFields: responseFields)).ToList();
            await Task.WhenAll(queries);
            foreach (var result in queries.Select(q => q.Result))
            {
                var prods = result.ReadAsSync();
                results.AddRange(
                    prods.Items.Select(
                        p =>
                            new SimpleSearchProduct
                            {
                                ProductCode = p.ProductCode,
                                ProductName = p.Content != null ? p.Content.ProductName : String.Empty,
                                Price = p.Price != null ? p.Price.Price : null,
                                SalePrice = p.Price != null ? p.Price.SalePrice : null,
                                LastModifiedDate = p.AuditInfo != null ? p.AuditInfo.UpdateDate : null,
                                ProductTypeId = p.ProductTypeId,
                                ProductUsage = p.ProductUsage
                            }));
            }

            var theList = results.Distinct(SimpleSearchProduct.CodeComparer).ToList();

            var productTypes = theList.Where(ssp => ssp.ProductTypeId.HasValue).Select(ssp => ssp.ProductTypeId.Value).Distinct().ToList();

            //Copied all of this from product controller because you have to do it every time.  Make it part of the contract on product...
            var productTypeFilter = new StringBuilder();
            var filterSeperator = "";

            foreach (var productTypeId in productTypes)
            {
                productTypeFilter.Append(filterSeperator).Append("id eq ").Append(productTypeId);
                filterSeperator = " or ";
            }

            // call the productType service and retrieve records for all productTypes;
            var pttask = (await _productTypeWebApiClient.Value.GetProductTypes(
                filter: productTypeFilter.ToString(),
                responseFields: "items(id,name)"
                )).ReadAsSync();

            var ptLookUp = pttask.Items.ToDictionary(x => x.Id, y => y.Name);

            // iterate product records and add productTypeName
            foreach (var product in theList)
            {
                string productName;

                //var productTypeName = ptLookUp.FirstOrDefault(productType);
                if (product.ProductTypeId.HasValue && ptLookUp.TryGetValue(product.ProductTypeId, out productName))
                {
                    product.ProductTypeName = productName;
                };
            }
            return theList;
        }


        private string BuildSearchProductFilter(List<string> productCodesList)
        {
            if (productCodesList.IsNullOrEmpty()) return String.Empty;
            return "(productCode in [" + string.Join(",", productCodesList) + "])";
        }

        /// <summary>
        /// Create a new searchTuningRule.
        /// </summary>
		[HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<List<SearchTuningRule>>> CreateSearchTuningRule(List<SearchTuningRule> searchTuningRules)
        {
            var responseList = new List<SearchTuningRule>();
            // todo: assert that siteId has value, code, name - Greg Murray on 2015-10-20 

            foreach (var searchRule in searchTuningRules)
            {
                var dc = Mapper.Map<DC.SearchTuningRule>(searchRule);

                try
                {
                    var searchClient = GetSearchClientForSite(searchRule.SiteId.GetValueOrDefault());
                    var response = (await searchClient.AddSearchTuningRule(dc)).ReadAsSync();
                    responseList.Add(Mapper.Map<SearchTuningRule>(response));
                }
                catch (ApiWebClientConnectionException e)
                {
                    return this.FailureList2<SearchTuningRule>(e.Message);
                }
            }

            return List2(responseList);
        }

        /// <summary>
        /// Update an existing searchTuningRule.
        /// have to call ProductAdmin/runtime to get product names
        /// </summary>
		[HttpPostRoute(UriTemplate = "edit")]
        public async Task<Response<List<SearchTuningRule>>> EditSearchTuningRule(List<SearchTuningRule> searchTuningRules, string searchTuningRuleCode = null)
        {
            var retList = new List<SearchTuningRule>();

            foreach (var searchRule in searchTuningRules)
            {
                var dc = Mapper.Map<DC.SearchTuningRule>(searchRule);
                var searchClient = GetSearchClientForSite(searchRule.SiteId.GetValueOrDefault());
                var res = (await searchClient.UpdateSearchTuningRule(dc.SearchTuningRuleCode, dc)).ReadAsSync();
                retList.Add(Mapper.Map<SearchTuningRule>(res));
            }

            return List2(retList);
        }

        [HttpPostRoute(UriTemplate = "delete")]
        public async Task<Response<SearchTuningRule>> DeleteSearchTuningRule(List<SearchTuningRule> tuningRules)
        {
            var tasks = tuningRules.Select(d => (GetSearchClientForSite(d.SiteId.GetValueOrDefault()))
                                                    .DeleteSearchTuningRule(d.Code)).ToList();
            await Task.WhenAll(tasks);
            tasks.Select(TaskHelper.Result).ThrowExceptionsIfAny();

            return SuccessWithTotal2<SearchTuningRule>(tuningRules.Count);
        }

        private ISearchWebApiClient GetSearchClientForSite(int? siteId)
        {
            _lazySearchClient = new Lazy<ISearchWebApiClient>(() =>
                _searchWebApiClient.CloneWithApiContext(x => SetSite(x, siteId)));
            return _lazySearchClient.Value;
        }

        private void SetSite(ApiContext apiContext, int? siteId)
        {
            apiContext.SiteId = siteId;
        }


    }
}