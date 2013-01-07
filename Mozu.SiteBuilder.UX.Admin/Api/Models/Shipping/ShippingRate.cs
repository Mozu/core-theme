using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Shipping
{
    [DataContract]
    public class ShippingRate
    {
        [DataMember(Name="content")]
        public ShippingRateLocalizedContent Content { get; set; }

        [DataMember(Name = "createBy")]
        public string CreateBy { get; set; }

        [DataMember(Name = "createDate")]
        public DateTime? CreateDate { get; set; }

        [DataMember(Name = "flatPerCartShippingRate")]
        public FlatPerCartShippingRate FlatPerCartShippingRate { get; set; }

        [DataMember(Name = "flatPerItemShippingRate")]
        public FlatPerItemShippingRate FlatPerItemShippingRate { get; set; }

        [DataMember(Name = "isActive")]
        public bool? IsActive { get; set; }

        [DataMember(Name = "isInternational")]
        public bool IsInternational { get; set; }

        [DataMember(Name = "shippingClassId")]
        public int? ShippingClassId { get; set; }

        [DataMember(Name = "shippingRateId")]
        public int? ShippingRateId { get; set; }

        [DataMember(Name = "updateBy")]
        public string UpdateBy { get; set; }

        [DataMember(Name = "updateDate")]
        public DateTime? UpdateDate { get; set; }
    }
}