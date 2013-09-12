using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    [DataContract]
    public class OrderItem
    {
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name="productCode")]
        public string ProductCode { get; set; }
        
        // [DataMember(Name = "originalCartItemId")]
        // public string OriginalCartItemId { get; set; }

        [DataMember(Name="options", EmitDefaultValue=true)]
        public List<Mozu.CommerceRuntime.Contracts.Products.ProductOption> Options { get; set; }

        [DataMember(Name = "productName")]
        public string ProductName { get; set; }

        [DataMember(Name = "unitPrice")]
        public decimal UnitPrice { get; set; }

        [DataMember(Name = "listPrice")]
        public decimal ListPrice { get; set; }

        [DataMember(Name = "salePrice")]
        public decimal? SalePrice { get; set; }

        [DataMember(Name = "unitWeight")]
        public decimal? UnitWeight { get; set; }

        [DataMember(Name = "quantity")]
        public int Quantity { get; set; }

        [DataMember(Name = "activeDiscount", EmitDefaultValue = true)]
        public OrderItemDiscount ActiveDiscount { get; set; }

        [DataMember(Name = "discounts", EmitDefaultValue=true)]
        public List<OrderItemDiscount> Discounts { get; set; }

        [DataMember(Name = "activeShippingDiscount", EmitDefaultValue = true)]
        public ShippingDiscount ActiveShippingDiscount { get; set; }

        [DataMember(Name = "shippingDiscounts", EmitDefaultValue = true)]
        public List<ShippingDiscount> ShippingDiscounts { get; set; }

        /// <summary>
        /// Subtotal of this line.
        /// Warning: This is calculated as list price * quantity.
        /// Items which have a sale price may behave unexpectedly.
        /// </summary>
        [DataMember(Name = "subtotal")]
        public decimal Subtotal { get; set; }

        /// <summary>
        /// The subtotal intended to be displayed to the user.
        /// This is: sale/list price * quantity
        /// NOT including line-item discounts.
        /// </summary>
        [DataMember(Name = "displaySubtotal")]
        public decimal DisplaySubtotal { get; set; }

        [DataMember(Name = "total")]
        public decimal Total { get; set; }
    }
}
