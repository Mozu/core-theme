using System;
using Mozu.Core.Condition;
using Mozu.SiteBuilder.UX.Models.Checkout;

namespace Mozu.SiteBuilder.Mvc.Specifications
{
    public class HasValidCreditCardPaymentSpecification : Specification<PaymentInformation>
    {
        private const string DefaultMessage = "credit card payment information is missing";
        private string _message = null;

        public override bool IsSatisfiedBy(PaymentInformation subject)
        {
            if (subject == null || !string.Equals(subject.PaymentType, "creditcard", StringComparison.OrdinalIgnoreCase))
                return false;

            // Going to ignore this and lean on the services for now...
            /*var expirationDate = GetExpirationDate(subject);
            var expired = expirationDate < DateTime.Now.Date;
            if (expired)
            {
                _message = "credit card expiration date is missing or in the past";
            }*/

            //var hasName = !string.IsNullOrWhiteSpace(subject.FirstName) && !string.IsNullOrWhiteSpace(subject.LastName);
            var hasCardNumber = !string.IsNullOrWhiteSpace(subject.CardNumberPartOrMask);
            var hasCardType = !string.IsNullOrWhiteSpace(subject.CardType);
            var hasPciCardId = !string.IsNullOrWhiteSpace(subject.PaymentServiceCardId);

            return /*!expired && hasName && */hasCardNumber && hasCardType && hasPciCardId;
        }

        private static DateTime GetExpirationDate(PaymentInformation subject)
        {
            try
            {
                return new DateTime(subject.CardExpireYear ?? DateTime.Now.Year, subject.CardExpireMonth ?? DateTime.Now.Month, 1);
            }
            catch (ArgumentOutOfRangeException)
            {
                return DateTime.MinValue;
            }
        }

        public override string Message()
        {
            return _message ?? DefaultMessage;
        }
    }
}