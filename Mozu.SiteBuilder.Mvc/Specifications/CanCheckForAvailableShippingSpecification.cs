using Mozu.Core.Condition;
using Mozu.SiteBuilder.UX.Models.Checkout;

namespace Mozu.SiteBuilder.Mvc.Specifications
{
    public class CanCheckForAvailableShippingSpecification : Specification<ShipmentInformation>
    {
        private readonly ISpecification<ShipmentInformation> _hasNameOrCompany = new HasNameOrCompanySpecification();
        private readonly ISpecification<ShipmentInformation> _hasShippableDomesticAddress = new HasShippableDomesticAddressSpecification();
        private readonly ISpecification<ShipmentInformation> _hasShippableInternationalAddress = new HasShippableInternationalAddressSpecification();
        private readonly ISpecification<ShipmentInformation> _baseSpecification;

        public CanCheckForAvailableShippingSpecification()
        {
            _baseSpecification = _hasNameOrCompany.And(_hasShippableDomesticAddress.Or(_hasShippableInternationalAddress));
        }

        public override bool IsSatisfiedBy(ShipmentInformation subject)
        {
            if (subject == null)
                return false;

            return _baseSpecification.IsSatisfiedBy(subject);
        }

        public override string Message()
        {
            return "The order's shipping address needs more data before shipping methods are available.";
        }
    }
}