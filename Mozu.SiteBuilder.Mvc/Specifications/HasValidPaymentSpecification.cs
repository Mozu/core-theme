using Mozu.Core.Condition;
using Mozu.SiteBuilder.UX.Models.Checkout;

namespace Mozu.SiteBuilder.Mvc.Specifications
{
    public class HasValidPaymentSpecification : Specification<PaymentInformation>
    {
        private readonly ISpecification<PaymentInformation> _hasValidCheckPayment = new HasValidCheckPaymentSpecification();
        private readonly ISpecification<PaymentInformation> _hasValidCreditCardPayment = new HasValidCreditCardPaymentSpecification();
        private readonly ISpecification<PaymentInformation> _baseSpecification;

        public HasValidPaymentSpecification()
        {
            _baseSpecification = _hasValidCheckPayment.Or(_hasValidCreditCardPayment);
        }

        public override bool IsSatisfiedBy(PaymentInformation subject)
        {
            if (subject == null)
                return false;

            return _baseSpecification.IsSatisfiedBy(subject);
        }

        public override string Message()
        {
            return "the payment method has some missing information";
        }
    }
}