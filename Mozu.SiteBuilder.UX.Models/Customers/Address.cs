using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Customers
{
    [DataContract]
    public class Address
    {
        [DataMember(Name = "addressId")]
        public int? AddressId { get; set; }

        [DataMember(Name = "address1")]
        public string Address1 { get; set; }

        [DataMember(Name = "address2")]
        public string Address2 { get; set; }

        [DataMember(Name = "address3")]
        public string Address3 { get; set; }

        [DataMember(Name = "cityOrTown")]
        public string CityOrTown { get; set; }

        [DataMember(Name = "stateOrProvince")]
        public string StateOrProvince { get; set; }

        [DataMember(Name = "postalOrZipCode")]
        public string PostalOrZipCode { get; set; }

        [DataMember(Name = "countryCode")]
        public string CountryCode { get; set; }
    }
}