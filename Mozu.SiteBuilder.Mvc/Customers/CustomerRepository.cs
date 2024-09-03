using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
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

        public async Task<IEnumerable<CustomerAccount>> GetAll(int? startIndex = 0, int? pageSize = 25, string filter = null, string sortyBy = null, string responseGroups = null)
        {
            var result = await (await _customerAccountWebApiClient.GetAccounts(startIndex, pageSize, sortyBy, responseGroups, filter).ConfigureAwait(false)).ReadAsAsync().ConfigureAwait(false);

            return result.Items.Where(i => i.Contacts.Any() && i.CommerceSummary != null).Select(Mapper.Map<SB.CustomerAccount>);
        }

        public async Task<CustomerAccount> Get(int? customerId)
        {
            var result = await (await _customerAccountWebApiClient.GetAccount(customerId.GetValueOrDefault(-1)).ConfigureAwait(false)).ReadAsAsync().ConfigureAwait(false);

            return Mapper.Map<SB.CustomerAccount>(result);
        }

        public Task<CustomerAccount> GetByUserId(string userId)
        {
            var task = _customerAccountWebApiClient.GetAccounts(filter: "UserId eq " + userId);
            return task.ContinueWith<CustomerAccount>(x =>
            {
                var res = x.Result;
                if (res.ResponseMessage.IsSuccessStatusCode)
                {
                    var result = res.ReadAsSync();
                    var account = result.Items.FirstOrDefault();
                    if (account != null)
                    {
                        return Mapper.Map<CustomerAccount>(account);
                    }
                }
                return null;
            });


        }

        public async Task<IEnumerable<string>> GetCustomerGroups(Predicate<string> predicate)
        {
            // TODO: Refactor this
            var groups = await _customerGroupsRepository.GetAll(null, null, null).ConfigureAwait(false);
            return groups.Where(group => predicate(group.Name)).Select(g => g.Name);
        }

        public async Task<CustomerAccount> Update(SB.CustomerAccount customerAccount, int? customerId)
        {
            var account = Mapper.Map<CS.CustomerAccount>(customerAccount);
            var result = await (await _customerAccountWebApiClient.UpdateAccount(account, customerId.GetValueOrDefault(-1)).ConfigureAwait(false)).ReadAsAsync().ConfigureAwait(false);

            return Mapper.Map<SB.CustomerAccount>(result);
        }

        public async Task<StreamContent> Delete(SB.CustomerAccount customerAccount)
        {
            // TODO: Implement deletes througha API
            return await (await _customerAccountWebApiClient.DeleteAccount(customerAccount.Id).ConfigureAwait(false)).ReadAsAsync().ConfigureAwait(false);
        }

        public async Task<List<CustomerAccountNote>> GetCustomerNotes(int? customerAccountId, int? startIndex = 0, int? pageSize = 25)
        {
            var result = await (await _customerAccountWebApiClient.GetAccountNotes(customerAccountId.GetValueOrDefault(-1), startIndex, pageSize, null, null).ConfigureAwait(false)).ReadAsAsync().ConfigureAwait(false); ;


            return Mapper.Map<List<SB.CustomerAccountNote>>(result.Items);
        }

        public async Task<CustomerAccountNote> CreateCustomerNote(SB.CustomerAccountNote customerAccountNote, int? customerAccountId)
        {
            var note = Mapper.Map<CS.CustomerNote>(customerAccountNote);
            var task = await _customerAccountWebApiClient.AddAccountNote(note, customerAccountId.GetValueOrDefault(-1)).ConfigureAwait(false);
            var result = await task.ReadAsAsync().ConfigureAwait(false);

            return Mapper.Map<SB.CustomerAccountNote>(result);
        }
    }
}