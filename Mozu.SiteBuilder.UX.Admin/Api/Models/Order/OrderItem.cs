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

        [DataMember(Name="options")]
        public List<string> Options { get; set; }

        [DataMember(Name = "productName")]
        public string ProductName { get; set; }

        [DataMember(Name = "unitPrice")]
        public decimal UnitPrice { get; set; }

        [DataMember(Name = "unitWeight")]
        public decimal? UnitWeight { get; set; }

        [DataMember(Name = "quantity")]
        public int Quantity { get; set; }

        [DataMember(Name = "activeDiscount", EmitDefaultValue = true)]
        public OrderItemDiscount ActiveDiscount { get; set; }

        [DataMember(Name = "discounts", EmitDefaultValue=true)]
        public List<OrderItemDiscount> Discounts { get; set; }

        [DataMember(Name = "subtotal")]
        public decimal Subtotal { get; set; }

        [DataMember(Name = "total")]
        public decimal Total { get; set; }
    }
}
