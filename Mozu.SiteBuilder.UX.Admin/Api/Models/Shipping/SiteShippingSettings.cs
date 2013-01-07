using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Shipping
{
    [DataContract]
    public class SiteShippingSettings
    {
        [DataMember(Name = "activeRateProvider")]
        public Feature ActiveRateProvider { get; set; }

        [DataMember(Name = "siteShippingOriginAddress")]
        public SiteShippingOriginAddress SiteShippingOriginAddress { get; set; }

        [DataMember(Name = "siteShippingRegions")]
        public List<SiteShippingRegion> SiteShippingRegions { get; set; }

        [DataMember(Name = "siteShippingMethods")]
        public List<SiteShippingMethod> SiteShippingMethods { get; set; }

        [DataMember(Name = "createBy")]
        public string CreateBy { get; set; }

        [DataMember(Name = "createDate")]
        public DateTime? CreateDate { get; set; }

        [DataMember(Name = "updateBy")]
        public string UpdateBy { get; set; }

        [DataMember(Name = "updateDate")]
        public DateTime? UpdateDate { get; set; }
    }
}