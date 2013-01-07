using System;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Shipping
{
    [DataContract]
    public class SiteShippingMethodLocalizedContent
    {
        [DataMember(Name = "contentLocaleCode")]
        public string ContentLocaleCode { get; set; }

        [DataMember(Name = "createBy")]
        public string CreateBy { get; set; }

        [DataMember(Name = "createDate")]
        public DateTime CreateDate { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "updateBy")]
        public string UpdateBy { get; set; }

        [DataMember(Name = "updateDate")]
        public DateTime UpdateDate { get; set; }
    }
}