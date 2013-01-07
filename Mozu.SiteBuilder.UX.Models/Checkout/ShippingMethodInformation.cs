using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Checkout
{
    [DataContract]
    public class ShippingMethodInformation : CheckoutInformation
    {
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "price")]
        public decimal? Price { get; set; }

        [DataMember(Name = "availableShippingMethods")]
        public List<ShippingMethodInformation> AvailableShippingMethods { get; set; }

        public bool IsValid { get; set; }
    }
}