using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Discount
{
    [DataContract]
    public class CouponCode
    {
        [DataMember(Name = "code")]
        public string Code { get; set; }
    }
}