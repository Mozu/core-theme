using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models
{
    [DataContract]
    public class Order
    {
        [DataMember(Name = "id")]
        public string Id { get; set; }

        /// <summary>
        /// A sequential order number, only populated for completed orders.
        /// </summary>
        [DataMember(Name = "orderNumber")]
        public int? OrderNumber { get; set; }

        [DataMember(Name = "createDate")]
        public DateTime CreateDate { get; set; }

        [DataMember(Name="customer")]
        public OrderCustomer Customer { get; set; }

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
        public decimal OrderDiscountDescription { get; set; }

        /// <summary>
        /// Value order-level discount, if one exists.
        /// </summary>
        [DataMember(Name = "orderDiscountTotal", EmitDefaultValue = false)]
        public decimal OrderDiscountTotal { get; set; }

        #region Shipping
        [DataMember(Name = "shippingCost")]
        public decimal ShippingCost;

        [DataMember(Name = "shippingDescription")]
        public string ShippingDescription { get; set; }

        [DataMember(Name = "shippingDiscount", EmitDefaultValue = false)]
        public decimal ShippingDiscount { get; set; }

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

        [Obsolete]
        [DataMember(Name = "availableOrderActions")]
        public List<string> AvailableOrderActions { get; set; }
        #endregion
    }
}