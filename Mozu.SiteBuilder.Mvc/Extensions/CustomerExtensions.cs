using System;
using System.Linq;

namespace Mozu.SiteBuilder.Mvc.Extensions
{
    public static class CustomerExtensions
    {
        public static Mozu.Core.Api.Contracts.Contact GetDefaultBillingContact(this Customer.Contracts.CustomerAccount customer) {
            return GetPrimaryContactOfType(customer, Mozu.Customer.Contracts.ContactTypeConst.BILLING);
        }

        public static Mozu.Core.Api.Contracts.Contact GetDefaultShippingContact(this Customer.Contracts.CustomerAccount customer) {
            return GetPrimaryContactOfType(customer, Mozu.Customer.Contracts.ContactTypeConst.SHIPPING);
        }

        private static Mozu.Core.Api.Contracts.Contact GetPrimaryContactOfType(Customer.Contracts.CustomerAccount customer, string contactType)
        {
            if (customer == null || customer.Contacts == null || customer.Contacts.Count == 0)
                return null;
            return customer.Contacts.FirstOrDefault(c => c.Types != null && c.Types.Any(t => t.Name == contactType && t.IsPrimary));
        }
    }
}
