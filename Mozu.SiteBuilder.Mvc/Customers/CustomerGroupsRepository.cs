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

        public async Task<List<CustomerGroup>> GetAll(string filter, int? startIndex, int? pageSize)
        {
            var groupCollection = await _customerGroupsWebApiClient.GetGroups( startIndex, pageSize, null, filter).Result.ReadAsAsync();

            return groupCollection.Items.Select(g => new CustomerGroup { Id = g.Id, Name = g.Name }).ToList();
        }

        public async Task<CustomerGroup> Create(CustomerGroup customerGroup)
        {
            var group = Mapper.Map<Mozu.Customer.Contracts.CustomerGroup>(customerGroup);
            var newGroup = await _customerGroupsWebApiClient.AddGroup( @group).Result.ReadAsAsync();

            return Mapper.Map<CustomerGroup>(newGroup);
        }

        public async Task<StreamContent> Delete(CustomerGroup customerGroup)
        {
            var result = await _customerGroupsWebApiClient.DeleteGroup( customerGroup.Id);
            return result.ReadAsAsync().Result;
        }

        public async Task<CustomerGroup> AssignGroupToCustomer(int customerId, int customerGroupId)
        {
            var group = await _customerGroupsWebApiClient.GetGroup( customerGroupId).Result.ReadAsAsync();

            await _customerAccountWebApiClient.AddAccountGroup( new Customer.Contracts.CustomerGroup { Id = customerGroupId }, customerId).Result.ReadAsAsync();

            return Mapper.Map<CustomerGroup>(group);
        }
    }
}