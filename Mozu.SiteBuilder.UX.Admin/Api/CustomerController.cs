using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.Core.Api.Routing;
using Mozu.Customer.Contracts.Clients;
using Mozu.Customer.Contracts.Credit;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Helpers.CustomerHelpers;
using ApiCustomer = Mozu.SiteBuilder.UX.Admin.Api.Models.Customer;
using Credit = Mozu.SiteBuilder.UX.Admin.Api.Models.Credit;
using DC = Mozu.Customer.Contracts;


namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/customer", SuppressDescriptorGeneration = true)]
    public class CustomerController : BaseController
    {
        private readonly ICustomerAccountWebApiClient _customerWebApiClient;
      //  private readonly ICustomerGroupWebApiClient _customerGroupWebApiClient;
        private readonly ICreditWebApiClient _creditWebApiClient;
        //private readonly ICustomerVisitWebApiClient _customerVisitWebApiClient;

        public CustomerController(ICustomerAccountWebApiClient customerWebApiClient, 
            //Mozu.Customer.Contracts.Clients.ICustomerGroupWebApiClient customerGroupWebApiClient, 
            ICreditWebApiClient creditWebApiClient/*, ICustomerVisitWebApiClient customerVisitWebApiClient*/)
        {
            _customerWebApiClient = customerWebApiClient;
           // _customerGroupWebApiClient = customerGroupWebApiClient;
            _creditWebApiClient = creditWebApiClient;
            //_customerVisitWebApiClient = customerVisitWebApiClient;
        }

        [HttpGetRoute(UriTemplate = "search")]
        public async Task<Response<List<ApiCustomer>>> GetAdvancedSearch([FromUri]PagingParamaters pagingParameters, [FromUri]FilterCollection extFilter)
        {
            // todo : hook up search pieces and create filter
            throw new NotImplementedException();
        }


        [HttpGetRoute(UriTemplate = "groups/list")]
        public async Task<HttpResponseMessage> GetGroups()
        {
           // var ret =(await _customerGroupWebApiClient.GetGroups(0, 200)).ReadAsSync().Items.OrderBy(x => x.Name).Select(x => new KeyValuePair<int, string>(x.Id, x.Name)).ToList();

            return this.Request.CreateResponse(HttpStatusCode.OK, List2(new List<string>()));
        }

        [HttpPostRoute(UriTemplate = "groups/create")]
        public async Task<Response<List<KeyValuePair<int, string>>>> EditGroups(List<KeyValuePair<int, string>> groups)
        {

           // var tasks = groups.Select(x => _customerGroupWebApiClient.AddGroup(new DC.CustomerGroup() {Id = x.Key, Name = x.Value})).ToList() ;

           // await Task.WhenAll(tasks);

           // var ret = tasks.Select(x => x.Result.ReadAsSync()).Select(x => new KeyValuePair<int, string>(x.Id, x.Name)).ToList();
            return List2(new List<KeyValuePair<int, string>>());
        }
       



        [HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<ApiCustomer>>> List([FromUri]PagingParamaters pagingParameters, [FromUri]FilterCollection extFilter)
        {
            int customerId;
            if (pagingParameters.id != null)
            {
                customerId = Convert.ToInt32(pagingParameters.id);

                var customer = (await GetAccountWithAttributes(customerId)).Map<ApiCustomer>();

                customer.PaymentCards = (await _customerWebApiClient.GetAccountCards(customer.Id.Value)).ReadAsSync().Items;

                return List2(customer);
            }

            var filter = extFilter.ToFilterString();
            var q = extFilter.ToQString();

            if (extFilter.TryGetValue("id", out customerId ))
            {
                var dcCust  = (await GetAccountWithAttributes(customerId));
                
                if (dcCust != null)
                {
                    var customer = dcCust.Map<ApiCustomer>();
                    return List2(customer);
                }
                
                return List2(new List<ApiCustomer>());
            }

            bool isAnonymous = extFilter.GetValue<bool>("showanonymous", false);

            int? qLimit = (!string.IsNullOrEmpty(q) && extFilter.SearchType == "global") ? (int?)3 : (int?)null;
            var sort = pagingParameters.sort.ToSortString();
            var dcCustomers = (await _customerWebApiClient.GetAccounts(
                                startIndex: pagingParameters.startIndex,
                                pageSize: pagingParameters.pageSize,
                                sortBy: sort,
                                qLimit :qLimit,
                                q:q ,
                                filter: filter,
                                isAnonymous: isAnonymous == true ? (bool?)null : false 
                            )).ReadAsSync();

            var customers = Mapper.Map<List<ApiCustomer>>(dcCustomers.Items);

            return List2(customers, total: (int)dcCustomers.TotalCount);
        }

        /// <summary>
        /// Get single customer account with attributes.
        /// </summary>
        private Task<DC.CustomerAccount> GetAccountWithAttributes(int accountId)
        {
            var customerTask = _customerWebApiClient.GetAccount(accountId);
            var attributeTask = _customerWebApiClient.GetAccountAttributes(accountId);

            return Task.WhenAll(customerTask, attributeTask).ContinueWith<DC.CustomerAccount>(t =>
            {
                if (customerTask.Result.ResponseMessage.IsSuccessStatusCode)
                {
                    var customer = customerTask.Result.ReadAsSync();
                    var attributes = attributeTask.Result.ReadAsSync();

                    customer.Attributes = attributes.Items;
                    return customer;
                }
                return null;
            });
        }

        [HttpPostRoute(UriTemplate = "edit")]
        public async Task<Response<List<ApiCustomer>>> EditCustomers(List<ApiCustomer> customers)
        {
            var retList = new List<ApiCustomer>();
            var dcCustomers = Mapper.Map<List<Mozu.Customer.Contracts.CustomerAccount>>(customers);
            foreach (var dcCust in dcCustomers)
            {
                var dcExistingCustomer = await GetAccountWithAttributes(dcCust.Id);

                await Task.WhenAll( ManageGroups(dcCust, dcExistingCustomer), ManageContacts(dcCust, dcExistingCustomer), ManageAttributes(dcCust, dcExistingCustomer) );
                await _customerWebApiClient.UpdateAccount(dcCust, dcCust.Id);

                var updatedCustomer = await GetAccountWithAttributes(dcCust.Id);
                retList.Add( updatedCustomer.Map<ApiCustomer>() );
            }
            return List2(retList);
            
        }

        /// <summary>
        /// Create a new customer.
        /// </summary>
        [HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<List<ApiCustomer>>> CreateCustomer(List<ApiCustomer> customers)
        {
            List<Task<DC.CustomerAccount>> tasks = new List<Task<DC.CustomerAccount>>();
            foreach (var customer in customers)
            {
                if (customer.IsAnonymous)
                {
                    // anonymous customer: AddAccount
                    tasks.Add( _customerWebApiClient.AddAccount( customer.Map<DC.CustomerAccount>()).ContinueWith(t => t.Result.ReadAsSync()) );
                }
                else
                {
                    // anonymous customer: AddAccount
                    var dc = new DC.CustomerAccountAndAuthInfo {
                        Account = customer.Map<DC.CustomerAccount>(),
                        IsImport = false,
                        Password = "a" + System.Web.Security.Membership.GeneratePassword(8, 3) + "1"
                    };
                    tasks.Add( _customerWebApiClient.AddAccountAndLogin(dc).ContinueWith(t => t.Result.ReadAsSync().CustomerAccount) );
                }
            }
            await Task.WhenAll(tasks);
            var results = tasks.Select(t => t.Result.Map<ApiCustomer>()).ToList();

            return List2(results);
        }


        /// <summary>
        /// Add/remove customer group subroutine for EditCustomers. Yes, a subroutine.
        /// </summary>
        private Task ManageGroups(DC.CustomerAccount dcCustomer, DC.CustomerAccount dcExistingCustomer)
        {
            throw new NotImplementedException();
            //List<Task> groupManagementTasks = new List<Task>();
            //dcExistingCustomer.Groups = dcExistingCustomer.Groups ?? new List<DC.CustomerGroup>();
            //var existingGroups = dcExistingCustomer.Groups.Select(x => x.Id).ToList();
            //var newGroups = dcCustomer.Groups.Select(x => x.Id).ToList();

            //var groupsToAdd = newGroups.Except(existingGroups);
            //var groupsToDel = existingGroups.Except(newGroups);

            //groupManagementTasks.AddRange( groupsToAdd.Select(x => _customerWebApiClient.AddAccountGroup(dcCustomer.Id, x) ) );
            //groupManagementTasks.AddRange( groupsToDel.Select(x => _customerWebApiClient.DeleteAccountGroup(dcCustomer.Id, x)) );

            //return Task.WhenAll(groupManagementTasks);
        }

        private class ContactIdEqualityComparer : IEqualityComparer<DC.CustomerContact> 
        {
            public bool Equals(DC.CustomerContact c1, DC.CustomerContact c2)
            {
             	return c1 != null && c2 != null && c1.AccountId == c2.AccountId && c1.Id == c2.Id;
            }

            public int GetHashCode(DC.CustomerContact c)
            {
             	return c.Id;
            }
        }

        /// <summary>
        /// Update contacts subroutine for EditCustomers. Yes, a subroutine.
        /// </summary>
        private Task ManageContacts(DC.CustomerAccount dcCustomer, DC.CustomerAccount dcExistingCustomer)
        {
            List<Task> contactManagementTasks = new List<Task>();
            if (dcCustomer != null && dcCustomer.Contacts != null && dcExistingCustomer != null && dcExistingCustomer != null)
            {
                var comparer = new ContactIdEqualityComparer();
                var contactsToUpdate = dcCustomer.Contacts.Intersect(dcExistingCustomer.Contacts, comparer).ToList();
                var contactsToAdd = dcCustomer.Contacts.Except(dcExistingCustomer.Contacts, comparer).ToList();
                var contactsToDel = dcExistingCustomer.Contacts.Except(dcCustomer.Contacts, comparer).ToList();

                contactManagementTasks.AddRange( contactsToUpdate.Select(con => _customerWebApiClient.UpdateAccountContact(con, con.AccountId, con.Id) ));
                contactManagementTasks.AddRange( contactsToAdd.Select(con => _customerWebApiClient.AddAccountContact(con, con.AccountId )) );
                contactManagementTasks.AddRange( contactsToDel.Select(con => _customerWebApiClient.DeleteAccountContact(con.AccountId, con.Id )) );
            }

            return Task.WhenAll(contactManagementTasks);
        }

        /// <summary>
        /// Update attributes subroutine for EditCustomers. Yes, a subroutine.
        /// </summary>
        private Task ManageAttributes(DC.CustomerAccount dcCustomer, DC.CustomerAccount dcExistingCustomer)
        {
            List<Task> attributeTasks = new List<Task>();

            var custAttrIds = (dcCustomer.Attributes ?? new List<DC.CustomerAttribute>()).Select(attr => attr.FullyQualifiedName);
            var existingAttrIds = (dcExistingCustomer.Attributes ?? new List<DC.CustomerAttribute>()).Select(attr => attr.FullyQualifiedName);

            var createdAttributeIds = custAttrIds.Except(existingAttrIds).ToList();
            var updatedAttributeIds = custAttrIds.Intersect(existingAttrIds).ToList();

            if (createdAttributeIds.Count > 0)
            {
                attributeTasks.AddRange( dcCustomer.Attributes.Where(a => createdAttributeIds.Contains(a.FullyQualifiedName)).Select(a => _customerWebApiClient.AddAccountAttribute(a, dcCustomer.Id)) );
            }
            if (updatedAttributeIds.Count > 0)
            {
                attributeTasks.AddRange( dcCustomer.Attributes.Where(a => updatedAttributeIds.Contains(a.FullyQualifiedName)).Select(a => _customerWebApiClient.UpdateAccountAttribute(a, dcCustomer.Id)) );
            }

            return Task.WhenAll(attributeTasks);
        }


        [HttpGetRoute(UriTemplate = "cards/list")]
        public async Task<Response<List<DC.Card>>> GetCards([FromUri]int? customerId = null)
        {
            if (!customerId.HasValue)
                throw new ArgumentException("No customerId provided.");

            var result = (await _customerWebApiClient.GetAccountCards(customerId.Value)).ReadAsSync();

            var x = result.Items;
            return List2(x, (int)result.TotalCount);
        }


        [HttpGetRoute(UriTemplate = "credits/list")]
        public async Task<Response<List<Credit>>> GetCredits([FromUri]string id = null, [FromUri]int? customerId = null)
        {
            string filter = null;
            if (id != null)
                filter = string.Format("Code eq \"{0}\"", id);
            if (customerId != null)
                filter = string.Format("CustomerId eq {0}", customerId);

            var dcitem = (await _creditWebApiClient.GetCredits(0, 600, filter: filter)).ReadAsSync();
            var vmitem = Mapper.Map<List<Credit>>(dcitem.Items);
            //todo get all ids and make one query;
            Hashtable custLookups = new Hashtable(); 
            foreach ( var cred in vmitem)
            {
                if (cred.CustomerId.HasValue)
                {
                    var customer = (DC.CustomerAccount )custLookups[cred.CustomerId.Value];
                    if (customer == null)
                    {
                        var cres= (await _customerWebApiClient.GetAccount(cred.CustomerId));
                        if (cres.ResponseMessage.IsSuccessStatusCode)
                        {
                            customer = cres.ReadAsSync();
                        }
                    }
                    custLookups[cred.CustomerId] = customer;
                    if (customer != null)
                    {
                        cred.Customer = Mapper.Map<Mozu.SiteBuilder.UX.Admin.Api.Models.Customer>(customer);
                    }
                }
              
            }

            return List2(vmitem);
        }

        [HttpPostRoute(UriTemplate = "credits/create")]
        public async Task<Response<Credit>> AddCredit(Credit credit)
        {
            var dcitem = Mapper.Map<DC.Credit.Credit>(credit);
            dcitem.InitialBalance = dcitem.CurrentBalance;
            dcitem.CurrencyCode = "USD";
            dcitem = (await _creditWebApiClient.AddCredit(dcitem)).ReadAsSync();
            return Single2(Mapper.Map<Credit>(dcitem));
        }

        [HttpPostRoute(UriTemplate = "credits/edit")]
        public async Task<Response<Credit>> EditCredit(Credit credit)
        {
            var existingItem = (await _creditWebApiClient.GetCredit(credit.Code)).ReadAsSync();
            var adjustment = credit.CurrentBalance - existingItem.CurrentBalance;
            if (adjustment != 0)
            {
                await _creditWebApiClient.AddTransaction(credit.Code, new CreditTransaction()
                {
                    TransactionType = adjustment > 0 ? "Credit" : "Debit",
                    ImpactAmount = adjustment
                });
            }

            var dcitem = Mapper.Map<DC.Credit.Credit>(credit);
            dcitem.CurrencyCode = "USD";
            dcitem.CreditType = "StoreCredit";
            //dcitem.CurrentBalance = 
            
            dcitem = (await _creditWebApiClient.UpdateCredit(dcitem, dcitem.Code)).ReadAsSync();
            return Single2(Mapper.Map<Credit>(dcitem));
        }

        [HttpGetRoute(UriTemplate = "credits/{code}/transactions/list")]
        public async Task<HttpResponseMessage> GetCreditTransactions(string code)
        {
            var resp = (await _creditWebApiClient.GetTransactions(code)).ReadAsSync();
            return this.Request.CreateResponse(HttpStatusCode.OK, List2(resp.Items));
        }
    }
}
