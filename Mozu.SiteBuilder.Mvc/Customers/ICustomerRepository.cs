using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Mozu.SiteBuilder.UX.Models.Customers;

namespace Mozu.SiteBuilder.Mvc.Customers
{
    public interface ICustomerRepository
    {
        Task<IEnumerable<CustomerAccount>> GetAll(int? startIndex = 0, int? pageSize = 25, string filter = null, string sortBy= null, string responseGroups = null);

        Task<CustomerAccount> Get(int? customerId);

        Task<CustomerAccount> GetByUserId(string userId);

        Task<IEnumerable<string>> GetCustomerGroups(Predicate<string> predicate);

        Task<CustomerAccount> Update(CustomerAccount customerAccount, int? customerId);

        Task<StreamContent> Delete(CustomerAccount customerAccount);

        Task<List<CustomerAccountNote>> GetCustomerNotes(int? customerAccountId, int? startIndex = 0, int? pageSize = 25);

        Task<CustomerAccountNote> CreateCustomerNote(CustomerAccountNote customerAccountNote, int? customerAccountId);
    }
}