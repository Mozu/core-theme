using System;
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
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Helpers.CustomerHelpers;
using ApiCustomer = Mozu.SiteBuilder.UX.Admin.Api.Models.Customer;
using Credit = Mozu.SiteBuilder.UX.Admin.Api.Models.Credit;
using DC = Mozu.Customer.Contracts;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;


namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/customer", SuppressDescriptorGeneration = true)]
    public class CustomerController : BaseController
    {
        private readonly ICustomerAccountWebApiClient _customerWebApiClient;
        private readonly ICustomerGroupWebApiClient _customerGroupWebApiClient;
        private readonly ICreditWebApiClient _creditWebApiClient;

        public CustomerController(ICustomerAccountWebApiClient customerWebApiClient, Mozu.Customer.Contracts.Clients.ICustomerGroupWebApiClient customerGroupWebApiClient, ICreditWebApiClient creditWebApiClient)
        {
            _customerWebApiClient = customerWebApiClient;
            _customerGroupWebApiClient = customerGroupWebApiClient;
            _creditWebApiClient = creditWebApiClient;
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
            var ret =(await _customerGroupWebApiClient.GetGroups(0, 200)).ReadAsSync().Items.OrderBy(x => x.Name).Select(x => new KeyValuePair<int, string>(x.Id, x.Name)).ToList();

            return this.Request.CreateResponse(HttpStatusCode.OK, List2(ret));
        }

        [HttpPostRoute(UriTemplate = "groups/create")]
        public async Task<Response<List<KeyValuePair<int, string>>>> EditGroups(List<KeyValuePair<int, string>> groups)
        {

            var tasks = groups.Select(x => _customerGroupWebApiClient.AddGroup(new DC.CustomerGroup() {Id = x.Key, Name = x.Value})).ToList() ;

            await Task.WhenAll(tasks);

            var ret = tasks.Select(x => x.Result.ReadAsSync()).Select(x => new KeyValuePair<int, string>(x.Id, x.Name)).ToList();
            return List2(ret);
        }
       



        [HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<ApiCustomer>>> List([FromUri]PagingParamaters pagingParameters, [FromUri]FilterCollection extFilter)
        {
            if (pagingParameters.id != null)
            {
                int customerId = Convert.ToInt32(pagingParameters.id);

                var customer = (await GetAccountWithAttributes(customerId)).Map<ApiCustomer>();
                return List2(customer);
            }

            var filter = extFilter.ToFilterString();
            var q = extFilter.ToQString();
            int? qLimit = q == null ? (int?)null : 3;
            var sort = pagingParameters.sort.ToSortString();
            var dcCustomers = (await _customerWebApiClient.GetAccounts(
                                startIndex: pagingParameters.startIndex,
                                pageSize: pagingParameters.pageSize,
                                sortBy: sort,
                                qLimit :qLimit,
                                q:q ,
                                filter: filter
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
                var customer = customerTask.Result.ReadAsSync();
                var attributes = attributeTask.Result.ReadAsSync();

                customer.Attributes = attributes.Items;
                return customer;
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

                await Task.WhenAll( ManageGroups(dcCust, dcExistingCustomer), ManageContacts(dcCust), ManageAttributes(dcCust, dcExistingCustomer) );
                await _customerWebApiClient.UpdateAccount(dcCust, dcCust.Id);

                var updatedCustomer = await GetAccountWithAttributes(dcCust.Id);
                retList.Add( updatedCustomer.Map<ApiCustomer>() );
            }
            return List2(retList);
            
        }

        /// <summary>
        /// Add/remove customer group subroutine for EditCustomers. Yes, a subroutine.
        /// </summary>
        private Task ManageGroups(DC.CustomerAccount dcCustomer, DC.CustomerAccount dcExistingCustomer)
        {
            List<Task> groupManagementTasks = new List<Task>();
            dcExistingCustomer.Groups = dcExistingCustomer.Groups ?? new List<DC.CustomerGroup>();
            var existingGroups = dcExistingCustomer.Groups.Select(x => x.Id).ToList();
            var newGroups = dcCustomer.Groups.Select(x => x.Id).ToList();

            var groupsToAdd = newGroups.Except(existingGroups);
            var groupsToDel = existingGroups.Except(newGroups);

            groupManagementTasks.AddRange( groupsToAdd.Select(x => _customerWebApiClient.AddAccountGroup(dcCustomer.Id, x) ) );
            groupManagementTasks.AddRange( groupsToDel.Select(x => _customerWebApiClient.DeleteAccountGroup(dcCustomer.Id, x)) );

            return Task.WhenAll(groupManagementTasks);
        }

        /// <summary>
        /// Update contacts subroutine for EditCustomers. Yes, a subroutine.
        /// </summary>
        private Task ManageContacts(DC.CustomerAccount dcCustomer)
        {
            List<Task> contactManagementTasks = new List<Task>();
            if (dcCustomer != null && dcCustomer.Contacts != null)
            {
                contactManagementTasks.AddRange( dcCustomer.Contacts.Select(con => _customerWebApiClient.UpdateAccountContact(con, dcCustomer.Id, con.Id)) );
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

        [HttpGetRoute(UriTemplate = "credits2/list")]
        public async Task<HttpResponseMessage> GetCredits2()
        {
            var resp = (await _creditWebApiClient.GetCredits(0, 600)).ReadAsSync();

            return this.Request.CreateResponse(HttpStatusCode.OK, List2(resp), LowerCaseJsonMediaTypeFormatter.Default);
        }

        [HttpPostRoute(UriTemplate = "credits2/create")]
        public async Task<HttpResponseMessage> AddCredit2(DC.Credit.Credit credit)
        {
            var resp = (await _creditWebApiClient.AddCredit(credit)).ReadAsSync();

            return this.Request.CreateResponse(HttpStatusCode.OK, Single2(resp), LowerCaseJsonMediaTypeFormatter.Default);
        }

        [HttpPostRoute(UriTemplate = "credits/edit")]
        public async Task<HttpResponseMessage> EditCredit2(DC.Credit.Credit credit)
        {
            var resp = (await _creditWebApiClient.UpdateCredit(credit, credit.Code)).ReadAsSync();
            return this.Request.CreateResponse(HttpStatusCode.OK, Single2(resp), LowerCaseJsonMediaTypeFormatter.Default);
        }

        [HttpGetRoute(UriTemplate = "credits/list")]
        public async Task<Response<List<Credit>>> GetCredits([FromUri]int? customerId = null)
        {
            string filter = null;
            if (customerId != null)
                filter = string.Format("CustomerId eq {0}", customerId);

            var dcitem = (await _creditWebApiClient.GetCredits(0, 600, filter: filter)).ReadAsSync();
            var vmitem = Mapper.Map<List<Credit>>(dcitem.Items);
            
            vmitem.ForEach(cred => {
                var customer = GetAccountWithAttributes(cred.CustomerId).Result.Map<ApiCustomer>();
                cred.Customer = customer != null && customer.Contacts != null && customer.Contacts.Count() > 0 ? customer.Contacts[0] : new Contact();
            });

            return List2(vmitem);
        }

        [HttpPostRoute(UriTemplate = "credits/create")]
        public async Task<Response<Credit>> AddCredit(Credit credit)
        {
            //_creditWebApiClient.AddCredit(new DC.Credit.Credit()
            //{
            //    InitialBalance = 12,
            //    CurrentBalance = 12,
            //    ActivationDate = DateTime.Now,
            //    CreditType = "StoreCredit",
            //    CurrencyCode = "USD",
            //    CustomerId = 1001,
            //    ExpirationDate = null
            //});
            var dcitem = Mapper.Map<DC.Credit.Credit>(credit);
            dcitem = (await _creditWebApiClient.AddCredit(dcitem)).ReadAsSync();
            return Single2(Mapper.Map<Credit>(dcitem));
        }

        [HttpPostRoute(UriTemplate = "credits/edit")]
        public async Task<Response<Credit>> EditCredit(Credit credit)
        {
            var dcitem = Mapper.Map<DC.Credit.Credit>(credit);
            dcitem = (await _creditWebApiClient.UpdateCredit(dcitem, dcitem.Code)).ReadAsSync();
            return Single2(Mapper.Map<Credit>(dcitem));
        }

        [HttpGetRoute(UriTemplate = "credits/{code}/transactions/list")]
        public async Task<HttpResponseMessage> GetCreditTransactions(string code)
        {
            var resp = (await _creditWebApiClient.GetTransactions(code)).ReadAsSync();
            return this.Request.CreateResponse(HttpStatusCode.OK, List2(resp.Items), LowerCaseJsonMediaTypeFormatter.Default);

            //_creditWebApiClient.GetTransactions(code)
            //var dcitem = Mapper.Map<DC.Credit.Credit>(credit);
            //dcitem = (await _creditWebApiClient.UpdateCredit(dcitem, dcitem.Code)).ReadAsSync();
            //return Single2(Mapper.Map<Credit>(dcitem));
        }

        //[HttpPostRoute(UriTemplate = "credits/edit")]
        //public async Task<Response<List<Credit>>> EditCredits(List<Credit> credits)
        //{
        //    var retList = new List<Credit>();
        //    var dcCredits = Mapper.Map<List<DC.Credit>>(credits);
        //    foreach (var dcCredit in dcCredits)
        //    {
        //        //var dcExistingCustomer = await GetAccountWithAttributes(dcCust.Id);

        //        //await Task.WhenAll(ManageGroups(dcCust, dcExistingCustomer), ManageContacts(dcCust), ManageAttributes(dcCust, dcExistingCustomer));
        //        //await _customerWebApiClient.UpdateAccount(dcCust, dcCust.Id);

        //        //var updatedCustomer = await GetAccountWithAttributes(dcCust.Id);
        //        //retList.Add(updatedCustomer.Map<ApiCustomer>());
        //    }
        //    return List2(retList);

        //}

    }
}
