using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using AutoMapper;
using Mozu.Core.Api.Client.Exceptions;
using Mozu.Core;
using Mozu.Core.Api.Routing;
using System.Globalization;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.ModelMapping;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Discount;
using Mozu.SiteBuilder.UX.Admin.Helpers.CouponSetHelpers;
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
    /// Controller for couponSets.
	/// </summary>
    [WebApi("app/couponset", SuppressDescriptorGeneration = true)]
    public class CouponSetController : BaseController
    {
        private readonly ICouponSetWebApiClient _couponSetWebClient;
        private readonly ICouponSetSortFormatter _couponSetSortFormatter;
        private readonly IApiContext _ctx;
        private readonly ITenantsWebApiClient _tenantClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public CouponSetController(ICouponSetWebApiClient couponSetWebClient, ICouponSetSortFormatter couponSetSortFormatter, IApiContext ctx, ITenantsWebApiClient tenantClient)
        //
        {
            _couponSetWebClient = couponSetWebClient;
            _couponSetSortFormatter = couponSetSortFormatter;
            _ctx = ctx;
            _tenantClient = tenantClient;

        }

        /// <summary>
        /// Get a list of couponSets.
        /// </summary>
		[HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<CouponSet>>> ListCouponSets(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            if (pagingParams.id != null)
            {
                var singleCouponSet = (await _couponSetWebClient.GetCouponSet(pagingParams.id, responseGroups:null)).ReadAsSync();

                return List2(Mapper.Map<CouponSet>(singleCouponSet));
            }

            string filter = null;
            if (extFilter != null && extFilter.Count > 0)
            {
                var tenant = (await _tenantClient.GetTenant(_ctx.TenantId)).ReadAsSync();
                var masterCat = tenant.MasterCatalogs.FirstOrDefault(x => x.Id == _ctx.MasterCatalogId);
                var defaultLocalCode = masterCat.DefaultLocaleCode;
                var masterNumberFormat = CultureInfo.GetCultureInfo(defaultLocalCode).NumberFormat;

                filter = extFilter.ToFilterString(_ctx, masterNumberFormat, _tenantClient);
            }
            
            string sortBy = pagingParams.ToSort(_couponSetSortFormatter);

            try
            {
                var couponSetList = (await _couponSetWebClient.GetCouponSets(pagingParams.startIndex, pagingParams.pageSize, sortBy, filter, null)).ReadAsSync();

                var couponSets = Mapper.Map<List<CouponSet>>(couponSetList.Items);

                return List2(couponSets, (int?)couponSetList.TotalCount );
            }
            catch (ApiWebClientConnectionException e)
            {
                return this.FailureList2<CouponSet>(e.Message);
            }
        }

        /// <summary>
        /// Create a new couponSet.
        /// </summary>
		[HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<List<CouponSet>>> CreateCouponSet(List<CouponSet> couponSets)
        {
            var responseList = new List<CouponSet>();

            foreach (var couponSet in couponSets)
            {
                var dc = Mapper.Map<DC.CouponSet>(couponSet);

                try
                {
                    var response = (await _couponSetWebClient.AddCouponSet(dc)).ReadAsSync();
                    responseList.Add(Mapper.Map<CouponSet>(response));
                }
                catch (ApiWebClientConnectionException e)
                {
                    return this.FailureList2<CouponSet>(e.Message);
                }
            }

            return List2(responseList);
        }

        /// <summary>
        /// Update an existing couponSet.
        /// </summary>
		[HttpPostRoute(UriTemplate = "edit")]
        public async Task<Response<List<CouponSet>>> EditCouponSet(List<CouponSet> couponSetList, string couponSetCode = null)
        {
            var retList = new List<CouponSet>();

            foreach (var couponSet in couponSetList)
            {
                var dc = Mapper.Map<DC.CouponSet>(couponSet);
                var res = (await _couponSetWebClient.UpdateCouponSet(dc, couponSet.CouponSetCode)).ReadAsSync();
                retList.Add(Mapper.Map<CouponSet>(res));
            }

            return List2(retList);
        }

        [HttpPostRoute(UriTemplate = "delete")]
        public async Task<Response<CouponSet>> DeleteCouponSet(List<CouponSet> couponSets)
        {
            var tasks = couponSets.Select(d => _couponSetWebClient.DeleteCouponSet(d.CouponSetCode)).ToList();
            await Task.WhenAll(tasks);
            tasks.Select(TaskHelper.Result).ThrowExceptionsIfAny();

            return SuccessWithTotal2<CouponSet>(couponSets.Count);
        }

    }
}