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
using Mozu.SiteBuilder.UX.Admin.Api.Models.PriceLists;
using Mozu.SiteBuilder.UX.Admin.Helpers.PriceListHelpers;
using DC = Mozu.ProductAdmin.Contracts;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Api.Contracts;
using System.Net.Http;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Helpers;
using Mozu.Tenant.Contracts.Clients;
using Mozu.SiteSettings.Order.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Admin.Api
{


    /// <summary>
    /// Controller for PriceLists.
    /// </summary>
    [WebApi("app/priceList", SuppressDescriptorGeneration = true)]
    public class PriceListController : BaseController
    {
        private readonly IPriceListWebApiClient _priceListWebClient;
        private readonly IApiContext _ctx;
        private readonly ITenantsWebApiClient _tenantClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public PriceListController(IApiContext ctx, ITenantsWebApiClient tenantClient,
            IPriceListWebApiClient priceListWebClient)
        {
            _ctx = ctx;
            _tenantClient = tenantClient;
            _priceListWebClient = priceListWebClient;
        }

        /// <summary>
        /// Get a list of PriceLists.
        /// </summary>
        [HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<PriceList>>> ListPriceLists(PagingParamaters pagingParams,
            FilterCollection extFilter)
        {
            if (pagingParams.id != null)
            {
                return await GetSinglePriceList(pagingParams);
            }

            if (IsLookupQuery(extFilter.QueryString.Get("isLookup")))
            {
                return await GetPriceListLookup(extFilter.QueryString.Get("excludedCode"));
            }

            string filter = null;
            if (extFilter != null && extFilter.Count > 0)
            {
                filter = extFilter.ToFilterString();
            }
            string sortBy = pagingParams.sort.ToSortString();

            //const string responseFields = "items(id,name,PriceListCode,couponCodeType,status,canBeDeleted,maxRedemptionsPerUser,maxRedemptionsPerCouponCode,startDate,endDate,redemptionCount,setSize,assignedDiscountCount)";
            //try
            //{
            var priceLists = (await _priceListWebClient.GetPriceLists(pagingParams.startIndex,
                pageSize: pagingParams.pageSize,
                sortBy: sortBy,
                filter: filter
                )).ReadAsSync();

            var result = Mapper.Map<List<PriceList>>(priceLists.Items);

            return List2(result, (int?) priceLists.TotalCount);
            //}
            //catch (ApiWebClientConnectionException e)
            //{
            //    return this.FailureList2<PriceList>(e.Message);
            //}

        }

        private async Task<Response<List<PriceList>>> GetSinglePriceList(PagingParamaters pagingParams)
        {
            var singlePriceList = (await _priceListWebClient.GetPriceList(pagingParams.id)).ReadAsSync();
            return List2(Mapper.Map<PriceList>(singlePriceList));
        }

        private async Task<Response<List<PriceList>>> GetPriceListLookup(string excludedCode)
        {
            var filter = string.Format("enabled eq true{0}",
                !string.IsNullOrEmpty(excludedCode) 
                    ? " and pricelistcode ne " + excludedCode 
                    : "");
            var priceLists = (await _priceListWebClient.GetPriceLists(startIndex: 0,
                pageSize: 9999,
                sortBy: "name",
                filter: filter,
                responseFields: "items(priceListCode, name)"
                )).ReadAsSync();

            var result = Mapper.Map<List<PriceList>>(priceLists.Items);
            return List2(result, (int?) priceLists.TotalCount);
        }

        /// <summary>
        /// Create a new PriceList.
        /// </summary>
        [HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<List<PriceList>>> CreatePriceList(List<PriceList> priceLists)
        {
            var responseList = new List<PriceList>();

            foreach (var priceList in priceLists)
            {
                var dcPriceList = Mapper.Map<DC.PriceList>(priceList);

                try
                {
                    var response = (await _priceListWebClient.AddPriceList(dcPriceList)).ReadAsSync();
                    responseList.Add(Mapper.Map<PriceList>(response));
                }
                catch (ApiWebClientConnectionException e)
                {
                    return FailureList2<PriceList>(e.Message);
                }
            }

            return List2(responseList);
        }

        /// <summary>
        /// Update an existing PriceList.
        /// </summary>
        [HttpPostRoute(UriTemplate = "edit")]
        public async Task<Response<List<PriceList>>> EditPriceList(List<PriceList> priceLists, string priceListCode = null)
        {
            var results = new List<PriceList>();

            foreach (var priceList in priceLists)
            {
                var dc = Mapper.Map<DC.PriceList>(priceList);
                var res = (await _priceListWebClient.UpdatePriceList(dc, priceList.Code)).ReadAsSync();
                results.Add(Mapper.Map<PriceList>(res));
            }
            return List2(results);
        }

        [HttpPostRoute(UriTemplate = "delete")]
        public async Task<Response<PriceList>> DeletePriceList(List<PriceList> priceLists)
        {
            var tasks = priceLists.Select(d => _priceListWebClient.DeletePriceList(d.Code)).ToList();
            await Task.WhenAll(tasks);
            tasks.Select(TaskHelper.Result).ThrowExceptionsIfAny();

            return SuccessWithTotal2<PriceList>(priceLists.Count);
        }


        [HttpGetRoute(UriTemplate = "entry/list")]
        public async Task<Response<List<PriceListEntry>>> ListPriceListEntries([FromUri] PagingParamaters pagingParams, [FromUri] FilterCollection extFilter, [FromUri] string priceListCode)
        {
            if (pagingParams.id != null)
            {
                return await GetSinglePriceListEntry(priceListCode, extFilter);
            }

            string filter = null;
            if (extFilter != null && extFilter.Count > 0)
            {
                filter = extFilter.ToFilterString();
            }
            string sortBy = pagingParams.sort.ToSortString();

            //const string responseFields = "items(id,name,PriceListCode,couponCodeType,status,canBeDeleted,maxRedemptionsPerUser,maxRedemptionsPerCouponCode,startDate,endDate,redemptionCount,setSize,assignedDiscountCount)";
            //try
            //{
            var entries = (await _priceListWebClient.GetPriceListEntries(priceListCode: priceListCode, startIndex: pagingParams.startIndex,
                pageSize: pagingParams.pageSize,
                sortBy: sortBy,
                filter: filter
                )).ReadAsSync();

            var result = Mapper.Map<List<PriceListEntry>>(entries.Items);

            return List2(result, (int?)entries.TotalCount);
        }

        private async Task<Response<List<PriceListEntry>>> GetSinglePriceListEntry(string priceListCode, FilterCollection extFilter)
        {
            var productCode = extFilter.QueryString.Get("productCode");
            var currencyCode = extFilter.QueryString.Get("currencyCode");
            var startDate = extFilter.QueryString.Get("startDate");
            DateTime? dateTime = (DateTime?) null;
            if (!startDate.IsNullOrEmpty())
            {
                DateTime parsedDateTime;
                if (DateTime.TryParse(startDate, out parsedDateTime))
                {
                    dateTime = parsedDateTime;
                }
            }
            var singlePriceList = (await _priceListWebClient.GetPriceListEntry(priceListCode: priceListCode, productCode: productCode, currencyCode:currencyCode, startDate:dateTime)).ReadAsSync();
            return List2(Mapper.Map<PriceListEntry>(singlePriceList));
        }

        /// <summary>
        /// Create a new PriceListEntry
        /// </summary>
        [HttpPostRoute(UriTemplate = "entry/create")]
        public async Task<Response<List<PriceListEntry>>> CreatePriceListEntry(List<PriceListEntry> priceLists)
        {
            var responseList = new List<PriceListEntry>();

            foreach (var priceListEntry in priceLists)
            {
                var dcPriceListEntry = Mapper.Map<DC.PriceListEntry>(priceListEntry);

                try
                {
                    var response = (await _priceListWebClient.AddPriceListEntry(priceListEntry.PriceListCode, dcPriceListEntry)).ReadAsSync();
                    responseList.Add(Mapper.Map<PriceListEntry>(response));
                }
                catch (ApiWebClientConnectionException e)
                {
                    return FailureList2<PriceListEntry>(e.Message);
                }
            }

            return List2(responseList);
        }

        /// <summary>
        /// Update an existing PriceList.
        /// </summary>
        [HttpPostRoute(UriTemplate = "entry/edit")]
        public async Task<Response<List<PriceListEntry>>> EditPriceListEntry(List<PriceListEntry> priceEntries)
        {
            var results = new List<PriceListEntry>();

            foreach (var entry in priceEntries)
            {
                var dcEntry = Mapper.Map<DC.PriceListEntry>(entry);
                var res = (await _priceListWebClient.UpdatePriceListEntry(dcEntry, 
                    priceListCode:dcEntry.PriceListCode, 
                    productCode:dcEntry.ProductCode, 
                    currencyCode:dcEntry.CurrencyCode, 
                    startDate:dcEntry.StartDate
                    )).ReadAsSync();
                results.Add(Mapper.Map<PriceListEntry>(res));
            }
            return List2(results);
        }

        private bool IsLookupQuery(string lookupValue)
        {
            bool isLookup;
            if (!string.IsNullOrEmpty(lookupValue) && bool.TryParse(lookupValue, out isLookup))
            {
                return isLookup;
            }
            return false;
        }
    }
}