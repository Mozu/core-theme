using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using MoreLinq;
using Mozu.CommerceRuntime.Contracts.Discounts;
using Mozu.Core.Api.Routing;
using Mozu.Core.Exceptions;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using Mozu.SiteBuilder.UX.Admin.Helpers;
using DC = Mozu.CommerceRuntime.Contracts.Orders;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public partial class OrderController
    {
        public class UpdateAdjustmentArgs
        {
            public string OrderId { get; set; }
            public Adjustment OrderAdjustment { get; set; }
            public Adjustment ShippingAdjustment { get; set; }
        }
        [HttpPostRoute(UriTemplate = "adjustment")]
        public async Task<Response<Order>> AddOrUpdateAdjustment(UpdateAdjustmentArgs args, [FromUri] bool draft = false)
        {
            DC.Order dcOrder = null;

            if (args.OrderAdjustment != null && args.OrderAdjustment.Amount.HasValue)
            {
                if (args.OrderAdjustment.Amount == 0)
                    dcOrder = (await _orderWebApiClient.RemoveAdjustment(args.OrderId, draft ? APPLY_TO_DRAFT : APPLY_TO_ORIGINAL)).ReadAsSync();
                else
                    dcOrder = (await _orderWebApiClient.ApplyAdjustment(args.OrderId, args.OrderAdjustment.Map<Mozu.CommerceRuntime.Contracts.Commerce.Adjustment>(), draft ? APPLY_TO_DRAFT : APPLY_TO_ORIGINAL)).ReadAsSync();
            }
            if (args.ShippingAdjustment != null && args.ShippingAdjustment.Amount.HasValue)
            {
                if (args.ShippingAdjustment.Amount == 0)
                    dcOrder = (await _orderWebApiClient.RemoveShippingAdjustment(args.OrderId, draft ? APPLY_TO_DRAFT : APPLY_TO_ORIGINAL)).ReadAsSync();
                else
                    dcOrder = (await _orderWebApiClient.ApplyShippingAdjustment(args.OrderId, args.ShippingAdjustment.Map<Mozu.CommerceRuntime.Contracts.Commerce.Adjustment>(), draft ? APPLY_TO_DRAFT : APPLY_TO_ORIGINAL)).ReadAsSync();
            }

            if (dcOrder != null)
                return Single2(dcOrder.Map<Order>());
            else
                return Message3<Order>(false, "You must provide an order adjustment or a shipping adjustment.");
        }

        public class AddRemoveCouponArgs
        {
            public string OrderId { get; set; }
            public List<string> Coupons { get; set; }
        }
        [HttpPostRoute(UriTemplate = "addcoupon")]
        public async Task<Response<Order>> AddCoupon(AddRemoveCouponArgs args, [FromUri]bool draft = false)
        {
            DC.Order dcOrder = null;
            foreach (string couponCode in args.Coupons)
            {
                dcOrder = (await _orderWebApiClient.ApplyCoupon(args.OrderId, couponCode, draft ? APPLY_TO_DRAFT : APPLY_TO_ORIGINAL)).ReadAsSync();
            }

            if (dcOrder == null)
            {
                throw new VaeUnexpectedErrorException("Could not apply coupon to order. Please try again");
            }

            return dcOrder != null ? Single2(dcOrder.Map<Order>()) : Message3<Order>(false, "No coupons were applied.");
        }

//        private static string BuildInvalidCouponMessage(int invalidCount, IEnumerable<InvalidCoupon> invalidCoupons)
//        {
//            string errMsg;
//            if (invalidCount == 1)
//            {
//                var singleCoupon = invalidCoupons.First();
//                errMsg = string.Format("Invalid coupon: {0} - {1}", singleCoupon.CouponCode, singleCoupon.Reason);
//            }
//            else
//            {
//                var sb = new StringBuilder();
//                sb.Append("Invalid coupons: ");
//                foreach (var invCoupon in invalidCoupons)
//                {
//                    sb.Append(invCoupon.CouponCode);
//                    sb.Append(" - ").Append(invCoupon.Reason).Append(";");
//                }
//                errMsg = sb.ToString();
//            }
//            return errMsg;
//        }

        [HttpPostRoute(UriTemplate = "removecoupon")]
        public async Task<Response<Order>> RemoveCoupon(AddRemoveCouponArgs args, [FromUri]bool draft = false)
        {
            DC.Order dcOrder = null;
            foreach (string couponCode in args.Coupons)
            {
                dcOrder = (await _orderWebApiClient.RemoveCoupon(args.OrderId, couponCode, draft ? APPLY_TO_DRAFT : APPLY_TO_ORIGINAL)).ReadAsSync();
            }

            if (dcOrder != null)
                return Single2(dcOrder.Map<Order>());
            else
                return Message3<Order>(false, "No coupons were removed.");
        }

        public class ActivateSuppressDiscountArgs
        {
            public string OrderId { get; set; }
            public string OrderItemId { get; set; }
            public int DiscountId { get; set; }
        }
        [HttpPostRoute(UriTemplate = "suppressdiscount")]
        public async Task<Response<Order>> SuppressDiscount(ActivateSuppressDiscountArgs args, [FromUri]bool draft = false)
        {
            if (!String.IsNullOrEmpty(args.OrderItemId))
                return await SuppressItemDiscount(args, draft);

            DC.Order dcOrder = (await _orderWebApiClient.GetOrder(args.OrderId, draft)).ReadAsSync();

            var discount = dcOrder.OrderDiscounts.FirstOrDefault(d => d.Discount.Id == args.DiscountId) ?? dcOrder.ShippingDiscounts.Select(sd => sd.Discount).FirstOrDefault(d => d.Discount.Id == args.DiscountId);

            if (discount != null)
            {
                discount.Excluded = true;
                await _orderWebApiClient.UpdateOrderDiscount(args.OrderId, discount.Discount.Id, discount, draft ? APPLY_TO_DRAFT : APPLY_TO_ORIGINAL);
            }
            else
            {
                return Message3<Order>(false, "No discount found with id: " + args.DiscountId);
            }

            dcOrder = (await _orderWebApiClient.GetOrder(args.OrderId, draft)).ReadAsSync();
            return Single2(dcOrder.Map<Order>());
        }

        [HttpPostRoute(UriTemplate = "activatediscount")]
        public async Task<Response<Order>> ActivateDiscount(ActivateSuppressDiscountArgs args, [FromUri]bool draft = false)
        {
            if (!String.IsNullOrEmpty(args.OrderItemId))
                return await ActivateItemDiscount(args, draft);

            DC.Order dcOrder = (await _orderWebApiClient.GetOrder(args.OrderId, draft)).ReadAsSync();

            var discount = dcOrder.OrderDiscounts.FirstOrDefault(d => d.Discount.Id == args.DiscountId) ?? dcOrder.ShippingDiscounts.Select(sd => sd.Discount).FirstOrDefault(d => d.Discount.Id == args.DiscountId);

            if (discount != null)
            {
                discount.Excluded = false;
                await _orderWebApiClient.UpdateOrderDiscount(args.OrderId, discount.Discount.Id, discount, draft ? APPLY_TO_DRAFT : APPLY_TO_ORIGINAL);
            }
            else
            {
                return Message3<Order>(false, "No discount found with id: " + args.DiscountId);
            }

            dcOrder = (await _orderWebApiClient.GetOrder(args.OrderId, draft)).ReadAsSync();
            return Single2(dcOrder.Map<Order>());
        }

    }
}
