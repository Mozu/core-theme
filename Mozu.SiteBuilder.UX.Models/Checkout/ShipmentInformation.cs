using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Checkout
{
    [DataContract]
    public class ShipmentInformation : AddressInformation
    {
        [DataMember(Name = "companyOrOrganization", EmitDefaultValue = false)]
        public string CompanyOrOrganization { get; set; }

        [DataMember(Name = "carrier")]
        public string Carrier { get; set; }

        [DataMember(Name = "status")]
        public string Status { get; set; }

        [DataMember(Name = "price")]
        public decimal Price { get; set; }

        [DataMember(Name = "email")]
        public string Email { get; set; }

        [DataMember(Name = "availableCountries")]
        public List<object> AvailableCountries { get; set; }
    }
}