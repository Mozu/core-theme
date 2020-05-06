using System;
using System.Collections.Generic;
using System.Linq;
using Mozu.CommerceRuntime.Contracts.Discounts;
using Newtonsoft.Json;
using System.Web;
using DC = Mozu.CommerceRuntime.Contracts.Orders;
using DCpay = Mozu.CommerceRuntime.Contracts.Payments;
using DCcredit = Mozu.Customer.Contracts.Credit;
using Mozu.CommerceRuntime.Contracts.Fulfillment;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    
    public class Order
    {
        public string Id { get; set; }
        
        public int? TenantId { get; set; }

        public string ChannelCode { get; set; }

        /// <summary>
        /// Online or offline order.
        /// Valid values are defined in Order.OrderTypeConst
        /// </summary>
        public string OrderType { get; set; }

        public int? SiteId { get; set; }

        public string OriginalCartId { get; set; }

        public string ParentOrderId { get; set; }

        public int? ParentOrderNumber { get; set; }

        public string ParentReturnId { get; set; }

        public int? ParentReturnNumber { get; set; }

        public string ParentCheckoutId { get; set; }
        
        public int? ParentCheckoutNumber { get; set; }

        public int? PartialOrderNumber { get; set; }

        public int? PartialOrderCount { get; set; }

        /// <summary>
        /// An order number to link this order to an external system
        /// </summary>
        public string ExternalId { get; set; }

        public string Email { get; set; }

        public List<InvalidCoupon> InvalidCoupons { get; set; }

        /// <summary>
        ///  Coupon codes attempted or attached to this order.
        /// </summary>
        public List<string> CouponCodes { get; set; }

        /// <summary>
        /// A sequential order number, only populated for completed orders.
        /// </summary>
        public int? OrderNumber { get; set; }

        public string ReturnStatus { get; set; }

        public DateTime CreateDate { get; set; }
        public string CreateBy { get; set; }

        public DateTime UpdateDate { get; set; }
        public string UpdateBy { get; set; }

        public DateTime? SubmittedDate { get; set; }

        public int? CustomerId { get; set; }

        public string UserId { get; set; }

        public Contact BillingContact { get; set; }

        public Contact FulfillmentContact { get; set; }

        public string IpAddress { get; set; }

        /// <summary>
        /// List of attributes assigned to the order.
        /// </summary>
        public List<DC.OrderAttribute> Attributes { get; set; }


        public List<OrderItem> Items { get; set; }

        /// <summary>
        /// Active order-level discount, if one exists.
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public List<OrderDiscount> ActiveOrderDiscounts { get; set; }

        /// <summary>
        /// List of all active and non-active order-level discounts.
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public List<OrderDiscount> OrderDiscounts { get; set; }

        #region Shipping
        public string ShippingMethodCode { get; set; }

        public string ShippingMethodName { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public ShippingDiscount ActiveShippingDiscount { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public List<ShippingDiscount> ShippingDiscounts { get; set; }
        #endregion

        /// <summary>
        /// Notes entered by the shopper, if any.
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string CustomerNote { get; set; }

        /// <summary>
        /// gift message entered by shopper, if any.
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string GiftMessage { get; set; }

        /// <summary>
        /// Internal notes that a merchant may add to the order. Maximum 250 characters.
        /// </summary>
        public List<OrderNote> InternalNotes { get; set; }

        #region workflow shit
        public string OrderStatus { get; set; }

        public string FulfillmentStatus { get; set; }

        public string PaymentStatus { get; set; }

        public List<OrderPayment> Payments { get; set; }

        public List<OrderRefund> Refunds { get; set; }

        public List<OrderPackage> Packages { get; set; }

        public List<Shipment> Shipments { get; set; }

        public List<OrderDigitalPackage> DigitalPackages { get; set; }

        public List<OrderPickup> Pickups { get; set; }

        public List<OrderPackageItem> UnpackagedItems { get; set; }

        public List<OrderPickupItem> UnpickedupItems { get; set; }

        public List<OrderDigitalPackageItem> UndeliveredDigitalItems { get; set; }

        public List<string> AvailableActions { get; set; }

        public List<string> AvailableBulkActions { get; set; }
        #endregion

        /// <summary>
        /// Denormalization of payment summary data for UI.
        /// obsolete, supplanted by OrderAuthorizationInfo
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public OrderAuthorizationInfo AuthorizationInfo { get; set; }

        /// <summary>
        /// Denormalization of payment summary data for UI.
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public OrderSummary OrderSummary { get; set; }

        /// <summary>
        /// Total quantity of things ordered.
        /// </summary>
        public int ItemsOrdered { get; set; }

        /// <summary>
        /// Total quantity of things unshipped.
        /// </summary>
        public int ItemsNotShipped { get; set; }

        /// <summary>
        /// Total quantity of things shipped.
        /// </summary>
        public int ItemsShipped { get; set; }


        /// <summary>
        /// Total quantity of things shipped.
        /// </summary>
        public int ItemsPackaged { get; set; }


        /// <summary>
        /// Total quantity of things unpicked.
        /// </summary>
        public int ItemsNotPickedup { get; set; }

        /// <summary>
        /// Total quantity of things in pickups that haven't been marked as fulfilled.
        /// </summary>
        public int ItemsInPickups { get; set; }

        /// <summary>
        /// Total quantity of things in pickups that have been marked as fulfilled.
        /// </summary>
        public int ItemsPickedup { get; set; }

        /// <summary>
        /// Total quantity of things emailed.
        /// </summary>
        public int ItemsNotDigitallyFulfilled { get; set; }

        /// <summary>
        /// Total quantity of things not emailed.
        /// </summary>
        public int ItemsDigitallyFulfilled { get; set; }

        /// <summary>
        /// An optional order-level adjustment.
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Adjustment OrderAdjustment { get; set; }

        /// <summary>
        /// An optional order-level shipping adjustment.
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Adjustment ShippingAdjustment { get; set; }

        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Adjustment HandlingAdjustment { get; set; }

        /// <summary>
        /// Is this record a draft order.
        /// </summary>
        public bool IsDraft { get; set; }

        /// <summary>
        /// Is this record an order that has an unsaved draft.
        /// Note: Always false if IsDraft = true.
        /// </summary>
        public bool HasDraft { get; set; }

        /// <summary>
        /// A list of ValidationResults from the order service.
        /// </summary>
        public List<DC.OrderValidationResult> ValidationResults { get; set; }

        /// <summary>
        /// A fraud score, if one was included in the ValidationResults.
        /// </summary>
        public string FraudScore { get; set; }

        #region Totals

        /// <summary>
        /// Price without shipping, discounts, or anything.
        /// </summary>
        public decimal Subtotal { get; set; }

        /// <summary>
        /// Cost of all items in the order, after item-level discounts are applied.
        /// </summary>
        public decimal DiscountedSubtotal { get; set; }

        /// <summary>
        /// Sum of all applied discounts.
        /// </summary>
        public decimal DiscountTotal { get; set; }

        /// <summary>
        /// Order cost after all discounts are applied but before shipping, handling, and taxes.
        /// </summary>
        public decimal DiscountedTotal { get; set; }

        /// <summary>
        /// Price of shipping before fees and adjustments.
        /// </summary>
        public decimal ShippingSubtotal { get; set; }

        /// <summary>
        /// Final cost of shipping.
        /// </summary>
        public decimal ShippingTotal { get; set; }

        /// <summary>
        /// Cost of handling.
        /// </summary>
        public decimal HandlingTotal { get; set; }

        /// <summary>
        /// Sum of any fees.
        /// </summary>
        public decimal FeeTotal { get; set; }

        /// <summary>
        /// Final cost of taxes.
        /// </summary>
        public decimal TaxTotal { get; set; }

        /// <summary>
        /// Final cost of taxes plus the duty fees of the order.
        /// </summary>
        public decimal TaxDutyTotal {
            get
            {
                return DutyTotal + TaxTotal;
            }
        }

        /// <summary>
        /// Final cost of all duty fees associated with the order.
        /// </summary>
        public decimal DutyTotal { get; set; }

        /// <summary>
        /// Final price of the order.
        /// </summary>
        public decimal Total { get; set; }

        /// <summary>
        /// Total amount issued in refunds.
        /// </summary>
        public decimal AmountRefunded { get; set; }

        #endregion

        public Customer Customer { get; set; }

        /// <summary>
        /// Pricelist code for the order
        /// 
        /// </summary>
        public string PriceListCode { get; set; }

        public decimal HandlingAmount { get; set; }

        public decimal? ItemTaxTotal { get; set; }

        public decimal? HandlingTaxTotal { get; set; }

        public decimal? ShippingTaxTotal { get; set; }

        public decimal? LineItemSubtotalWithOrderAdjustments { get; set; }

        public decimal? ShippingAmountBeforeDiscountsAndAdjustments { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public List<HandlingDiscount> HandlingDiscounts { get; set; }

        public decimal? AdjustmentTotal
        {
            get
            {
                return (OrderAdjustment != null ? OrderAdjustment.Amount : 0) +
                    (ActiveOrderDiscounts != null ? (-ActiveOrderDiscounts.Sum(x=>x.Total)) : 0)
                    ;
            }
        }

        public decimal? DiscountedTotalWithAdjustment
        { 
            get
            {
                return DiscountedTotal + (OrderAdjustment != null ? OrderAdjustment.Amount : 0);
            }
        }

        public decimal ShippingAndHandlingTotal
        {
            get
            {
                return ShippingTotal + HandlingTotal;
            }
        }
        
        public List<LineIdFee> LineItemHandlingFees
        {
            get
            {
                var result = Items
                    .Where(i => i.HandlingAmount.HasValue)
                    .OrderBy(i => i.LineId)
                    .Select(i => new LineIdFee { LineId = i.LineId, Fee = i.HandlingAmount.Value })
                    .ToList();

                return result;
            }
        }

        public List<LineIdFee> LineItemShippingDiscounts
        {
            get
            {
                var result = Items
                    .Where(i => i.ActiveShippingDiscount != null)
                    .OrderBy(i => i.LineId)
                    .Select(i => new LineIdFee { LineId = i.LineId, Fee = i.ActiveShippingDiscount.Total, Name = i.ActiveShippingDiscount.Description })
                    .ToList();

                return result;
            }
        }

        /// <summary>
        /// Was this order created by the Unified platform.
        /// </summary>
        /// <remarks>
        /// If true, this order was created by the Unified (.NET Core) platform.
        /// If false, this order was created by the legacy (.NET Framework) platform.
        /// This is a read-only field and any set value will be ignored.
        /// </remarks>
        public bool IsUnified { get; set; }
    }

    public class LineIdFee
    {
        public int LineId { get; set; }
        public decimal Fee { get; set; }
        public string Name { get; set; }
    }
}
