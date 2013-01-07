using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Shipping
{
    [DataContract]
    public class ShippingMethod
    {
        [DataMember(Name = "code")]
        public string Code { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "isInternational")]
        public bool? IsInternational { get; set; }

        [DataMember(Name = "isActive")]
        public bool? IsActive { get; set; }
    }
}