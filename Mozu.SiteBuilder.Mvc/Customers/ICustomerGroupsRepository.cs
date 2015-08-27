using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Mozu.SiteBuilder.UX.Models.Customers;

namespace Mozu.SiteBuilder.Mvc.Customers
{
    public interface ICustomerGroupsRepository
    {
        Task<List<CustomerGroup>> GetAll(string filter, int? startIndex, int? pageSize);

        Task<CustomerGroup> Create(CustomerGroup customerGroup);

        Task<StreamContent> Delete(CustomerGroup customerGroup);

        Task<CustomerGroup> AssignGroupToCustomer(int customerId, int customerGroupId);
    }
}