using System.Collections.Generic;
using System.Threading.Tasks;
using Mozu.SiteBuilder.UX.Models.Customers;

namespace Mozu.SiteBuilder.Mvc.Customers
{
    public interface IAccountContactRepository
    {
        Task<CustomerAccountContact> Get(int? customerAccountId, int? contactId);

        Task<IEnumerable<CustomerAccountContact>> GetAll(int? customerId);

        Task<CustomerAccountContact> Update(CustomerAccountContact accountContact, int? customerAccountId);

        Task<CustomerAccountContact> Create(CustomerAccountContact accountContact, int? customerAccountId);

        void Delete(CustomerAccountContact accountContact, int? customerAccountId);

        Task<CustomerAccountContact> Duplicate(CustomerAccountContact accountContact);
    }
}