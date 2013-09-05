using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    [DataContract]
    public class Order
    {
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "tenantId")]
        public int? TenantId { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "siteGroupId")]
        public int? SiteGroupId { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "siteId")]
        public int? SiteId { get; set; }

        /// <summary>
        /// A sequential order number, only populated for completed orders.
        /// </summary>
        [DataMember(Name = "orderNumber")]
        public int? OrderNumber { get; set; }

        [DataMember(Name = "returnStatus")]
        public string ReturnStatus { get; set; }

        [DataMember(Name = "createDate")]
        public DateTime CreateDate { get; set; }

        [DataMember(Name="customerId")]
        public int? CustomerId { get; set; }

        [DataMember(Name="billingContact")]
        public Contact BillingContact { get; set; }
        
        [DataMember(Name = "shippingContact")]
        public Contact ShippingContact { get; set; }

        [DataMember(Name = "ipAddress")]
        public string IpAddress { get; set; }

        [DataMember(Name = "items")]
        public List<OrderItem> Items { get; set; }

        /// <summary>
        /// Active order-level discount, if one exists.
        /// </summary>
        [DataMember(Name = "activeOrderDiscount", EmitDefaultValue = false)]
        public OrderDiscount ActiveOrderDiscount { get; set; }

        /// <summary>
        /// List of all active and non-active order-level discounts.
        /// </summary>
        [DataMember(Name = "orderDiscounts", EmitDefaultValue = false)]
        public List<OrderDiscount> OrderDiscounts { get; set; }

        #region Shipping
        [DataMember(Name = "shippingMethodCode")]
        public string ShippingMethodCode { get; set; }

        [DataMember(Name = "shippingMethodName")]
        public string ShippingMethodName { get; set; }

        [DataMember(Name = "activeShippingDiscount", EmitDefaultValue = false)]
        public ShippingDiscount ActiveShippingDiscount { get; set; }

        [DataMember(Name = "shippingDiscounts", EmitDefaultValue = false)]
        public List<ShippingDiscount> ShippingDiscounts { get; set; }
        #endregion

        [DataMember(Name = "customerNote", EmitDefaultValue = false)]
        public string CustomerNote { get; set; }

        #region workflow shit
        [DataMember(Name = "orderStatus")]
        public string OrderStatus { get; set; }

        [DataMember(Name = "shippingStatus")]
        public string ShippingStatus { get; set; }

        [DataMember(Name = "paymentStatus")]
        public string PaymentStatus { get; set; }

        [DataMember(Name = "payments")]
        public List<OrderPayment> Payments { get; set; }

        [DataMember(Name="packages", EmitDefaultValue=true)]
        public List<OrderPackage> Packages { get; set; }

        [DataMember(Name="unpackagedItems")]
        public List<OrderPackageItem> UnpackagedItems { get; set; }

        [DataMember(Name = "availableActions")]
        public List<string> AvailableActions { get; set; }
        #endregion

        /// <summary>
        /// Denormalization of payment summary data for UI.
        /// </summary>
        [DataMember(Name="authorizationInfo", EmitDefaultValue=false)]
        public OrderAuthorizationInfo AuthorizationInfo { get; set; }

        /// <summary>
        /// Total quantity of things ordered.
        /// </summary>
        [DataMember(Name="itemsOrdered", EmitDefaultValue=false)]
        public int ItemsOrdered { get; set; }

        /// <summary>
        /// Total quantity of things unshipped.
        /// </summary>
        [DataMember(Name = "itemsNotShipped", EmitDefaultValue = false)]
        public int ItemsNotShipped { get; set; }

        /// <summary>
        /// Total quantity of things shipped.
        /// </summary>
        [DataMember(Name = "itemsShipped", EmitDefaultValue = false)]
        public int ItemsShipped { get; set; }

        /// <summary>
        /// An optional order-level adjustment.
        /// </summary>
        [DataMember(Name = "orderAdjustment", EmitDefaultValue = false)]
        public Adjustment OrderAdjustment { get; set; }

        /// <summary>
        /// An optional order-level shipping adjustment.
        /// </summary>
        [DataMember(Name = "shippingAdjustment", EmitDefaultValue = false)]
        public Adjustment ShippingAdjustment { get; set; }

        /// <summary>
        /// Is this record a draft order.
        /// </summary>
        [DataMember(Name = "isDraft", EmitDefaultValue = true)]
        public bool IsDraft { get; set; }

        /// <summary>
        /// Is this record an order that has an unsaved draft.
        /// Note: Always false if IsDraft = true.
        /// </summary>
        [DataMember(Name = "hasDraft", EmitDefaultValue = true)]
        public bool HasDraft { get; set; }

        #region Totals

        /// <summary>
        /// Price without shipping, discounts, or anything.
        /// </summary>
        [DataMember(Name = "subtotal")]
        public decimal Subtotal { get; set; }

        /// <summary>
        /// Cost of all items in the order, after item-level discounts are applied.
        /// </summary>
        [DataMember(Name="discountedSubtotal")]
        public decimal DiscountedSubtotal { get; set; }

        /// <summary>
        /// Sum of all applied discounts.
        /// </summary>
        [DataMember(Name="discountTotal")]
        public decimal DiscountTotal { get; set; }

        /// <summary>
        /// Order cost after all discounts are applied but before shipping, handling, and taxes.
        /// </summary>
        [DataMember(Name="discountedTotal")]
        public decimal DiscountedTotal { get; set; }

        /// <summary>
        /// Price of shipping before fees and adjustments.
        /// </summary>
        [DataMember(Name = "shippingSubtotal")]
        public decimal ShippingSubtotal;

        /// <summary>
        /// Final cost of shipping.
        /// </summary>
        [DataMember(Name = "shippingTotal")]
        public decimal ShippingTotal { get; set; }

        /// <summary>
        /// Cost of handling.
        /// </summary>
        [DataMember(Name = "handlingTotal")]
        public decimal HandlingTotal { get; set; }

        /// <summary>
        /// Sum of any fees.
        /// </summary>
        [DataMember(Name = "feeTotal")]
        public decimal FeeTotal { get; set; }

        /// <summary>
        /// Final cost of taxes.
        /// </summary>
        [DataMember(Name = "taxTotal", EmitDefaultValue = true)]
        public decimal TaxTotal { get; set; }

        /// <summary>
        /// Final price of the order.
        /// </summary>
        [DataMember(Name = "total")]
        public decimal Total { get; set; }

        #endregion
    }
}