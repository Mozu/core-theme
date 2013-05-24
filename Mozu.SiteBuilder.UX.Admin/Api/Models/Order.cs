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

        [DataMember(Name="customer")]
        public OrderCustomer Customer { get; set; }

        [DataMember(Name = "ipAddress")]
        public string IpAddress { get; set; }

        [DataMember(Name = "total")]
        public decimal Total { get; set; }

        [DataMember(Name = "orderStatus")]
        public string OrderStatus { get; set; }

        [DataMember(Name = "shippingStatus")]
        public string ShippingStatus { get; set; }

        [DataMember(Name = "paymentStatus")]
        public string PaymentStatus { get; set; }

        [DataMember(Name = "availableOrderActions")]
        public List<string> AvailableOrderActions { get; set; }
    }
}