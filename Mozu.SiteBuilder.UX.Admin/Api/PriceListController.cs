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
using System.Net.Http;
using Mozu.SiteBuilder.UX.Admin.Helpers;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
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
        //private readonly IPriceListWebApiClient _priceListWebClient;
        //private readonly IPriceListSortFormatter _priceListSortFormatter;
        private readonly IApiContext _ctx;
        private readonly ITenantsWebApiClient _tenantClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public PriceListController(IApiContext ctx, ITenantsWebApiClient tenantClient)
            //IPriceListWebApiClient PriceListWebClient, IPriceListSortFormatter priceListSortFormatter) 
        {
            //_PriceListWebClient = priceListWebClient;
            //_PriceListSortFormatter = priceListSortFormatter;
            _ctx = ctx;
            _tenantClient = tenantClient;
        }

        /// <summary>
        /// Get a list of PriceLists.
        /// </summary>
		[HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<PriceList>>> ListPriceLists(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            //if (pagingParams.id != null)
            //{
            //    var singlePriceList = (await _priceListWebClient.GetPriceList(pagingParams.id, responseGroups:"Counts")).ReadAsSync();
            //    return List2(Mapper.Map<PriceList>(singlePriceList));
            //}

            //var query = extFilter.QueryString.Get("query");
            //if (!String.IsNullOrEmpty(query))
            //{
            //    extFilter.Add(new FilterCollectionItem { comparison = "eq", field = "all", value = query });
            //}

            //string filter = null;
            //if (extFilter != null && extFilter.Count > 0)
            //{
            //    var tenant = (await _tenantClient.GetTenant(_ctx.TenantId)).ReadAsSync();
            //    var masterCat = tenant.MasterCatalogs.FirstOrDefault(x => x.Id == _ctx.MasterCatalogId);
            //    var defaultLocalCode = masterCat.DefaultLocaleCode;
            //    var masterNumberFormat = CultureInfo.GetCultureInfo(defaultLocalCode).NumberFormat;

            //    filter = extFilter.ToFilterString(_ctx, masterNumberFormat, _tenantClient);
            //}

            //const string responseFields = "items(id,name,PriceListCode,couponCodeType,status,canBeDeleted,maxRedemptionsPerUser,maxRedemptionsPerCouponCode,startDate,endDate,redemptionCount,setSize,assignedDiscountCount)";
            //string sortBy = pagingParams.ToSort(_priceListSortFormatter);

            //try
            //{
            //    var PriceListList = (await _priceListWebClient.GetPriceLists(pagingParams.startIndex,
            //        pageSize: pagingParams.pageSize,
            //        sortBy: sortBy,
            //        filter: filter,
            //        responseGroups: "Counts",
            //        responseFields: responseFields
            //        )).ReadAsSync();

            //    var PriceLists = Mapper.Map<List<PriceList>>(PriceListList.Items);

            //    return List2(PriceLists, (int?)PriceListList.TotalCount );
            //}
            //catch (ApiWebClientConnectionException e)
            //{
            //    return this.FailureList2<PriceList>(e.Message);
            //}

            var mockData = new List<PriceList>();
            mockData.AddRange(
                Enumerable.Range(1, 30).Select(i => new PriceList
                {
                    Code = string.Format("t_{0}{1}", (i < 10 ? "0" : ""), i),
                    Name = string.Format("test {0}", i),
                    Ranking = i,
                    SearchIndexSequence = i,
                    CustomerSegments = new List<int> { 1 }
                    //,
                    //new AuditInfo
                    //{
                        
                    //}

                }).ToList()
            );

            return List2(mockData, mockData.Count);
        }

        /// <summary>
        /// Create a new PriceList.
        /// </summary>
		[HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<List<PriceList>>> CreatePriceList(List<PriceList> priceLists)
        {
            var responseList = new List<PriceList>();

            //foreach (var priceList in priceLists)
            //{
            //    var dcPriceList = Mapper.Map<DC.PriceList>(priceList);

            //    try
            //    {
            //        var response = (await _priceListWebClient.AddPriceList(dcPriceList)).ReadAsSync();
            //        responseList.Add(Mapper.Map<PriceList>(response));
            //    }
            //    catch (ApiWebClientConnectionException e)
            //    {
            //        return this.FailureList2<PriceList>(e.Message);
            //    }
            //}

            return List2(responseList);
        }

        /// <summary>
        /// Update an existing PriceList.
        /// </summary>
		[HttpPostRoute(UriTemplate = "edit")]
        public async Task<Response<List<PriceList>>> EditPriceList(List<PriceList> priceLists, string PriceListCode = null)
        {
            //var retList = new List<PriceList>();

            //foreach (var PriceList in priceLists)
            //{
            //    var dc = Mapper.Map<DC.PriceList>(PriceList);
            //    var res = (await _priceListWebClient.UpdatePriceList(dc, PriceList.PriceListCode)).ReadAsSync();
            //    retList.Add(Mapper.Map<PriceList>(res));
            //}

            //return List2(retList);
            return List2(priceLists);
        }

        [HttpPostRoute(UriTemplate = "delete")]
        public async Task<Response<PriceList>> DeletePriceList(List<PriceList> PriceLists)
        {
            //var tasks = PriceLists.Select(d => _priceListWebClient.DeletePriceList(d.PriceListCode)).ToList();
            //await Task.WhenAll(tasks);
            //tasks.Select(TaskHelper.Result).ThrowExceptionsIfAny();

            return SuccessWithTotal2<PriceList>(PriceLists.Count);
        }

        
    }
}