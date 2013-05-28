using System;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models
{
    [DataContract]
    public class OrderItemDiscount
    {
        [DataMember(Name="quantity")]
        public int Quantity { get; set; }

        [DataMember(Name="description")]
        public string Description { get; set; }

        [DataMember(Name="unitPrice")]
        public decimal UnitPrice { get; set; }

        [DataMember(Name="total")]
        public decimal Total { get; set; }
    }
}
