using System;
using Mozu.Core.Condition;
using Mozu.SiteBuilder.UX.Models.Checkout;

namespace Mozu.SiteBuilder.Mvc.Specifications
{
    public class HasShippableDomesticAddressSpecification : Specification<ShipmentInformation>
    {
        public override bool IsSatisfiedBy(ShipmentInformation subject)
        {
            if (subject == null)
                return false;

            var hasAddress = !string.IsNullOrWhiteSpace(subject.Address1);
            var hasCountryCode = !string.IsNullOrWhiteSpace(subject.CountryCode) && string.Equals(subject.CountryCode, "US", StringComparison.OrdinalIgnoreCase);
            var hasPostalCode = !string.IsNullOrWhiteSpace(subject.PostalOrZipCode);
            var hasStateCode = !string.IsNullOrWhiteSpace(subject.StateOrProvince);

            return hasAddress && hasCountryCode && hasPostalCode && hasStateCode;
        }

        public override string Message()
        {
            return "This address needs more information to be shipped to.";
        }
    }
}