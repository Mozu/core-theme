using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Shipping
{
    [DataContract]
    public class UspsConfiguration
    {
        [DataMember(Name = "uspsUserId")]
        public string UspsUserId { get; set; }

        [DataMember(Name = "shippingMethods")]
        public List<string> ShippingMethods { get; set; }
    }
}