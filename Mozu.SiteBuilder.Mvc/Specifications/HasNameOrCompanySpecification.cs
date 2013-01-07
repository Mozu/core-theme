using Mozu.Core.Condition;
using Mozu.SiteBuilder.UX.Models.Checkout;

namespace Mozu.SiteBuilder.Mvc.Specifications
{
    public class HasNameOrCompanySpecification : Specification<ShipmentInformation>
    {
        public override bool IsSatisfiedBy(ShipmentInformation subject)
        {
            if (subject == null)
                return false;

            var hasFirstAndLast = !string.IsNullOrWhiteSpace(subject.FirstName) && !string.IsNullOrWhiteSpace(subject.LastName);
            var hasOrganization = !string.IsNullOrWhiteSpace(subject.CompanyOrOrganization);

            return hasFirstAndLast || hasOrganization;
        }

        public override string Message()
        {
            return "This needs a first and last name or company name.";
        }
    }
}