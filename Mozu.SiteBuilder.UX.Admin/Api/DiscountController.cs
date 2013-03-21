using System;
using System.Linq;
using System.Collections.Generic;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.Core.Api.Client.Exceptions;
using DC = Mozu.ProductAdmin.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Discount;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    /// <summary>
    /// Controller for discounts.
    /// </summary>
    [ServiceContract]
    public class DiscountController : BaseController
    {
        private readonly IDiscountWebApiClient _discountWebClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public DiscountController(IDiscountWebApiClient discountWebClient)
        {
            _discountWebClient = discountWebClient;
        }

        /// <summary>
        /// Get a list of discounts.
        /// </summary>
        [WebGet(UriTemplate = "read")]
        public async Task<Response<List<Discount>>> ReadDiscount(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            if (pagingParams.id != null)
            {
                var singleDiscount = (await _discountWebClient.GetDiscount(pagingParams.NumericId)).ReadAsSync();

                return List2(Mapper.Map<Discount>(singleDiscount));
            }

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

            try
            {
                var discountList = (await _discountWebClient.GetDiscounts(null, null, null, filter, null)).ReadAsSync();

                var discounts = Mapper.Map<List<Discount>>(discountList.Items);

                return List2(discounts);
            }
            catch (ApiWebClientConnectionException e)
            {
                return this.FailureList2<Discount>(e.Message);
            }
        }

        [WebInvoke(UriTemplate = "create")]
        public async Task<Response<List<Discount>>> CreateDiscount(List<Discount> discounts)
        {
            var responseList = new List<Discount>();


            foreach (var discount in discounts)
            {
                var dc = Mapper.Map<DC.Discount>(discount);

                // the Mozu service does not accept a null StartDate, even though the field is nullable.
                // TODO: this may be fixed in the future on their end.
                if (dc.StartDate == null)
                    dc.StartDate = DateTime.UtcNow;

                var response = (await _discountWebClient.CreateDiscount(dc)).ReadAsSync();
                responseList.Add(Mapper.Map<Discount>(response));
            }

            return List2(responseList);
        }

        //        [ApiAuthorize]
        //        [WebGet(UriTemplate = "read")]
        //        public async Task<Response<List<Discount>>> ReadDiscount(PagingParamaters pagingParams, FilterCollection extFilter)
        //        {
        //            if (pagingParams.id == null)
        //            {
        //                string filter = null;
        //                string productCode;
        //                if (extFilter.TryGetValue<string>("productCode", out productCode))
        //                {
        //                    filter = string.Format("Target.Products.Code eq \"{0}\"", productCode);
        //                }

        //                string name;

        //                if (extFilter.TryGetValue<string>("name", out name))
        //                {
        //                    filter = string.Format("content.name cont \"{0}\"", name);
        //                }

        //                var discountList = await _discountWebClient.GetDiscounts(null, null, null, filter, null).Result.ReadAsAsync();

        //                var discounts = discountList.Items.Select(Mapper.Map<Discount>).ToList();

        //                return List2(discounts);
        //            }

        //            var disc = await _discountWebClient.GetDiscount(pagingParams.NumericId).Result.ReadAsAsync();

        //            return List2(Mapper.Map<Discount>(disc));
        //        }

        //        [WebInvoke(UriTemplate = "edit?id={id}")]
        //        public async Task<Response<List<Discount>>> EditDiscount(List<Discount> discountList, int? id = null)
        //        {
        //            var retList = new List<Discount>();

        //            foreach (var discount in discountList)
        //            {
        //                var task = await _discountWebClient.UpdateDiscount(Mapper.Map<ProductAdmin.Contracts.Discount>(discount), discount.DiscountId);
        //                retList.Add(Mapper.Map<Discount>(task.ReadAsSync()));
        //            }

        //            return List2(retList);
        //        }

        //        [WebInvoke(Method = "POST", UriTemplate = "delete")]
        //        public async Task<Response<Discount>> DeleteProduct(List<Discount> discounts)
        //        {
        //            foreach (var d in discounts)
        //            {
        //                await _discountWebClient.DeleteDiscount(d.DiscountId);
        //            }

        //            return Single2(default(Discount), discounts.Count);
        //        }

        //        [WebGet(UriTemplate = "generatecoupon")]
        //        public async Task<Response<CouponCode>> GenerateCoupon(PagingParamaters pagingParams)
        //        {
        //            var coupon = await _discountWebClient.GenerateRandomCoupon().Result.ReadAsAsync();

        //            return Single2(new CouponCode {Code = coupon});
        //        }

        //        [WebGet(UriTemplate = "targetedshippingmethods/read")]
        //        public async Task<Response<List<TargetedShippingMethod>>> GetTargetedShippingMethods(PagingParamaters pagingParams, FilterCollection extFilter)
        //        {
        //            var res = await _siteShippingSettingsClient.GetShippingMethods().Result.ReadAsAsync();
        //            var methods = res.Select(siteShippingMethod => new TargetedShippingMethod { Code = siteShippingMethod.Code, Name = siteShippingMethod.Content.Name }).ToList();

        //            /*
        //            var activeRateProvider = _siteShippingSettingsClient.GetActiveRateProvider().Result.ReadAsAsync().Result;

        //            var methods = new List<TargetedShippingMethod>();


        //            if(activeRateProvider.Id == 1)
        //            {
        //                // Get the custom rates and convert them into shared methods
        //                var custom = _shippingRateClient.GetShippingRates(null, null, null, null).Result.ReadAsAsync().Result;

        //                methods.AddRange(custom.Items.Select(rate => new TargetedShippingMethod
        //                {
        //                    Name = rate.Content.Name, Code = rate.ShippingRateId.ToString()
        //                }));
        //            }
        //            else
        //            {
        //                // Get the USPS rates
        //                //var usps = _uspsShippingSharedClient.GetSharedOrGlobalShippingMethods(null, null, null, null).Result.ReadAsAsync().Result;

        //                //UspsConfiguration res = null;

        //                try
        //                {
        //                    var res = _uspsShippingInstanceClient.GetUspsConfiguration().Result.ReadAsAsync().Result;

        //                    methods.AddRange(res.ShippingMethods.Select(rate => new TargetedShippingMethod
        //                    {
        //                        Code = rate.Code,
        //                        Name = rate.Content.Name
        //                    }));
        //                }
        //                catch (Exception)
        //                {
        //                    // Ugh... if a config doesn't exist it throws an error. Return null.    
        //                }    
        //            }
        //            */

        //            return List2(methods);
        //        }

        //        [WebGet(UriTemplate = "selectedshippingmethods/read")]
        //        public async Task<Response<List<TargetedShippingMethod>>> GetSelectedShippingMethods(PagingParamaters pagingParams, FilterCollection extFilter)
        //        {
        //            var res = await _siteShippingSettingsClient.GetShippingMethods().Result.ReadAsAsync();
        //            var methods = res.Select(siteShippingMethod => new TargetedShippingMethod {Code = siteShippingMethod.Code, Name = siteShippingMethod.Content.Name}).ToList();

        //            return List2(methods);
        //        }
        //    }
        //}
    }
}