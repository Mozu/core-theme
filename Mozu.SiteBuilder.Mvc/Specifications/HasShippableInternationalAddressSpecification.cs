using System;
using Mozu.Core.Condition;
using Mozu.SiteBuilder.UX.Models.Checkout;

namespace Mozu.SiteBuilder.Mvc.Specifications
{
    public class HasShippableInternationalAddressSpecification : Specification<ShipmentInformation>
    {
        public override bool IsSatisfiedBy(ShipmentInformation subject)
        {
            if (subject == null)
                return false;

            var hasAddress = !string.IsNullOrWhiteSpace(subject.Address1);
            var hasCountryCode = !string.IsNullOrWhiteSpace(subject.CountryCode) && !string.Equals(subject.CountryCode, "US", StringComparison.OrdinalIgnoreCase);

            return hasAddress && hasCountryCode;
        }

        public override string Message()
        {
            return "This address needs more information to be shipped to.";
        }
    }
}