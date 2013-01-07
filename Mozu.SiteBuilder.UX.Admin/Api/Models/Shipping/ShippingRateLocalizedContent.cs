using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Shipping
{
    [DataContract]
    public class ShippingRateLocalizedContent
    {
        [DataMember(Name = "contentLocaleCode")]
        public string ContentLocaleCode { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }
    }
}