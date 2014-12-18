using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.UI;
using AutoMapper;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Api.Routing;
using Mozu.Core.Exceptions;
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
        private readonly ICustomerSegmentWebApiClient _customerSegmentWebApiClient;
        //  private readonly ICustomerGroupWebApiClient _customerGroupWebApiClient;
        private readonly ICreditWebApiClient _creditWebApiClient;
        //private readonly ICustomerVisitWebApiClient _customerVisitWebApiClient;

        public CustomerController(ICustomerAccountWebApiClient customerWebApiClient,
            ICustomerSegmentWebApiClient customerSegmentWebApiClient,
            //Mozu.Customer.Contracts.Clients.ICustomerGroupWebApiClient customerGroupWebApiClient, 
            ICreditWebApiClient creditWebApiClient/*, ICustomerVisitWebApiClient customerVisitWebApiClient*/)
        {
            _customerWebApiClient = customerWebApiClient;
            _customerSegmentWebApiClient = customerSegmentWebApiClient;
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


        [HttpGetRoute(UriTemplate = "segments/list")]
        public async Task<HttpResponseMessage> GetSegments([FromUri]PagingParamaters pagingParameters, [FromUri]FilterCollection extFilter)
        {
            // var ret =(await _customerGroupWebApiClient.GetGroups(0, 200)).ReadAsSync().Items.OrderBy(x => x.Name).Select(x => new KeyValuePair<int, string>(x.Id, x.Name)).ToList();
            var segments = (await _customerSegmentWebApiClient.GetSegments(startIndex: pagingParameters.startIndex, pageSize: pagingParameters.pageSize)).ReadAsSync();

            return this.Request.CreateResponse(HttpStatusCode.OK, List2(segments.Items,(int)segments.TotalCount));
        }

        [HttpPostRoute(UriTemplate = "segments/create")]
        public async Task<HttpResponseMessage> CraeteSegments(List<DC.CustomerSegment> segments)
        {

            var tasks = segments.Select(x => _customerSegmentWebApiClient.AddSegment(x)).ToList();
            await Task.WhenAll(tasks);
            var retList = tasks.Select(x => x.Result.ReadAsSync()).ToList();
            return this.Request.CreateResponse(HttpStatusCode.OK, List2(segments));

        }

        public class SegmentBatchUpdate
        {
            public int SegmentId { get; set; }
            public string Method { get; set; }
            public List<int> Customers { get; set; }
            
        }

       [HttpPostRoute(UriTemplate = "segments/batch")]
        public async Task<HttpResponseMessage> Batch(SegmentBatchUpdate update)
        {
           if (update.Method == "add")
           {
               var res = (await _customerSegmentWebApiClient.AddSegmentAccounts(update.Customers, update.SegmentId));
               if (! res.ResponseMessage.IsSuccessStatusCode)
               {
                   throw res.ReadException();
               }
               return this.Request.CreateResponse(HttpStatusCode.OK, this.EmptyList2<int>());
           }

           if (update.Method == "remove")
           {
               var res = (await _customerSegmentWebApiClient.DeleteSegmentAccounts( update.Customers, update.SegmentId));
               if (!res.ResponseMessage.IsSuccessStatusCode)
               {
                   throw res.ReadException();
               }
               return this.Request.CreateResponse(HttpStatusCode.OK, this.EmptyList2<int>());
           }
           throw new NotImplementedException("unknown batch mode");
        }


        [HttpPostRoute(UriTemplate = "segments/delete")]
        public async Task<HttpResponseMessage> DeleteSegments(List<DC.CustomerSegment> segments)
        {

            var tasks = segments.Select(x => _customerSegmentWebApiClient.DeleteSegment(x.Id )).ToList();
            await Task.WhenAll(tasks);

            foreach (var task in tasks.Where(x=> !x.Result.ResponseMessage.IsSuccessStatusCode ))
            {
                throw task.Result.ReadException();
            }
          
           

            return this.Request.CreateResponse(HttpStatusCode.OK, new List<int>());

        }


        [HttpPostRoute(UriTemplate = "segments/edit")]
        public async Task<HttpResponseMessage> EditSegments(List<DC.CustomerSegment> segments)
        {

            var tasks = segments.Select(x => _customerSegmentWebApiClient.UpdateSegment(x, x.Id)).ToList();
            await Task.WhenAll(tasks);
            var retList = tasks.Select(x => x.Result.ReadAsSync()).ToList();
            return this.Request.CreateResponse(HttpStatusCode.OK, List2(segments));

        }




        [HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<ApiCustomer>>> List([FromUri]PagingParamaters pagingParameters, [FromUri]FilterCollection extFilter, bool? showAnonymous= null)
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

            if (extFilter.TryGetValue("id", out customerId))
            {
                var dcCust = (await GetAccountWithAttributes(customerId));

                if (dcCust != null)
                {
                    var customer = dcCust.Map<ApiCustomer>();
                    return List2(customer);
                }

                return List2(new List<ApiCustomer>());
            }

            bool isAnonymous = showAnonymous.GetValueOrDefault(false);
            bool excludeAnonymous;
            if (extFilter.TryGetValue("excludeAnonymous", out excludeAnonymous))
            {
                isAnonymous = !excludeAnonymous;
            }
                
               

            int? qLimit = (!string.IsNullOrEmpty(q) && extFilter.SearchType == "global") ? (int?)3 : (int?)null;
            var sort = pagingParameters.sort.ToSortString();
            var dcCustomers = (await _customerWebApiClient.GetAccounts(
                                startIndex: pagingParameters.startIndex,
                                pageSize: pagingParameters.pageSize,
                                sortBy: sort,
                                qLimit: qLimit,
                                q: q,
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
                var contactsTuple = ManageContacts(dcCust, dcExistingCustomer);
                var contactsManagementTasks = contactsTuple.Item1;
                var contactsDeleteTasks = contactsTuple.Item2;
                var attrTasks = ManageAttributes(dcCust, dcExistingCustomer);
                var segmentTasks = ManageSegments(dcCust, dcExistingCustomer);
                
                await Task.WhenAll(contactsManagementTasks, contactsDeleteTasks, attrTasks, segmentTasks);
                IfTaskHasExceptionThenThrow(contactsManagementTasks);
                IfTaskHasExceptionThenThrow(contactsDeleteTasks);
                IfTaskHasExceptionThenThrow(attrTasks);
                IfTaskHasExceptionThenThrow(segmentTasks);
 
                await _customerWebApiClient.UpdateAccount(dcCust, dcCust.Id);

                var updatedCustomer = await GetAccountWithAttributes(dcCust.Id);
                retList.Add(updatedCustomer.Map<ApiCustomer>());
            }
            return List2(retList);

        }

        private static void IfTaskHasExceptionThenThrow<T>(Task<ServiceClientResponse<T>[]> taskResults)
        {
            foreach (var taskResult in taskResults.Result.Where(taskResult => taskResult.HasException))
            {
                throw taskResult.ReadException();
            }
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
                    tasks.Add(_customerWebApiClient.AddAccount(customer.Map<DC.CustomerAccount>()).ContinueWith(t => t.Result.ReadAsSync()));
                }
                else
                {
                    // anonymous customer: AddAccount
                    var dc = new DC.CustomerAccountAndAuthInfo
                    {
                        Account = customer.Map<DC.CustomerAccount>(),
                        IsImport = false,
                        Password = "a" + System.Web.Security.Membership.GeneratePassword(8, 3) + "1"
                    };
                    tasks.Add(_customerWebApiClient.AddAccountAndLogin(dc).ContinueWith(t => t.Result.ReadAsSync().CustomerAccount));
                }
            }
            await Task.WhenAll(tasks);
            var results = tasks.Select(t => t.Result.Map<ApiCustomer>()).ToList();

            return List2(results);
        }


        /// <summary>
        /// Add/remove customer group subroutine for EditCustomers. Yes, a subroutine.
        /// </summary>
        //private Task ManageGroups(DC.CustomerAccount dcCustomer, DC.CustomerAccount dcExistingCustomer)
        //{
        //    throw new NotImplementedException();
        //    //List<Task> groupManagementTasks = new List<Task>();
        //    //dcExistingCustomer.Groups = dcExistingCustomer.Groups ?? new List<DC.CustomerGroup>();
        //    //var existingGroups = dcExistingCustomer.Groups.Select(x => x.Id).ToList();
        //    //var newGroups = dcCustomer.Groups.Select(x => x.Id).ToList();

        //    //var groupsToAdd = newGroups.Except(existingGroups);
        //    //var groupsToDel = existingGroups.Except(newGroups);

        //    //groupManagementTasks.AddRange( groupsToAdd.Select(x => _customerWebApiClient.AddAccountGroup(dcCustomer.Id, x) ) );
        //    //groupManagementTasks.AddRange( groupsToDel.Select(x => _customerWebApiClient.DeleteAccountGroup(dcCustomer.Id, x)) );

        //    //return Task.WhenAll(groupManagementTasks);
        //}

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


        private Task<ServiceClientResponse<StreamContent>[]> ManageSegments(DC.CustomerAccount dcCustomer, DC.CustomerAccount dcExistingCustomer)
        {

            var groupManagementTasks = new List<Task<ServiceClientResponse<StreamContent>>>();
            dcExistingCustomer.Segments = dcExistingCustomer.Segments ?? new List<DC.CustomerSegment>();
            var existingGroups = dcExistingCustomer.Segments .Select(x => x.Id).ToList();
            var newGroups = dcCustomer.Segments.Select(x => x.Id).ToList();

            var groupsToAdd = newGroups.Except(existingGroups);
            var groupsToDel = existingGroups.Except(newGroups);

            groupManagementTasks.AddRange(groupsToAdd.Select(x => _customerSegmentWebApiClient.AddSegmentAccounts( new List<int>{ dcCustomer.Id} , x)));
            groupManagementTasks.AddRange(groupsToDel.Select(x => _customerSegmentWebApiClient.DeleteSegmentAccounts( new List<int>{ dcCustomer.Id} , x)));

            return Task.WhenAll(groupManagementTasks);
        }



        /// <summary>
        /// Update contacts subroutine for EditCustomers. Yes, a subroutine.
        /// </summary>
        private Tuple<Task<ServiceClientResponse<DC.CustomerContact>[]>, Task<ServiceClientResponse<StreamContent>[]>> ManageContacts(DC.CustomerAccount dcCustomer, DC.CustomerAccount dcExistingCustomer)
        {
            var contactManagementTasks = new List<Task<ServiceClientResponse<DC.CustomerContact>>>();
            var contactDeleteTasks = new List<Task<ServiceClientResponse<StreamContent>>>();

            if (dcCustomer != null && dcCustomer.Contacts != null && dcExistingCustomer != null && dcExistingCustomer != null)
            {
                var comparer = new ContactIdEqualityComparer();
                var contactsToUpdate = dcCustomer.Contacts.Intersect(dcExistingCustomer.Contacts, comparer).ToList();
                var contactsToAdd = dcCustomer.Contacts.Except(dcExistingCustomer.Contacts, comparer).ToList();
                var contactsToDel = dcExistingCustomer.Contacts.Except(dcCustomer.Contacts, comparer).ToList();

                contactManagementTasks.AddRange(contactsToUpdate.Select(con => _customerWebApiClient.UpdateAccountContact(con, con.AccountId, con.Id)));
                contactManagementTasks.AddRange(contactsToAdd.Select(con => _customerWebApiClient.AddAccountContact(con, con.AccountId)));
                contactDeleteTasks.AddRange(contactsToDel.Select(con => _customerWebApiClient.DeleteAccountContact(con.AccountId, con.Id)));
            }

            var managementResults = Task.WhenAll(contactManagementTasks);
            var deleteResults = Task.WhenAll(contactDeleteTasks);
            return new Tuple<Task<ServiceClientResponse<DC.CustomerContact>[]>, Task<ServiceClientResponse<StreamContent>[]>>(managementResults, deleteResults);

        }

        /// <summary>
        /// Update attributes subroutine for EditCustomers. Yes, a subroutine.
        /// </summary>
        private Task<ServiceClientResponse<DC.CustomerAttribute>[]> ManageAttributes(DC.CustomerAccount dcCustomer, DC.CustomerAccount dcExistingCustomer)
        {
            var attributeTasks = new List<Task<ServiceClientResponse<DC.CustomerAttribute>>>();

            var custAttrIds = (dcCustomer.Attributes ?? new List<DC.CustomerAttribute>()).Select(attr => attr.FullyQualifiedName);
            var existingAttrIds = (dcExistingCustomer.Attributes ?? new List<DC.CustomerAttribute>()).Select(attr => attr.FullyQualifiedName);

            var createdAttributeIds = custAttrIds.Except(existingAttrIds).ToList();
            var updatedAttributeIds = custAttrIds.Intersect(existingAttrIds).ToList();

            if (createdAttributeIds.Count > 0)
            {
                attributeTasks.AddRange(dcCustomer.Attributes.Where(a => createdAttributeIds.Contains(a.FullyQualifiedName)).Select(a => _customerWebApiClient.AddAccountAttribute(a, dcCustomer.Id)));
            }
            if (updatedAttributeIds.Count > 0)
            {
                attributeTasks.AddRange(dcCustomer.Attributes.Where(a => updatedAttributeIds.Contains(a.FullyQualifiedName))
                    .Select(a => _customerWebApiClient.UpdateAccountAttribute(a, dcCustomer.Id, a.FullyQualifiedName)));
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
        public async Task<Response<List<Credit>>> GetCredits([FromUri]string id = null, [FromUri]FilterCollection extFilter = null, [FromUri]PagingParamaters pagingParams = null, [FromUri]int? customerId = null)
        {
            string filter = null;

            int impermanence;
            if (extFilter.TryGetValue<int>("customerId", out impermanence))
                customerId = impermanence;

            if (id != null)
                filter = string.Format("Code eq \"{0}\"", id);
            if (customerId != null)
                filter = string.Format("CustomerId eq {0}", customerId);

            int? startIndex = pagingParams.startIndex;
            int? pageSize = pagingParams.pageSize ?? 20;

            var dcitemTask = (await _creditWebApiClient.GetCredits(startIndex, pageSize, filter: filter));

            if (dcitemTask.HasException)
            {
                throw dcitemTask.ReadException();
            }

            var dcitem = dcitemTask.ReadAsSync();
            var vmitem = Mapper.Map<List<Credit>>(dcitem.Items);
            //todo get all ids and make one query;
            Hashtable custLookups = new Hashtable();
            foreach (var cred in vmitem)
            {
                if (cred.CustomerId.HasValue)
                {
                    var customer = (DC.CustomerAccount)custLookups[cred.CustomerId.Value];
                    if (customer == null)
                    {
                        var cres = (await _customerWebApiClient.GetAccount(cred.CustomerId));
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

            return List2(vmitem, dcitem.TotalCount);
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
           // dcitem.CurrencyCode = "USD";
            //dcitem.CreditType = dcitem.CreditType "StoreCredit";
            //dcitem.CurrentBalance = 

            dcitem = (await _creditWebApiClient.UpdateCredit(dcitem, dcitem.Code)).ReadAsSync();
            return Single2(Mapper.Map<Credit>(dcitem));
        }

        [HttpPostRoute(UriTemplate = "credits/delete")]
        public async Task<Response<Credit>> DeleteCredit(Credit credit)
        {
            (await _creditWebApiClient.DeleteCredit(credit.Code)).ReadAsSync();

            return EmptySingle2<Credit>();
        }

        [HttpGetRoute(UriTemplate = "credits/{code}/transactions/list")]
        public async Task<HttpResponseMessage> GetCreditTransactions(string code)
        {
            var resp = (await _creditWebApiClient.GetTransactions(code)).ReadAsSync();
            return this.Request.CreateResponse(HttpStatusCode.OK, List2(resp.Items));
        }

        [HttpGetRoute(UriTemplate = "{accountId}/resetpassword")]
        public async Task<HttpResponseMessage> ResetPassword(int accountId)
        {
            var result = (await _customerWebApiClient.SendPasswordResetEmail(accountId));
            if (result.HasException)
            {
                throw result.ReadException();
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpGetRoute(UriTemplate = "{accountId}/unlock")]
        public async Task<HttpResponseMessage> Unlock(int accountId)
        {
            var result = (await _customerWebApiClient.UnlockAccount(accountId));
            if (result.HasException)
            {
                throw result.ReadException();
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpGetRoute(UriTemplate = "{accountId}/toggleAccountStatus")]
        public async Task<HttpResponseMessage> ToggleAccountStatus(int accountId)
        {
            var result = (await _customerWebApiClient.ToggleAccountStatus(accountId));
            if (result.HasException)
            {
                throw result.ReadException();
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
