using System;
using System.Linq;
using System.Net.Http;
using System.ServiceModel;
using System.ServiceModel.Web;
using AutoMapper;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using System.Collections.Generic;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Discount;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Shipping;
using Mozu.SiteBuilder.UX.Admin.Filters;
using Mozu.SiteSettings.Shipping.Contracts.Clients;
using Mozu.ShippingRuntime.Contracts.Clients;
//using Volusion.UspsShippingAdmin.WebApi.Clients;
using Discount = Mozu.SiteBuilder.UX.Admin.Api.Models.Discount.Discount;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class DiscountController : BaseController
    {
        private readonly IDiscountWebApiClient _discountWebClient;
        private readonly IShippingRateWebApiClient _shippingRateClient;
        private readonly IShippingSettingsWebApiClient  _siteShippingSettingsClient;
        private readonly IShippingWebApiClient _uspsShippingSharedClient;

        public DiscountController(IDiscountWebApiClient discountWebClient, IShippingRateWebApiClient shippingRateClient, IShippingSettingsWebApiClient siteShippingSettingsClient, IShippingWebApiClient uspsShippingSharedClient)
        {
            if (discountWebClient == null)
            {
                throw new ArgumentNullException("discountWebClient");
            }

            if (shippingRateClient == null)
            {
                throw new ArgumentNullException("shippingRateClient");
            }

            if (siteShippingSettingsClient == null)
            {
                throw new ArgumentNullException("siteShippingSettingsClient");
            }

            if (uspsShippingSharedClient == null)
            {
                throw new ArgumentNullException("uspsShippingSharedClient");
            }

            _shippingRateClient = shippingRateClient;
            _siteShippingSettingsClient = siteShippingSettingsClient;
            _uspsShippingSharedClient = uspsShippingSharedClient;
            _discountWebClient = discountWebClient;
        }

        [WebInvoke(UriTemplate = "/create")]
        public Response<List<Discount>> CreateDiscount(List<Discount> discounts)
        {
            var responseList = new List<Discount>();

            foreach (var discount in discounts)
            {
                var response =
                    _discountWebClient.CreateDiscount(Mapper.Map<Mozu.ProductAdmin.Contracts.Discount>(discount)).Result.
                        ReadAsSync();
                responseList.Add(Mapper.Map<Discount>(response));
            }

            return List(responseList);
        }

        [ApiAuthorize]
        [WebGet(UriTemplate = "/read")]
        public Response<List<Discount>> ReadDiscount(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            if (pagingParams.id == null)
            {
                string filter = null;
                string productCode;
                if (extFilter.TryGetValue<string>("productCode", out productCode))
                {
                    filter = string.Format("Target.Products.Code eq \"{0}\"", productCode);
                }

                string name;

                if (extFilter.TryGetValue<string>("name", out name))
                {
                    filter = string.Format("content.name cont \"{0}\"", name);
                }

                var discountList = _discountWebClient.GetDiscounts(null, null, null, filter, null).Result.ReadAsSync();

                var discounts = discountList.Items.Select(Mapper.Map<Discount>).ToList();

                return List(discounts);
            }


            var disc = _discountWebClient.GetDiscount(pagingParams.NumericId).Result.ReadAsSync();

            return List(Mapper.Map<Discount>(disc));
        }

        [WebInvoke(UriTemplate = "/edit?id={id}")]
        public Response<List<Discount>> EditDiscount(List<Discount> discountList, int? id = null)
        {

            var retList =
                discountList.Select(
                    discount =>
                    _discountWebClient.UpdateDiscount(Mapper.Map<Mozu.ProductAdmin.Contracts.Discount>(discount),
                                                      discount.DiscountId).Result.ReadAsAsync().Result).Select(
                                                          Mapper.Map<Discount>).ToList();

            return List(retList);
        }

        [WebInvoke(Method = "POST", UriTemplate = "/delete")]
        public Response<Discount> DeleteProduct(List<Discount> discounts)
        {
            foreach (var d in discounts)
            {
                _discountWebClient.DeleteDiscount(d.DiscountId).Wait();
            }

            return Single(default(Discount), discounts.Count);
        }

        [WebGet(UriTemplate = "/generatecoupon")]
        public Response<CouponCode> GenerateCoupon(PagingParamaters pagingParams)
        {
            var coupon = _discountWebClient.GenerateRandomCoupon().Result.ReadAsAsync().Result;

            return Single(new CouponCode {Code = coupon});
        }

        [WebGet(UriTemplate = "/targetedshippingmethods/read")]
        public Response<List<TargetedShippingMethod>> GetTargetedShippingMethods(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            var res = _siteShippingSettingsClient.GetShippingMethods().Result.ReadAsAsync().Result;
            var methods = res.Select(siteShippingMethod => new TargetedShippingMethod { Code = siteShippingMethod.Code, Name = siteShippingMethod.Content.Name }).ToList();

            /*
            var activeRateProvider = _siteShippingSettingsClient.GetActiveRateProvider().Result.ReadAsAsync().Result;

            var methods = new List<TargetedShippingMethod>();

            
            if(activeRateProvider.Id == 1)
            {
                // Get the custom rates and convert them into shared methods
                var custom = _shippingRateClient.GetShippingRates(null, null, null, null).Result.ReadAsAsync().Result;

                methods.AddRange(custom.Items.Select(rate => new TargetedShippingMethod
                {
                    Name = rate.Content.Name, Code = rate.ShippingRateId.ToString()
                }));
            }
            else
            {
                // Get the USPS rates
                //var usps = _uspsShippingSharedClient.GetSharedOrGlobalShippingMethods(null, null, null, null).Result.ReadAsAsync().Result;

                //UspsConfiguration res = null;

                try
                {
                    var res = _uspsShippingInstanceClient.GetUspsConfiguration().Result.ReadAsAsync().Result;

                    methods.AddRange(res.ShippingMethods.Select(rate => new TargetedShippingMethod
                    {
                        Code = rate.Code,
                        Name = rate.Content.Name
                    }));
                }
                catch (Exception)
                {
                    // Ugh... if a config doesn't exist it throws an error. Return null.    
                }    
            }
            */

            return List(methods);
        }

        [WebGet(UriTemplate = "/selectedshippingmethods/read")]
        public Response<List<TargetedShippingMethod>> GetSelectedShippingMethods(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            var res = _siteShippingSettingsClient.GetShippingMethods().Result.ReadAsAsync().Result;
            var methods = res.Select(siteShippingMethod => new TargetedShippingMethod {Code = siteShippingMethod.Code, Name = siteShippingMethod.Content.Name}).ToList();

            return List(methods);
        }
    }
}
