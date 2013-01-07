using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Shipping
{
    [DataContract]
    public class SharedShippingMethod
    {
        [DataMember(Name = "code")]
        public string Code { get; set; }

        [DataMember(Name = "content")]
        public SharedShippingMethodLocalizedContent Content { get; set; }

        [DataMember(Name = "isInternational")]
        public bool? IsInternational { get; set; }

        [DataMember(Name = "isLabelPrintingAllowed")]
        public bool IsLabelPrintingAllowed { get; set; }

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