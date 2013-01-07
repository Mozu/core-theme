using System;
using System.Collections.Generic;
using Mozu.SiteBuilder.UX.Models.Customers;

namespace Mozu.SiteBuilder.Mvc.Customers
{
    public interface ICustomerRepository
    {
        IEnumerable<CustomerAccount> GetAll(int? startIndex = 0, int? pageSize = 25, string filter = null, string sortBy= null, string responseGroups = null);

        CustomerAccount Get(int? customerId);

        CustomerAccount GetByUserId(string userId);

        IEnumerable<string> GetCustomerGroups(Predicate<string> predicate);

        CustomerAccount Update(CustomerAccount customerAccount, int? customerId);

        void Delete(CustomerAccount customerAccount);

        List<CustomerAccountNote> GetCustomerNotes(int? customerAccountId, int? startIndex = 0, int? pageSize = 25);

        CustomerAccountNote CreateCustomerNote(CustomerAccountNote customerAccountNote, int? customerAccountId);
    }
}