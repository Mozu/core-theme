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

        [DataMember(Name = "subtotal")]
        public decimal Subtotal { get; set; }

        /// <summary>
        /// Description of order-level discount, if one exists.
        /// </summary>
        [DataMember(Name = "orderDiscountDescription", EmitDefaultValue = false)]
        public string OrderDiscountDescription { get; set; }

        /// <summary>
        /// Value order-level discount, if one exists.
        /// </summary>
        [DataMember(Name = "orderDiscountTotal", EmitDefaultValue = false)]
        public decimal OrderDiscountTotal { get; set; }

        #region Shipping
        [DataMember(Name = "shippingMethodCode")]
        public string ShippingMethodCode { get; set; }

        [DataMember(Name = "shippingMethodName")]
        public string ShippingMethodName { get; set; }

        [DataMember(Name = "shippingCost")]
        public decimal ShippingCost;

        [DataMember(Name = "shippingDiscount", EmitDefaultValue = false)]
        public decimal? ShippingDiscount { get; set; }

        [DataMember(Name = "shippingDiscountDescription", EmitDefaultValue = false)]
        public string ShippingDiscountDescription { get; set; }

        [DataMember(Name = "shippingTotal")]
        public decimal ShippingTotal { get; set; }
        #endregion

        #region Taxes, fees, and adjustments
        [DataMember(Name = "taxTotal", EmitDefaultValue = true)]
        public decimal TaxTotal { get; set; }

        [DataMember(Name = "feeTotal", EmitDefaultValue = false)]
        public decimal FeeTotal { get; set; }

        [DataMember(Name = "adjustmentDescription", EmitDefaultValue = false)]
        public string AdjustmentDescription { get; set; }

        [DataMember(Name = "adjustmentTotal", EmitDefaultValue = false)]
        public decimal AdjustmentTotal { get; set; }
        #endregion

        [DataMember(Name = "total")]
        public decimal Total { get; set; }

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
    }
}