using System.IO;
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
        private readonly ICustomerSegmentWebApiClient _customerSegmentWebApiClient;
        private readonly ICustomerAccountWebApiClient _customerAccountWebApiClient;

        public CustomerGroupsRepository(
            ICustomerSegmentWebApiClient customerSegmentWebApiClient,
            ICustomerAccountWebApiClient customerAccountWebApiClient)
        {
             _customerSegmentWebApiClient = customerSegmentWebApiClient;
            _customerAccountWebApiClient = customerAccountWebApiClient;
        }

        public async Task<List<CustomerGroup>> GetAll(string filter, int? startIndex, int? pageSize)
        {
            var groupCollection = await _customerSegmentWebApiClient.GetSegments( startIndex, pageSize, null, filter).Result.ReadAsAsync();

            return groupCollection.Items.Select(g => new CustomerGroup { Id = g.Id, Name = g.Name }).ToList();
        }

        public async Task<CustomerGroup> Create(CustomerGroup customerGroup)
        {
            var group = Mapper.Map<Mozu.Customer.Contracts.CustomerSegment>(customerGroup);
            var newGroup = await _customerSegmentWebApiClient.AddSegment(@group).Result.ReadAsAsync();

            return Mapper.Map<CustomerGroup>(newGroup);
        }

        public async Task<StreamContent> Delete(CustomerGroup customerGroup)
        {
            var result = await _customerSegmentWebApiClient.DeleteSegment(customerGroup.Id).ConfigureAwait(false);
            return result.ReadAsAsync().Result;
        }

        public async Task<CustomerGroup> AssignGroupToCustomer(int customerId, int customerGroupId)
        {
            var group = await _customerSegmentWebApiClient.GetSegment(customerGroupId).Result.ReadAsAsync();

            //todo: verify this is the right method? - Greg Murray on 2014-03-27 
            await _customerSegmentWebApiClient.AddSegmentAccounts(new List<int>(customerId), customerGroupId).Result.ReadAsAsync();
            //await _customerAccountWebApiClient.AddAccountGroup(customerId, customerGroupId).Result.ReadAsAsync();

            return Mapper.Map<CustomerGroup>(group);
        }
    }
}