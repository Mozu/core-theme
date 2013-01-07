using System.Linq;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Checkout
{
    [DataContract]
    public abstract class AddressInformation : CheckoutInformation
    {
        [DataMember(Name = "firstName")]
        public string FirstName { get; set; }

        [DataMember(Name = "lastName")]
        public string LastName { get; set; }

        [DataMember(Name = "address1")]
        public string Address1 { get; set; }

        [DataMember(Name = "address2")]
        public string Address2 { get; set; }

        [DataMember(Name = "cityOrTown")]
        public string CityOrTown { get; set; }

        [DataMember(Name = "stateOrProvince")]
        public string StateOrProvince { get; set; }

        [DataMember(Name = "postalOrZipCode")]
        public string PostalOrZipCode { get; set; }

        [DataMember(Name = "countryCode")]
        public string CountryCode { get; set; }

        public bool IsEmpty
        {
            get
            {
                var fields = new[] { FirstName, LastName, Address1, CityOrTown, StateOrProvince, PostalOrZipCode, CountryCode };
                return fields.All(string.IsNullOrWhiteSpace);
            }
        }

        public T CopyTo<T>(T other) where T : AddressInformation
        {
            other.FirstName = FirstName;
            other.LastName = LastName;
            other.Address1 = Address1;
            other.Address2 = Address2;
            other.CityOrTown = CityOrTown;
            other.CountryCode = CountryCode;
            other.StateOrProvince = StateOrProvince;
            other.PostalOrZipCode = PostalOrZipCode;

            return other;
        }
    }
}