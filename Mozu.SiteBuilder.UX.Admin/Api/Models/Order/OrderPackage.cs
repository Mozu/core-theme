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

        /// <summary>
        /// "NotShipped" or "Shipped"
        /// </summary>
        [DataMember(Name="status")]
        public string Status { get; set; }

        [DataMember(EmitDefaultValue = false)]
        public string ShippingMethodCode { get; set; }

        [DataMember(EmitDefaultValue = false)]
        public string ShippingMethodName { get; set; }

        [DataMember(EmitDefaultValue = false)]
        public string TrackingNumber { get; set; }

        [DataMember(EmitDefaultValue = false)]
        public string PackagingType { get; set; }

        [DataMember(EmitDefaultValue = false)]
        public decimal? Height { get; set; }

        [DataMember(EmitDefaultValue = false)]
        public decimal? Width { get; set; }

        [DataMember(EmitDefaultValue = false)]
        public decimal? Length { get; set; }

        [DataMember(EmitDefaultValue = false)]
        public decimal? Weight { get; set; }

        [DataMember(Name="items")]
        public List<OrderPackageItem> Items { get; set; }
    }
}
