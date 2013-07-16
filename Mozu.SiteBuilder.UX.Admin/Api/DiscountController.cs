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
                var discountList = (await _discountWebClient.GetDiscounts(pagingParams.startIndex, pagingParams.pageSize , null, filter, null)).ReadAsSync();

                var discounts = Mapper.Map<List<Discount>>(discountList.Items);

                return List2(discounts, (int?)discountList.TotalCount );
            }
            catch (ApiWebClientConnectionException e)
            {
                return this.FailureList2<Discount>(e.Message);
            }
        }

        /// <summary>
        /// Create a new discount.
        /// </summary>
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

                // the Mozu service does not allow us to pick "FreeShipping" but have no shipping methods associated.
                if (dc.Target.Type == "FreeShipping" && (dc.Target.ShippingMethods == null || dc.Target.ShippingMethods.Count == 0))
                {
                    var meth = new DC.TargetedShippingMethod { Code = "FreeShipping", Name = "Free Shipping" };
                    dc.Target.ShippingMethods = new List<DC.TargetedShippingMethod>(new[] { meth });
                }

                try
                {
                    var response = (await _discountWebClient.CreateDiscount(dc)).ReadAsSync();
                    responseList.Add(Mapper.Map<Discount>(response));
                }
                catch (ApiWebClientConnectionException e)
                {
                    return this.FailureList2<Discount>(e.Message);
                }
            }

            return List2(responseList);
        }

        /// <summary>
        /// Update an existing discount.
        /// </summary>
        [WebInvoke(UriTemplate = "edit")]
        public async Task<Response<List<Discount>>> EditDiscount(List<Discount> discountList, int? id = null)
        {
            var retList = new List<Discount>();

            foreach (var discount in discountList)
            {
                var dc = Mapper.Map<DC.Discount>(discount);
                var res = (await _discountWebClient.UpdateDiscount(dc, discount.Id )).ReadAsSync();
                retList.Add(Mapper.Map<Discount>(res));
            }

            return List2(retList);
        }
    }
}