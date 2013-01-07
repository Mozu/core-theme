using System;
using System.Runtime.Serialization;
using Mozu.SiteBuilder.UX.Models.Customers;

namespace Mozu.SiteBuilder.UX.Models.Orders
{
    [DataContract]
    public class Shipment
    {
        [DataMember(Name = "shippingAddress")]
        public Contact ShippingAddress { get; set; }

        [DataMember(Name = "carrier")]
        public string Carrier { get; set; }

        [DataMember(Name = "status")]
        public string Status { get; set; }

        [DataMember(Name = "price")]
        public ShippingPrice Price { get; set; }

        [DataMember(Name = "shippingMethodCode")]
        public string ShippingMethodCode { get; set; }

        [DataMember(Name = "trackingCodeOrNumber")]
        public string TrackingCodeOrNumber { get; set; }

        [DataMember(Name = "trackingLink")]
        public string TrackingLink { get; set; }

        [DataMember(Name = "estimatedDeliveryDate")]
        public DateTime? EstimatedDeliveryDate { get; set; }

        [DataMember(Name = "createDate")]
        public DateTime? CreateDate { get; set; }

        [DataMember(Name = "createBy")]
        public string CreateBy { get; set; }

        [DataMember(Name = "updateDate")]
        public DateTime? UpdateDate { get; set; }

        [DataMember(Name = "updateBy")]
        public string UpdateBy { get; set; }
    }
}