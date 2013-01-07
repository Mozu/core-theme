using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using AutoMapper;
using System.Collections.Generic;
using Mozu.Customer.Contracts;
using Mozu.Customer.Contracts.Clients;
using CustomerGroup = Mozu.SiteBuilder.UX.Models.Customers.CustomerGroup;

namespace Mozu.SiteBuilder.Mvc.Customers
{
    public class CustomerGroupsRepository : ICustomerGroupsRepository
    {
        private readonly ICustomerGroupWebApiClient _customerGroupsWebApiClient;
        private readonly ICustomerAccountWebApiClient _customerAccountWebApiClient;

        public CustomerGroupsRepository(ICustomerGroupWebApiClient customerGroupsWebApiClient, ICustomerAccountWebApiClient customerAccountWebApiClient)
        {
            _customerGroupsWebApiClient = customerGroupsWebApiClient;
            _customerAccountWebApiClient = customerAccountWebApiClient;
        }

        public List<CustomerGroup> GetAll(string filter, int? startIndex, int? pageSize)
        {
            var groupCollection = _customerGroupsWebApiClient.GetCustomerGroups(startIndex, pageSize, null, filter).Result.ReadAsAsync().Result;

            return groupCollection.Items.Select(g => new CustomerGroup { Id = g.Id, Name = g.Name }).ToList();
        }

        public CustomerGroup Create(CustomerGroup customerGroup)
        {
            var group = Mapper.Map<Mozu.Customer.Contracts.CustomerGroup>(customerGroup);
            var newGroup = _customerGroupsWebApiClient.AddCustomerGroup(@group).Result.ReadAsAsync().Result;

            return Mapper.Map<CustomerGroup>(newGroup);
        }

        public void Delete(CustomerGroup customerGroup)
        {
            var deleteCustomerGroup = _customerGroupsWebApiClient.DeleteCustomerGroup(customerGroup.Id);
            var result = deleteCustomerGroup.Result;
            var task = result.ReadAsAsync();
            Task.WaitAll(task);
        }

        public CustomerGroup AssignGroupToCustomer(int customerId, int customerGroupId)
        {
            var group = _customerGroupsWebApiClient.GetCustomerGroup(customerGroupId).Result.ReadAsAsync();

            _customerAccountWebApiClient.AddCustomerAccountGroup(new CustomerAccountGroup { Id = customerGroupId }, customerId).Result.ReadAsAsync();

            return Mapper.Map<CustomerGroup>(group);
        }
    }
}