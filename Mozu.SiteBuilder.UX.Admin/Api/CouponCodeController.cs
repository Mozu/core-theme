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
using Mozu.SiteBuilder.UX.Admin.Api.Models.Discount;
using Mozu.SiteBuilder.UX.Admin.Helpers.CouponCodeHelpers;
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
    [WebApi("app/couponcode", SuppressDescriptorGeneration = true)]
    public class CouponCodeController : BaseController
    {
        private readonly ICouponSetWebApiClient _couponSetWebClient;
        private readonly ICouponSetSortFormatter _couponSetSortFormatter;
        private readonly IApiContext _ctx;
        private readonly ITenantsWebApiClient _tenantClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public CouponCodeController(ICouponSetWebApiClient couponSetWebClient, ICouponSetSortFormatter couponSetSortFormatter, IApiContext ctx, ITenantsWebApiClient tenantClient)
        //
        {
            _couponSetWebClient = couponSetWebClient;
            _couponSetSortFormatter = couponSetSortFormatter;
            _ctx = ctx;
            _tenantClient = tenantClient;

        }

        /// <summary>
        /// Get a list of couponCodes.
        /// </summary>
        [HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<Coupon>>> GetCoupons(PagingParamaters pagingParams, FilterCollection extFilter, [FromUri]string couponSetCode)
        {

            //const string couponCodeDefaultSort = "CouponCode";


            

            string filter = null;
            if (extFilter != null && extFilter.Count > 0)
            {
                filter = extFilter.ToFilterString();
            }

            string sort = (pagingParams != null && pagingParams.sort != null) ? pagingParams.sort.ToSortString() : null;

            try
            {
                var couponCodeList = (await _couponSetWebClient.GetCoupons(couponSetCode, pagingParams.startIndex, pagingParams.pageSize, sort, filter)).ReadAsSync();

                var couponCodeListItems = Mapper.Map<List<Coupon>>(couponCodeList.Items);

                return List2(couponCodeListItems, (int?)couponCodeList.TotalCount);
            }
            catch (ApiWebClientConnectionException e)
            {
                return this.FailureList2<Coupon>(e.Message);
            }
        }


        public class CreateCodeItemArgs
        {
            public string CouponSetCode { get; set; }
         
            public List<string> Items { get; set; }
        }

        /// <summary>
        /// Create a new couponCode.
        /// </summary>
        [HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<List<Coupon>>> CreateCoupon(CreateCodeItemArgs args)
        {

            var coupons = args.Items;
            
            var couponSetCode = args.CouponSetCode;
            
            //var responseList = new List<Coupon>();


            var couponList = coupons.Select(x => new Coupon { CouponCode = x, CouponSetCode = couponSetCode }).ToList();

            var dc = Mapper.Map<List<DC.Coupon>>(couponList);

            try
            {
                var response = (await _couponSetWebClient.AddCoupons(couponSetCode, dc)).ReadAsSync();
                //responseList.Add(Mapper.Map<Coupon>(response));
                return this.EmptyList2<Coupon>();
            }
            catch (ApiWebClientConnectionException e)
            {
                return this.FailureList2<Coupon>(e.Message);
            }

            //return List2(responseList);

            //var tasks = channels.Select(_ => _channelWebApiClient.CreateChannel(_)).ToList();
            //await Task.WhenAll(tasks);
            //var newChannels = tasks.Select(x => x.Result.ReadAsSync()).ToList();
            //return this.Request.CreateResponse(HttpStatusCode.OK, this.List2(newChannels));

        }

        [HttpPostRoute(UriTemplate = "delete")]
        public async Task<Response<Coupon>> DeleteCoupons(List<Coupon> coupons, [FromUri]string couponSetCode)
        {
            var dc = Mapper.Map<List<DC.Coupon>>(coupons);
            var couponList = coupons.Select(x => x.CouponCode).ToList();
            var response = (await _couponSetWebClient.DeleteCoupons(couponSetCode, couponList)).ReadAsSync();

            return  SuccessWithTotal2<Coupon>(coupons.Count);

        }
    }
}