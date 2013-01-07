using System;
using System.Collections.Generic;
using System.Net.Http;
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

        public SB.CustomerAccountContact Get(int? customerAccountId, int? contactId)
        {
            var result = _customerAccountWebApiClient.GetCustomerAccountContact(customerAccountId, contactId).Result.ReadAsAsync().Result;

            return Mapper.Map<SB.CustomerAccountContact>(result);
        }

        public IEnumerable<SB.CustomerAccountContact> GetAll(int? customerId)
        {
            var result = _customerAccountWebApiClient.GetCustomerAccountContacts(customerId, 0, 25, null, null).Result.ReadAsAsync().Result;

            return Mapper.Map<List<SB.CustomerAccountContact>>(result.Items);
        }

        public SB.CustomerAccountContact Update(SB.CustomerAccountContact accountContact, int? customerAccountId)
        {
            var newAccountContact = Mapper.Map<CustomerAccountContact>(accountContact);
            var result = _customerAccountWebApiClient.UpdateCustomerAccountContact(newAccountContact, customerAccountId, accountContact.Id).Result.ReadAsAsync().Result;

            return Mapper.Map<SB.CustomerAccountContact>(result);
        }

        public SB.CustomerAccountContact Create(SB.CustomerAccountContact accountContact, int? customerAccountId)
        {
            var newAccountContact = Mapper.Map<CustomerAccountContact>(accountContact);
            var result = _customerAccountWebApiClient.AddCustomerAccountContact(newAccountContact, customerAccountId).Result.ReadAsAsync().Result;

            return Mapper.Map<SB.CustomerAccountContact>(result);
        }

        public void Delete(SB.CustomerAccountContact accountContact, int? customerAccountId)
        {
            // todo: compile error:
            //_customerAccountWebApiClient.DeleteCustomerAccountContact(customerAccountId, accountContact.Id).Result.ReadAsAsync();
        }

        public SB.CustomerAccountContact Duplicate(SB.CustomerAccountContact accountContact)
        {
            throw new NotImplementedException();
        }
    }
}