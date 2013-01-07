using System;
using Mozu.Core.Condition;
using Mozu.SiteBuilder.UX.Models.Checkout;

namespace Mozu.SiteBuilder.Mvc.Specifications
{
    public class HasValidCheckPaymentSpecification : Specification<PaymentInformation>
    {
        public override bool IsSatisfiedBy(PaymentInformation subject)
        {
            if (subject == null)
                return false;

            var satisfied = string.Equals(subject.PaymentType, "check", StringComparison.OrdinalIgnoreCase);

            // check number?

            return satisfied;
        }

        public override string Message()
        {
            return "check payment information is missing";
        }
    }
}