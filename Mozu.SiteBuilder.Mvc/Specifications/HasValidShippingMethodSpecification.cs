using Mozu.Core.Condition;
using Mozu.SiteBuilder.UX.Models.Checkout;

namespace Mozu.SiteBuilder.Mvc.Specifications
{
    public class HasValidShippingMethodSpecification : Specification<ShippingMethodInformation>
    {
        public override bool IsSatisfiedBy(ShippingMethodInformation subject)
        {
            if (subject == null || string.IsNullOrWhiteSpace(subject.Id))
                return false;

            return true;
        }

        public override string Message()
        {
            return "This order doesn't have a shipping method";
        }
    }
}