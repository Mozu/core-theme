using System;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Shipping
{
    [DataContract]
    public class SiteShippingMethod
    {
        [DataMember(Name = "code")]
        public string Code { get; set; }

        [DataMember(Name = "content")]
        public SiteShippingMethodLocalizedContent Content { get; set; }

        [DataMember(Name = "isInternational")]
        public bool? IsInternational { get; set; }

        [DataMember(Name = "sequence")]
        public int? Sequence { get; set; }

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