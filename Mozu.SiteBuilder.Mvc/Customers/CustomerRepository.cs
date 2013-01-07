using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.UX.Models.Customers;
using SB = Mozu.SiteBuilder.UX.Models.Customers;
using CS = Mozu.Customer.Contracts;

namespace Mozu.SiteBuilder.Mvc.Customers
{
    public class CustomerRepository : ICustomerRepository
    {
        private readonly ICustomerAccountWebApiClient _customerAccountWebApiClient;
        private readonly ICustomerGroupsRepository _customerGroupsRepository;

        public CustomerRepository(ICustomerAccountWebApiClient customerAccountWebApiClient, ICustomerGroupsRepository customerGroupsRepository)
        {
            _customerAccountWebApiClient = customerAccountWebApiClient;
            _customerGroupsRepository = customerGroupsRepository;
        }

        public IEnumerable<SB.CustomerAccount> GetAll(int? startIndex = 0, int? pageSize = 25, string filter = null, string sortyBy= null, string responseGroups=null)
        {
            var result = _customerAccountWebApiClient.GetCustomerAccounts(startIndex, pageSize, sortyBy, responseGroups, filter).Result.ReadAsAsync().Result;

            return result.Items.Where(i => i.Contacts.Any() && i.OrderSummary != null).Select(Mapper.Map<SB.CustomerAccount>);
        }

        public SB.CustomerAccount Get(int? customerId)
        {
            var result = _customerAccountWebApiClient.GetCustomerAccount(customerId).Result.ReadAsAsync().Result;

            return Mapper.Map<SB.CustomerAccount>(result);
        }

        public CustomerAccount GetByUserId(string userId)
        {
            var result = _customerAccountWebApiClient.GetCustomerAccounts(null, null, null, null, "UserId eq " + userId).Result.ReadAsAsync().Result;
            var account = result.Items.FirstOrDefault();
            return Mapper.Map<CustomerAccount>(account);
        }

        public IEnumerable<string> GetCustomerGroups(Predicate<string> predicate)
        {
            // TODO: Refactor this
            return _customerGroupsRepository.GetAll(null, null, null).Where(group => predicate(group.Name)).Select(g => g.Name);
        }

        public SB.CustomerAccount Update(SB.CustomerAccount customerAccount, int? customerId)
        {
            var account = Mapper.Map<CS.CustomerAccount>(customerAccount);
            var result = _customerAccountWebApiClient.UpdateCustomerAccount(account, customerId).Result.ReadAsAsync().Result;

            return Mapper.Map<SB.CustomerAccount>(result);
        }

        public void Delete(SB.CustomerAccount customerAccount)
        {
            // TODO: Implement deletes througha API
            //_customerAccountWebApiClient.DeleteCustomerAccount(customer.Id).Result.ReadAsSync();
        }

        public List<SB.CustomerAccountNote> GetCustomerNotes(int? customerAccountId, int? startIndex = 0, int? pageSize = 25)
        {
            var result = _customerAccountWebApiClient.GetCustomerAccountNotes(customerAccountId, startIndex, pageSize, null, null).Result.ReadAsAsync().Result;

            return Mapper.Map<List<SB.CustomerAccountNote>>(result.Items);
        }

        public SB.CustomerAccountNote CreateCustomerNote(SB.CustomerAccountNote customerAccountNote, int? customerAccountId)
        {
            var note = Mapper.Map<CS.CustomerAccountNote>(customerAccountNote);
            var task = _customerAccountWebApiClient.AddCustomerAccountNote(note, customerAccountId).Result.ReadAsAsync();
            return Mapper.Map<SB.CustomerAccountNote>(task.Result);
        }
    }
}