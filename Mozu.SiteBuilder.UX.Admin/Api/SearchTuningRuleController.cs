using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using System.Web.Http;
using AutoMapper;
using Mozu.Core.Api.Client.Exceptions;
using Mozu.Core;
using Mozu.Core.Api.Routing;
using System.Globalization;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.ModelMapping;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Search;
//using Mozu.SiteBuilder.UX.Admin.Helpers.SearchTuningRuleHelpers;
using DC = Mozu.ProductAdmin.Contracts.Search;
using Mozu.Core.Api.Contracts.Client;
using System.Net.Http;
using Mozu.Core.Api.Client;
using Mozu.SiteBuilder.UX.Admin.Helpers;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Helpers.SearchTuningHelpers;
using Mozu.Tenant.Contracts.Clients;
using Mozu.SiteSettings.Order.Contracts.Clients;

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
        private Lazy<ISearchWebApiClient> _lazySearchClient;

        private readonly IApiContext _apiCtx;
        
        /// <summary>
        /// Public constructor.
        /// </summary>
        public SearchTuningRuleController(IApiContext apiCtx, ISearchWebApiClient searchWebApiClient, Lazy<ISearchTuningRuleFilterBuilder> searchTuningRuleFilterBuilder)
        //
        {
            _searchWebApiClient = searchWebApiClient;
            _searchTuningRuleFilterBuilder = searchTuningRuleFilterBuilder;
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
                var singleSearchTuningRule = (await _searchWebApiClient.GetSearchTuningRule(pagingParams.id)).ReadAsSync();

                return List2(Mapper.Map<SearchTuningRule>(singleSearchTuningRule));
            }

            // todo: call product admin to get products? - Greg Murray on 2015-10-14 


            var query = extFilter.QueryString.Get("query");
            if (!String.IsNullOrEmpty(query))
            {
                extFilter.Add(new FilterCollectionItem { comparison = "eq", field = "all", value = query });
            }

            string filter = null;
            if (extFilter != null && extFilter.Count > 0)
            {
                /*var tenant = (await _tenantClient.GetTenant(_ctx.TenantId)).ReadAsSync();
                var masterCat = tenant.MasterCatalogs.FirstOrDefault(x => x.Id == _ctx.MasterCatalogId);
                var defaultLocalCode = masterCat.DefaultLocaleCode;
                var masterNumberFormat = CultureInfo.GetCultureInfo(defaultLocalCode).NumberFormat;*/

                filter = _searchTuningRuleFilterBuilder.Value.ToFilterString(extFilter);
            }

            //string sortBy = pagingParams.ToSort(_searchTuningRuleSortFormatter);

            try
            {
                var searchTuningRuleList = (await _searchWebApiClient.GetSearchTuningRules(pagingParams.startIndex, pagingParams.pageSize, sortBy:null, filter:filter)).ReadAsSync();

                var searchTuningRules = Mapper.Map<List<SearchTuningRule>>(searchTuningRuleList.Items);

                return List2(searchTuningRules, (int?)searchTuningRuleList.TotalCount);
            }
            catch (ApiWebClientConnectionException e)
            {
                return this.FailureList2<SearchTuningRule>(e.Message);
            }
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
                    // todo: need siteId added to contract - Greg Murray on 2015-10-20 
                    //var searchClient = GetSearchClientForSite(searchRule.SiteId.GetValueOrDefault());
                    //var response = (await searchClient.AddSearchTuningRule(dc)).ReadAsSync();
                    var response = (await _searchWebApiClient.AddSearchTuningRule(dc)).ReadAsSync();
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
                //var searchClient = GetSearchClientForSite(searchRule.SiteId.GetValueOrDefault());
                //var res = (await searchClient.UpdateSearchTuningRule(dc.SearchTuningRuleCode, dc)).ReadAsSync();
                var res = (await _searchWebApiClient.UpdateSearchTuningRule(dc.SearchTuningRuleCode, dc)).ReadAsSync();
                retList.Add(Mapper.Map<SearchTuningRule>(res));
            }

            return List2(retList);
        }

        [HttpPostRoute(UriTemplate = "delete")]
        public async Task<Response<SearchTuningRule>> DeleteSearchTuningRule(List<SearchTuningRule> tuningRules)
        {
            //var tasks = tuningRules.Select(d => (GetSearchClientForSite(d.SiteId.GetValueOrDefault()))
            //                                        .DeleteSearchTuningRule(d.Code)).ToList();
            var tasks = tuningRules.Select(d => _searchWebApiClient
                                                    .DeleteSearchTuningRule(d.Code)).ToList();
            await Task.WhenAll(tasks);
            tasks.Select(TaskHelper.Result).ThrowExceptionsIfAny();

            return SuccessWithTotal2<SearchTuningRule>(tuningRules.Count);
        }

        private ISearchWebApiClient GetSearchClientForSite(int siteId)
        {
            _lazySearchClient = new Lazy<ISearchWebApiClient>(() =>
                _searchWebApiClient.CloneWithApiContext(x => SetSite(x, siteId)));
            return _lazySearchClient.Value;
        }

        private void SetSite(ApiContext apiContext, int siteId)
        {
            apiContext.SiteId = siteId;
        }


    }
}