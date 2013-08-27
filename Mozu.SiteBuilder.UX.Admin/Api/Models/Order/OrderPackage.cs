using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    [DataContract]
    public class OrderPackage
    {
        [DataMember(Name="id")]
        public string Id { get; set; }

        [DataMember(Name = "orderId", EmitDefaultValue = true)]
        public string OrderId { get; set; }

        [DataMember(Name="shipmentId", EmitDefaultValue = true)]
        public string ShipmentId { get; set; }

        /// <summary>
        /// "NotShipped" or "Shipped"
        /// </summary>
        [DataMember(Name="status", EmitDefaultValue = true)]
        public string Status { get; set; }

        [DataMember(Name="shippingMethodCode", EmitDefaultValue = true)]
        public string ShippingMethodCode { get; set; }

        [DataMember(Name = "shippingMethodName", EmitDefaultValue = true)]
        public string ShippingMethodName { get; set; }

        [DataMember(Name = "trackingNumber", EmitDefaultValue = true)]
        public string TrackingNumber { get; set; }

        [DataMember(Name = "packagingType", EmitDefaultValue = true)]
        public string PackagingType { get; set; }

        [DataMember(Name="height", EmitDefaultValue = true)]
        public decimal? Height { get; set; }

        [DataMember(Name="width", EmitDefaultValue = true)]
        public decimal? Width { get; set; }

        [DataMember(Name = "length",  EmitDefaultValue = true)]
        public decimal? Length { get; set; }

        [DataMember(Name="weight", EmitDefaultValue = true)]
        public decimal? Weight { get; set; }

        [DataMember(Name="items", EmitDefaultValue = true)]
        public List<OrderPackageItem> Items { get; set; }

        [DataMember(Name = "totalQuantity", EmitDefaultValue = true)]
        public int TotalQuantity { get; set; }

        #region workflow
        [DataMember(Name="availableActions", EmitDefaultValue = true)]
        public object AvailableActions { get; set; }
        #endregion

        [DataMember(Name="createDate")]
        public DateTime CreateDate { get; set; }

        [DataMember(Name = "shipDate")]
        public DateTime? ShipDate { get; set; }
    }
}
