using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Shipping
{
    [DataContract]
    public class SiteShippingRegion
    {
        [DataMember(Name = "isoCountryCode")]
        public string ISOCountryCode { get; set; }
    }
}