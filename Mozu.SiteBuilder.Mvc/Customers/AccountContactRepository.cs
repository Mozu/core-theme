using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;

using Mozu.Customer.Contracts;
using Mozu.Customer.Contracts.Clients;
using SB = Mozu.SiteBuilder.UX.Models.Customers;

namespace Mozu.SiteBuilder.Mvc.Customers
{
    public class AccountContactRepository : IAccountContactRepository
    {
        private readonly ICustomerAccountWebApiClient _customerAccountWebApiClient;

        public AccountContactRepository(ICustomerAccountWebApiClient customerAccountWebApiClient)
        {
            _customerAccountWebApiClient = customerAccountWebApiClient;
        }

        public async Task<SB.CustomerAccountContact> Get(int? customerAccountId, int? contactId)
        {
            var result = await _customerAccountWebApiClient.GetCustomerAccountContact(customerAccountId, contactId).Result.ReadAsAsync();

            return Mapper.Map<SB.CustomerAccountContact>(result);
        }

        public async Task<IEnumerable<SB.CustomerAccountContact>> GetAll(int? customerId)
        {
            var result = await _customerAccountWebApiClient.GetCustomerAccountContacts(customerId, 0, 25, null, null).Result.ReadAsAsync();

            return Mapper.Map<List<SB.CustomerAccountContact>>(result.Items);
        }

        public async Task<SB.CustomerAccountContact> Update(SB.CustomerAccountContact accountContact, int? customerAccountId)
        {
            var newAccountContact = Mapper.Map<CustomerAccountContact>(accountContact);
            var result = await _customerAccountWebApiClient.UpdateCustomerAccountContact(newAccountContact, customerAccountId, accountContact.Id).Result.ReadAsAsync();

            return Mapper.Map<SB.CustomerAccountContact>(result);
        }

        public async Task<SB.CustomerAccountContact> Create(SB.CustomerAccountContact accountContact, int? customerAccountId)
        {
            var newAccountContact = Mapper.Map<CustomerAccountContact>(accountContact);
            var result = await _customerAccountWebApiClient.AddCustomerAccountContact(newAccountContact, customerAccountId).Result.ReadAsAsync();

            return Mapper.Map<SB.CustomerAccountContact>(result);
        }

        public void Delete(SB.CustomerAccountContact accountContact, int? customerAccountId)
        {
            // todo: compile error:
            //_customerAccountWebApiClient.DeleteCustomerAccountContact(customerAccountId, accountContact.Id).Result.ReadAsAsync();
        }

        public Task<SB.CustomerAccountContact> Duplicate(SB.CustomerAccountContact accountContact)
        {
            throw new NotImplementedException();
        }
    }
}