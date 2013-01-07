using System.Collections.Generic;
using Mozu.SiteBuilder.UX.Models.Customers;

namespace Mozu.SiteBuilder.Mvc.Customers
{
    public interface ICustomerGroupsRepository
    {
        List<CustomerGroup> GetAll(string filter, int? startIndex, int? pageSize);

        CustomerGroup Create(CustomerGroup customerGroup);

        void Delete(CustomerGroup customerGroup);

        CustomerGroup AssignGroupToCustomer(int customerId, int customerGroupId);
    }
}