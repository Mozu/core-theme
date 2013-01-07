using System.Collections.Generic;
using Mozu.SiteBuilder.UX.Models.Customers;

namespace Mozu.SiteBuilder.Mvc.Customers
{
    public interface IAccountContactRepository
    {
        CustomerAccountContact Get(int? customerAccountId, int? contactId);

        IEnumerable<CustomerAccountContact> GetAll(int? customerId);

        CustomerAccountContact Update(CustomerAccountContact accountContact, int? customerAccountId);

        CustomerAccountContact Create(CustomerAccountContact accountContact, int? customerAccountId);

        void Delete(CustomerAccountContact accountContact, int? customerAccountId);

        CustomerAccountContact Duplicate(CustomerAccountContact accountContact);
    }
}