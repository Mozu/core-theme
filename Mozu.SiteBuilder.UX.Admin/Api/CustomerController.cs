using System;
using System.Collections;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.CommerceRuntime.Contracts.Orders;
using Mozu.Core;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Api.Routing;
using Mozu.Core.Logging;
using Mozu.Customer.Contracts.Clients;
using Mozu.Customer.Contracts.Credit;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Account;
using Mozu.SiteBuilder.UX.Admin.Helpers.CustomerHelpers;
using ApiCustomer = Mozu.SiteBuilder.UX.Admin.Api.Models.Customer;
using Credit = Mozu.SiteBuilder.UX.Admin.Api.Models.Credit;
using DC = Mozu.Customer.Contracts;
using Mozu.Core.Api.Client;
using Mozu.Core.Behaviors;
using Mozu.SiteBuilder.UX.Admin.Helpers;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/customer", SuppressDescriptorGeneration = true)]
    public class CustomerController : BaseController
    {
        ICustomerAccountWebApiClient _customerWebApiClient;
        private readonly ICustomerSegmentWebApiClient _customerSegmentWebApiClient;
        //  private readonly ICustomerGroupWebApiClient _customerGroupWebApiClient;
        private readonly ICreditWebApiClient _creditWebApiClient;
        //private readonly ICustomerVisitWebApiClient _customerVisitWebApiClient;
        private readonly IOrderWebApiClient _orderWebApiClient;
        private readonly ICheckoutWebApiClient _checkoutWebApiClient;
        private readonly ILogger _log;
        ICustomerSetWebApiClient _customerSetWebApiClient;
        private readonly IApiContext _apiContext;
        public CustomerController(ICustomerAccountWebApiClient customerWebApiClient,
            ICustomerSegmentWebApiClient customerSegmentWebApiClient,
            //Mozu.Customer.Contracts.Clients.ICustomerGroupWebApiClient customerGroupWebApiClient, 
            ICreditWebApiClient creditWebApiClient, IOrderWebApiClient orderWebApiClient, ILogger log /*, ICustomerVisitWebApiClient customerVisitWebApiClient*/
            , ICustomerSetWebApiClient customerSetWebApiClient
            , IApiContext apiContext, ICheckoutWebApiClient checkoutWebApiClient)
        {
            _customerWebApiClient = customerWebApiClient;
            _customerSegmentWebApiClient = customerSegmentWebApiClient;
            // _customerGroupWebApiClient = customerGroupWebApiClient;
            _creditWebApiClient = creditWebApiClient;
            _orderWebApiClient = orderWebApiClient.CloneWithApiContext(ctx => { ctx.SiteId = null; });
            _log = log;
            _customerSetWebApiClient = customerSetWebApiClient;
            //_customerVisitWebApiClient = customerVisitWebApiClient;
            _apiContext = apiContext;
            _checkoutWebApiClient = checkoutWebApiClient;
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
            var pageSize = pagingParameters.pageSize <= 200 ? pagingParameters.pageSize : 200;
            var q = extFilter.ToQString();
            var filter = extFilter.ToFilterString();
            var segments = (await _customerSegmentWebApiClient.GetSegments(startIndex: pagingParameters.startIndex, pageSize: pageSize, filter:filter)).ReadAsSync();

            if (pageSize >= 200)
            {
                for (int currentPage = 1; segments.TotalCount > (currentPage * pageSize); currentPage++)
                {
                    var segment = (await _customerSegmentWebApiClient.GetSegments(startIndex: (currentPage * pageSize), pageSize: pageSize)).ReadAsSync();
                    segments.Items.AddRange(segment.Items);
                }
            }

            return this.Request.CreateResponse(HttpStatusCode.OK, List2(segments.Items, (int)segments.TotalCount));
        }

        [HttpPostRoute(UriTemplate = "segments/create")]
        public async Task<HttpResponseMessage> CraeteSegments(List<DC.CustomerSegment> segments)
        {
            var tasks = segments.Select(x => _customerSegmentWebApiClient.AddSegment(x)).ToList();
            await Task.WhenAll(tasks);
            var result = tasks.Select(x => x.Result.ReadAsSync()).Map<List<CustomerSegment>>();
            return this.Request.CreateResponse(HttpStatusCode.OK, List2(result));
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
                if (!res.ResponseMessage.IsSuccessStatusCode)
                {
                    throw res.ReadException();
                }
                return this.Request.CreateResponse(HttpStatusCode.OK, this.EmptyList2<int>());
            }

            if (update.Method == "remove")
            {
                var res = (await _customerSegmentWebApiClient.DeleteSegmentAccounts(update.Customers, update.SegmentId));
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

            var tasks = segments.Select(x => _customerSegmentWebApiClient.DeleteSegment(x.Id)).ToList();
            await Task.WhenAll(tasks);

            foreach (var task in tasks.Where(x => !x.Result.ResponseMessage.IsSuccessStatusCode))
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



        /*********** 
         *  customer set start
         **********/

        [HttpGetRoute(UriTemplate = "customerSetsById")]
        public async Task<HttpResponseMessage> GetCustomerSetsById([FromUri]PagingParamaters pagingParameters, [FromUri]FilterCollection extFilter, [FromUri]int Id)
        {
            var dcCustomer = (await _customerWebApiClient.GetAccount(accountId: Id)).ReadAsSync();
            var code = dcCustomer.CustomerSet;
            var set = (await _customerSetWebApiClient.GetCustomerSet(code: code)).ReadAsSync();

            var applicableSites = set.Sites;

            return this.Request.CreateResponse(HttpStatusCode.OK, List2(applicableSites, (int)applicableSites.Count));
        }

        [HttpGetRoute(UriTemplate = "customerSets/list")]
        public async Task<HttpResponseMessage> GetCustomerSets([FromUri]PagingParamaters pagingParameters, [FromUri]FilterCollection extFilter)
        {
            // var ret =(await _customerGroupWebApiClient.GetGroups(0, 200)).ReadAsSync().Items.OrderBy(x => x.Name).Select(x => new KeyValuePair<int, string>(x.Id, x.Name)).ToList();
            var customerSets = (await _customerSetWebApiClient.GetCustomerSets(startIndex: pagingParameters.startIndex, pageSize: pagingParameters.pageSize, responseGroups: "AggregateInfo")).ReadAsSync();

            return this.Request.CreateResponse(HttpStatusCode.OK, List2(customerSets.Items, (int)customerSets.TotalCount));
        }
        [HttpPostRoute(UriTemplate = "customerSets/create")]
        public async Task<HttpResponseMessage> CraeteCustomerSets(List<DC.CustomerSet> customerSets)
        {
            var tasks = customerSets.Select(x => _customerSetWebApiClient.AddCustomerSet(x)).ToList();
            await Task.WhenAll(tasks);
            await Task.WhenAll(customerSets.Where(x => x.Sites != null).SelectMany(x => x.Sites).Select(x => _customerSetWebApiClient.AssignToSite(x, x.CustomerSetCode)).ToList());


            var result = tasks.Select(x => x.Result.ReadAsSync()).ToList();

            return this.Request.CreateResponse(HttpStatusCode.OK, List2(result));
        }





        [HttpPostRoute(UriTemplate = "customerSets/delete")]
        public async Task<HttpResponseMessage> DeleteCustomerSets(List<Newtonsoft.Json.Linq.JObject> customerSets)
        {

            var tasks = customerSets.Select(x => _customerSetWebApiClient.DeleteCustomerSet((string)x["code"], (string)x["replacementCode"])).ToList();
            await Task.WhenAll(tasks);

            foreach (var task in tasks.Where(x => !x.Result.ResponseMessage.IsSuccessStatusCode))
            {
                throw task.Result.ReadException();
            }

            return this.Request.CreateResponse(HttpStatusCode.OK, new List<int>());
        }

        [HttpPostRoute(UriTemplate = "customerSets/edit")]
        public async Task<HttpResponseMessage> EditCustomerSets(List<DC.CustomerSet> customerSets)
        {
            //update name/code/desc
            var tasks = customerSets.Select(x => _customerSetWebApiClient.UpdateCustomerSet(x, x.Code)).ToList();
            await Task.WhenAll(tasks);
            var retList = tasks.Select(x => x.Result.ReadAsSync()).ToList();
            //update assignments  ... remove when assignemnt moved to gen settings
            var currentCustomerSets = (await _customerSetWebApiClient.GetCustomerSets(pageSize: 600)).ReadAsSync().Items;
            var defaultCs = currentCustomerSets.FirstOrDefault(x => x.IsDefault);
            List<Task> assignTasks = new System.Collections.Generic.List<Task>();
            foreach (var cs in customerSets)
            {

                var existingCS = currentCustomerSets.FirstOrDefault(x => string.Equals(x.Code, cs.Code, StringComparison.OrdinalIgnoreCase));
                //new site assignments
                assignTasks.AddRange(cs.Sites?
                    .Where(x => existingCS?.Sites.Any(s => s.SiteId == x.SiteId) == false)
                    .Select(y => _customerSetWebApiClient.AssignToSite(y, cs.Code)));

                //unassignements
                if (defaultCs != null && !string.Equals(defaultCs.Code, cs.Code, StringComparison.OrdinalIgnoreCase))
                {
                    assignTasks.AddRange(existingCS.Sites?
                        .Where(x => cs?.Sites.Any(s => s.SiteId == x.SiteId) == false)
                        .Select(y => _customerSetWebApiClient.AssignToSite(y, defaultCs.Code)));
                }


            }
            if (assignTasks.Count > 0)
            {
                await Task.WhenAll(assignTasks);
                currentCustomerSets = (await _customerSetWebApiClient.GetCustomerSets(pageSize: 600)).ReadAsSync().Items;
            }
            return this.Request.CreateResponse(HttpStatusCode.OK, List2(currentCustomerSets));
        }


        /**************
         * cust set end
         * ************/



        [HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<ApiCustomer>>> List(
            [FromUri] PagingParamaters pagingParameters,
            [FromUri] FilterCollection extFilter, 
            bool? showAnonymous = null,
            bool? isPOFlagRequired = null,
            bool? filterByCustomerSet = false,
            string responseGroups = null)
        {
            int customerId;
            string userId;

            if (filterByCustomerSet != true)
            {
                _customerWebApiClient = _customerWebApiClient.CloneWithApiContext(x => x.SiteId = null);
            }

            // ToQString() is doing a modification to the extFilter
            var q = extFilter.ToQString();
            var filter = extFilter.ToFilterString();

            if (pagingParameters.id != null)
            {
                customerId = Convert.ToInt32(pagingParameters.id);
            }
            else
            {
                if (!extFilter.TryGetValue("id", out customerId))
                {
                    extFilter.TryGetValue("customeraccountid", out customerId);
                }
            }

            // getting a single account
            if (customerId > 0)
            {
                extFilter.TryGetValue("userId", out userId);
                var dcCustomer = await GetAccountWithAttributes(customerId, userId);

                if (dcCustomer == null)
                {
                    return List2(new List<ApiCustomer>());
                }

                var customer = dcCustomer.Map<ApiCustomer>();

                if (pagingParameters.id == null || customer.Id == null)
                {
                    return List2(customer);
                }

                // include payments and PO if customer id came from paging params
                customer.PaymentCards =
                    (await _customerWebApiClient.GetAccountCards(customer.Id.Value)).ReadAsSync().Items;

                customer.PurchaseOrderAccount =
                    (await _customerWebApiClient.GetCustomerPurchaseOrderAccount(customer.Id.Value)).ReadAsAsync().Result;

                return List2(customer);
            }

            var isAnonymous = showAnonymous.GetValueOrDefault(false);
            bool excludeAnonymous;
            if (extFilter.TryGetValue("excludeAnonymous", out excludeAnonymous))
            {
                isAnonymous = !excludeAnonymous;
            }

            var qLimit = (!string.IsNullOrEmpty(q) && extFilter.SearchType == "global") ? (int?) 3 : null;
            var sort = pagingParameters.sort.ToSortString();
            var dcCustomers = (await _customerWebApiClient.GetAccounts(
                startIndex: pagingParameters.startIndex,
                pageSize: pagingParameters.pageSize,
                sortBy: sort,
                qLimit: qLimit,
                q: q,
                filter: filter.ToFilterSafeString(),
                isAnonymous: isAnonymous ? (bool?) null : false,
                responseGroups: responseGroups
            )).ReadAsSync();

            var customers = Mapper.Map<List<ApiCustomer>>(dcCustomers.Items);

            //TODO:this flag info should ideally come from getAccounts api call  
            if (isPOFlagRequired.GetValueOrDefault(false))
            {
                var poTasks = customers
                    .Select(x => _customerWebApiClient.GetCustomerPurchaseOrderAccount(x.Id.Value,
                        responseFields: "id,isEnabled"))
                    .ToArray();
                await Task.WhenAll(poTasks);

                var poAccounts = poTasks.Where(x => !x.Result.HasException)
                    .Select(x => x.Result.ReadAsSync())
                    .ToArray();

                foreach (var customer in customers)
                {
                    customer.IsPoEnabled =
                        poAccounts.FirstOrDefault(x => x?.AccountId == customer.Id)?.IsEnabled == true;
                }
            }

            return List2(customers, dcCustomers.TotalCount);
        }

        /// <summary>
        /// Get single customer account with attributes.
        /// </summary>
        private async Task<DC.CustomerAccount> GetAccountWithAttributes(int accountId, string userId = null)
        {
            var cres = _customerWebApiClient.GetAccount(accountId, null, userId).GetAwaiter().GetResult();
            if (cres.ResponseMessage.IsSuccessStatusCode)
            {
                var customer = cres.ReadAsSync();

                var attributes = await GetAllAccountAttributes(accountId, userId: userId ?? customer.UserId);

                customer.Attributes = attributes;
                return customer;
            }
            return null;
        }

        private async Task<List<DC.CustomerAttribute>> GetAllAccountAttributes(int accountId, string userId = null)
        {
            List<DC.CustomerAttribute> attributes = new List<DC.CustomerAttribute>();
            int startIndex = 0;
            while (true)
            {
                var attrs = (await _customerWebApiClient.GetAccountAttributes(accountId, startIndex, 200, userId: userId)).ReadAsSync();
                attributes.AddRange(attrs.Items);
                startIndex = attrs.PageSize + attrs.StartIndex;
                if (attrs.TotalCount <= startIndex)
                {
                    break;
                }
            }

            return attributes;
        }

        [HttpPostRoute(UriTemplate = "edit")]
        public async Task<Response<List<ApiCustomer>>> EditCustomers(List<ApiCustomer> customers)
        {
            var retList = new List<ApiCustomer>();
            var dcCustomers = Mapper.Map<List<DC.CustomerAccount>>(customers);
            var purchaseOrderUpdateBehaviorId = new PurchaseOrderUpdateBehavior().Id;
            if (_apiContext.UserClaims != null &&
                _apiContext.UserClaims.BehaviorIds.Any(id => id == purchaseOrderUpdateBehaviorId))
            {
                // save purchase orderInfo
                foreach (var cust in customers)
                {
                    if (cust.PurchaseOrderAccount != null)
                    {
                        var purchaseOrder = Mapper.Map<CustomerPurchaseOrderAccount>(cust.PurchaseOrderAccount);

                        if (purchaseOrder.Id != null && purchaseOrder.Id != 0)
                        {
                            purchaseOrder.AccountId = cust.Id.Value;
                            await EditCustomerPurchaseOrder(purchaseOrder);
                        }
                        else if (purchaseOrder.IsEnabled)
                        {
                            purchaseOrder.AccountId = cust.Id.Value;
                            await CreateCustomerPurchaseOrder(purchaseOrder, cust.Id);
                        }
                    }
                }
            }

            foreach (var dcCust in dcCustomers)
            {
                var dcExistingCustomer = await GetAccountWithAttributes(dcCust.Id, dcCust.UserId);
                var contactsTuple = ManageContacts(dcCust, dcExistingCustomer);
                var contactsManagementTasks = contactsTuple.Item1;
                var contactsDeleteTasks = contactsTuple.Item2;
                var attrTuple = ManageAttributes(dcCust, dcExistingCustomer);
                var attrTasks = attrTuple.Item1;
                var attrDeleteTasks = attrTuple.Item2;
                var segmentTasks = ManageSegments(dcCust, dcExistingCustomer);

                // on customer save, if he is no longer locked 
                if (!dcCust.IsLocked && dcExistingCustomer.IsLocked)
                {
                    await Unlock(dcExistingCustomer.Id, dcExistingCustomer.UserId);
                }

                await Task.WhenAll(contactsManagementTasks, contactsDeleteTasks, attrTasks, attrDeleteTasks,
                    segmentTasks);
                IfTaskHasExceptionThenThrow(contactsManagementTasks);
                IfTaskHasExceptionThenThrow(contactsDeleteTasks);
                IfTaskHasExceptionThenThrow(attrTasks);
                IfTaskHasExceptionThenThrow(attrDeleteTasks);
                IfTaskHasExceptionThenThrow(segmentTasks);

                var response = await _customerWebApiClient.UpdateAccount(dcCust, dcCust.Id);
                IfResponseHasExceptionThenThrow(response);

                var updatedCustomer = await GetAccountWithAttributes(dcCust.Id, dcCust.UserId);

                if (dcExistingCustomer.IsActive)
                {
                    if (!dcCust.IsActive)
                    {
                        await _customerWebApiClient.PerformCustomerAccountAction(dcCust.Id,
                            new DC.CustomerAccountAction
                            {
                                ActionName = DC.CustomerAccountAction.CustomerAccountActionNameConst.DISABLE_ACCOUNT
                            }, dcCust.UserId);
                    }
                }
                else
                {
                    if (dcCust.IsActive)
                    {
                        await _customerWebApiClient.PerformCustomerAccountAction(dcCust.Id,
                            new DC.CustomerAccountAction
                            {
                                ActionName = DC.CustomerAccountAction.CustomerAccountActionNameConst.ENABLE_ACCOUNT
                            }, dcCust.UserId);
                    }
                }

                var cust = updatedCustomer.Map<ApiCustomer>();

                cust.IsDisabled = !dcCust.IsActive;
                cust.IsLocked = dcCust.IsLocked;
                cust.PurchaseOrderAccount = (await _customerWebApiClient.GetCustomerPurchaseOrderAccount(cust.Id.Value))
                    .ReadAsAsync().Result;

                retList.Add(cust);
            }

            return List2(retList);
        }

        private static void IfTaskHasExceptionThenThrow<T>(Task<ServiceClientResponse<T>[]> taskResults)
        {
            var responses = taskResults.Result;
            foreach (var response in responses)
            {
                IfResponseHasExceptionThenThrow(response);
            }
        }

        private static void IfResponseHasExceptionThenThrow<T>(ServiceClientResponse<T> response)
        {
            if (response.HasException)
            {
                throw response.ReadException();
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
                    tasks.Add(_customerWebApiClient.AddAccount(customer.Map<DC.CustomerAccount>())
                        .ContinueWith(t => t.Result.ReadAsSync()));
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
                    tasks.Add(AddCustomerAccountAndLogin(dc, customer.SegmentIds));
                }
            }
            await Task.WhenAll(tasks);
            var results = tasks.Select(t => t.Result.Map<ApiCustomer>()).ToList();

            return List2(results);
        }

        private async Task<DC.CustomerAccount> AddCustomerAccountAndLogin(
            DC.CustomerAccountAndAuthInfo customerAccountAndAuthInfo, List<int> segmentIds)
        {
            var customerAccount = (await _customerWebApiClient.AddAccountAndLogin(customerAccountAndAuthInfo)).ReadAsSync()
                    .CustomerAccount;
            if (segmentIds != null && segmentIds.Any())
            {
                foreach (var segmentId in segmentIds)
                {
                    await _customerSegmentWebApiClient.AddSegmentAccounts(new List<int> {customerAccount.Id},
                        segmentId);
                }

                customerAccount = (await _customerWebApiClient.GetAccount(customerAccount.Id)).ReadAsSync();
            }

            return customerAccount;
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

        private class ContactUpdateComparer : IEqualityComparer<DC.CustomerContact>
        {
            // If the Id's are same but any other field is different, then return true, to indicate there is an update.
            public bool Equals(DC.CustomerContact c1, DC.CustomerContact c2)
            {
                var result = c1 != null && c2 != null && c1.AccountId == c2.AccountId && c1.Id == c2.Id;
                if (result)
                {
                    if (!CompareHelper.AreSame<Core.Api.Contracts.Address>(c1.Address, c2.Address))
                        return true;

                    if (!CompareHelper.AreSame<Core.Api.Contracts.Phone>(c1.PhoneNumbers, c2.PhoneNumbers))
                        return true;

                    if (!ContactFieldCompare(c1, c2, (c) => c.Email))
                        return true;

                    if (!ContactFieldCompare(c1, c2, (c) => c.FirstName))
                        return true;

                    if (!ContactFieldCompare(c1, c2, (c) => c.MiddleNameOrInitial))
                        return true;

                    if (!ContactFieldCompare(c1, c2, (c) => c.LastNameOrSurname))
                        return true;

                    if (!ContactFieldCompare(c1, c2, (c) => c.CompanyOrOrganization))
                        return true;

                    if (!ContactFieldCompare(c1, c2, (c) => c.FaxNumber))
                        return true;

                    if ((c1.Types == null && c2.Types != null)
                        || (c1.Types != null && c2.Types == null) || c1.Types.Count != c2.Types.Count)
                        return true;

                    if (!c1.Types.All(c => c2.Types.Any(t => CompareHelper.AreSame<DC.ContactType>(c, t))))
                        return true;

                    return false;
                }

                return false;
            }

            private static bool ContactFieldCompare(DC.CustomerContact contact1, DC.CustomerContact contact2, Func<DC.CustomerContact, string> field)
            {
                return String.Equals(field(contact1), field(contact2), StringComparison.OrdinalIgnoreCase);
            }

            public int GetHashCode(DC.CustomerContact c)
            {
                return c.Id;
            }
        }

        private Task<ServiceClientResponse<StreamContent>[]> ManageSegments(DC.CustomerAccount dcCustomer,
            DC.CustomerAccount dcExistingCustomer)
        {

            var groupManagementTasks = new List<Task<ServiceClientResponse<StreamContent>>>();
            dcExistingCustomer.Segments = dcExistingCustomer.Segments ?? new List<DC.CustomerSegment>();
            var existingGroups = dcExistingCustomer.Segments.Select(x => x.Id).ToList();
            var newGroups = dcCustomer.Segments.Select(x => x.Id).ToList();

            var groupsToAdd = newGroups.Except(existingGroups);
            var groupsToDel = existingGroups.Except(newGroups);

            groupManagementTasks.AddRange(groupsToAdd.Select(x =>
                _customerSegmentWebApiClient.AddSegmentAccounts(new List<int> {dcCustomer.Id}, x)));
            groupManagementTasks.AddRange(groupsToDel.Select(x =>
                _customerSegmentWebApiClient.DeleteSegmentAccounts(new List<int> {dcCustomer.Id}, x)));

            return Task.WhenAll(groupManagementTasks);
        }

        /// <summary>
        /// Update contacts subroutine for EditCustomers. Yes, a subroutine.
        /// </summary>
        private Tuple<Task<ServiceClientResponse<DC.CustomerContact>[]>, Task<ServiceClientResponse<StreamContent>[]>>
            ManageContacts(DC.CustomerAccount dcCustomer, DC.CustomerAccount dcExistingCustomer)
        {
            var contactManagementTasks = new List<Task<ServiceClientResponse<DC.CustomerContact>>>();
            var contactDeleteTasks = new List<Task<ServiceClientResponse<StreamContent>>>();

            if (dcCustomer != null && dcCustomer.Contacts != null && dcExistingCustomer != null &&
                dcExistingCustomer != null)
            {
                var comparer = new ContactIdEqualityComparer();
                var updateComparer = new ContactUpdateComparer();
                var contactsToUpdate =
                    dcCustomer.Contacts.Intersect(dcExistingCustomer.Contacts, updateComparer).ToList();
                var contactsToAdd = dcCustomer.Contacts.Except(dcExistingCustomer.Contacts, comparer).ToList();
                var contactsToDel = dcExistingCustomer.Contacts.Except(dcCustomer.Contacts, comparer).ToList();

                contactManagementTasks.AddRange(contactsToUpdate.Select(con =>
                    _customerWebApiClient.UpdateAccountContact(con, con.AccountId, con.Id, dcExistingCustomer.UserId)));
                contactManagementTasks.AddRange(contactsToAdd.Select(con =>
                    _customerWebApiClient.AddAccountContact(con, con.AccountId)));
                contactDeleteTasks.AddRange(contactsToDel.Select(con =>
                    _customerWebApiClient.DeleteAccountContact(con.AccountId, con.Id)));
            }

            var managementResults = Task.WhenAll(contactManagementTasks);
            var deleteResults = Task.WhenAll(contactDeleteTasks);
            return new Tuple<Task<ServiceClientResponse<DC.CustomerContact>[]>,
                Task<ServiceClientResponse<StreamContent>[]>>(managementResults, deleteResults);
        }


        /// <summary>
        /// Update attributes subroutine for EditCustomers. Yes, a subroutine.
        /// </summary>
        private Tuple<Task<ServiceClientResponse<DC.CustomerAttribute>[]>, Task<ServiceClientResponse<StreamContent>[]>>
            ManageAttributes(DC.CustomerAccount dcCustomer, DC.CustomerAccount dcExistingCustomer)
        {
            var attributeTasks = new List<Task<ServiceClientResponse<DC.CustomerAttribute>>>();
            var deleteTasks = new List<Task<ServiceClientResponse<StreamContent>>>();

            var custAttrIds = (dcCustomer.Attributes ?? new List<DC.CustomerAttribute>())
                .Where(attribute => attribute.Values != null && attribute.Values.All(o => o != null))
                .Select(attr => attr.FullyQualifiedName)
                .ToList();

            var existingAttrIds = (dcExistingCustomer.Attributes ?? new List<DC.CustomerAttribute>())
                .Select(attr => attr.FullyQualifiedName)
                .ToList();

            var nullAttrIds = (dcCustomer.Attributes ?? new List<DC.CustomerAttribute>())
                .Where(attribute => attribute.Values == null)
                .Select(attr => attr.FullyQualifiedName)
                .ToList();

            var createdAttributeIds = custAttrIds.Except(existingAttrIds).ToList();
            var updatedAttributeIds = custAttrIds.Intersect(existingAttrIds).ToList();
            var deleteAttributeIds = nullAttrIds.Intersect(existingAttrIds).ToList();

            if (createdAttributeIds.Count > 0)
            {
                attributeTasks.AddRange(dcCustomer.Attributes
                    .Where(a => createdAttributeIds.Contains(a.FullyQualifiedName))
                    .Select(a => _customerWebApiClient.AddAccountAttribute(a, dcCustomer.Id, dcCustomer.UserId)));
            }
            if (updatedAttributeIds.Count > 0)
            {
                attributeTasks.AddRange(dcCustomer.Attributes
                    .Where(a => updatedAttributeIds.Contains(a.FullyQualifiedName))
                    .Select(a =>
                        _customerWebApiClient.UpdateAccountAttribute(a, dcCustomer.Id, a.FullyQualifiedName,
                            dcCustomer.UserId)));
            }
            if (deleteAttributeIds.Count > 0)
            {
                deleteTasks.AddRange(dcCustomer.Attributes.Where(a => deleteAttributeIds.Contains(a.FullyQualifiedName))
                    .Select(a =>
                        _customerWebApiClient.DeleteAccountAttribute(dcCustomer.Id, a.FullyQualifiedName,
                            dcCustomer.UserId)));
            }

            return new Tuple<Task<ServiceClientResponse<DC.CustomerAttribute>[]>,
                Task<ServiceClientResponse<StreamContent>[]>>(Task.WhenAll(attributeTasks), Task.WhenAll(deleteTasks));
        }

        [HttpGetRoute(UriTemplate = "purchaseOrder/get")]
        public async Task<Response<CustomerPurchaseOrderAccount>> GetPurchaseOrder([FromUri] int? customerId)
        {
            if (!customerId.HasValue)
            {
                throw new ArgumentException("No customerId provided.");
            }

            var result = (await _customerWebApiClient.GetCustomerPurchaseOrderAccount(customerId.Value)).ReadAsSync();

            var results = result.Map<CustomerPurchaseOrderAccount>();

            return Single2(results);
        }

        [HttpPostRoute(UriTemplate = "purchaseOrder/edit")]
        public async Task<Response<CustomerPurchaseOrderAccount>> EditCustomerPurchaseOrder(CustomerPurchaseOrderAccount customerPurchaseOrderAccount)
        {
            var results = customerPurchaseOrderAccount;

            var dcCustomerPurchaseOrderAccount = customerPurchaseOrderAccount.Map<DC.CustomerPurchaseOrderAccount>();
            var result =
                (await _customerWebApiClient.UpdateCustomerPurchaseOrderAccount(customerPurchaseOrderAccount.AccountId,
                    dcCustomerPurchaseOrderAccount)).ReadAsSync();
            results = result.Map<CustomerPurchaseOrderAccount>();

            return Single2(results);
        }

        [HttpPostRoute(UriTemplate = "purchaseOrder/create")]
        public async Task<Response<CustomerPurchaseOrderAccount>> CreateCustomerPurchaseOrder(
            CustomerPurchaseOrderAccount customerPurchaseOrderAccount, int? id)
        {
            var results = customerPurchaseOrderAccount;
            var dcExistingCustomer = (await _customerWebApiClient.GetAccount(id)).ReadAsSync();
            if (dcExistingCustomer.IsActive)
            {
                var dcCustomerPurchaseOrderAccount = customerPurchaseOrderAccount.Map<DC.CustomerPurchaseOrderAccount>();
                var result =
                   (await _customerWebApiClient.CreateCustomerPurchaseOrderAccount(customerPurchaseOrderAccount.AccountId,
                        dcCustomerPurchaseOrderAccount)).ReadAsSync();
                results = result.Map<CustomerPurchaseOrderAccount>();
            }
            else
            {
                throw new ArgumentException("Customer is disabled");
            }
            return Single2(results);
        }

        [HttpGetRoute(UriTemplate = "purchaseOrder/transaction/list")]
        public async Task<Response<List<CustomerPurchaseOrderTransaction>>> GetCustomerPurchaseOrderTransactions([FromUri]int? customerId, [FromUri]PagingParamaters pagingParams = null)
        {
            if (!customerId.HasValue)
            {
                throw new ArgumentException("No customerId provided.");
            }
            int? startIndex = pagingParams.startIndex;
            int? pageSize = pagingParams.pageSize ?? 20;
            var result = (await _customerWebApiClient.GetCustomerPurchaseOrderTransactions(customerId.Value, startIndex, pageSize)).ReadAsAsync().Result;

            var results = result.Items.Select(entry => entry.Map<CustomerPurchaseOrderTransaction>()).ToList();
            var orderIds = results.Where(trans => !string.IsNullOrEmpty(trans.OrderId)).Select(x => x.OrderId).Distinct().ToList();
            var exceptions = new ConcurrentQueue<Exception>();
            Parallel.ForEach(orderIds, new ParallelOptions { MaxDegreeOfParallelism = 20 }, (orderId) =>
              {
                  try
                  {
                      Order order;
                      try
                      {
                          order =
                            (_orderWebApiClient.GetOrder(orderId, responseFields: "OrderNumber,Type").Result.ReadAsAsync())
                            .Result;
                      }
                      catch (AggregateException)
                      {
                          //Check if this is a checkout
                          var checkout = (_checkoutWebApiClient.GetCheckout(orderId, "Number,Type").Result.ReadAsAsync()).Result;
                          order = new Order
                          {
                              OrderNumber = checkout.Number,
                              Type = checkout.Type
                          };

                      }

                      Parallel.ForEach(results.Where(x => x.OrderId == orderId),
                          new ParallelOptions { MaxDegreeOfParallelism = 20 }, (transaction) =>
                          {
                              transaction.OrderNumber = order?.OrderNumber.ToString();
                              transaction.OrderType = order?.Type;
                          });
                  }
                  catch (Exception ex)
                  {
                      _log.Error($"Error getting order info for orderId - {orderId}", ex, orderId);
                      exceptions.Enqueue(ex);
                  }
              });
            return List2(results);
        }

        [HttpGetRoute(UriTemplate = "purchaseOrder/transactions/export")]
        public async Task<CustomerPoTransactionsCsvFileResult> Export([FromUri]int? customerId)
        {
            if (!customerId.HasValue)
            {
                throw new ArgumentException("No customerId provided.");
            }
            var customerPoTransactions = new List<DC.PurchaseOrderTransaction>();
            var startIndex = 0;
            var pageSize = 200;
            while (true)
            {
                var result = (await _customerWebApiClient.GetCustomerPurchaseOrderTransactions(customerId.Value, startIndex, pageSize)).ReadAsAsync().Result;
                var totalCount = result.TotalCount;
                customerPoTransactions.AddRange(result.Items);
                startIndex = result.PageSize + result.StartIndex;
                if (startIndex >= startIndex + pageSize || startIndex >= totalCount)
                {
                    break;
                }
            }

            var results = customerPoTransactions.Select(transaction => transaction.Map<CustomerPurchaseOrderTransaction>()).ToList();
            var orderIds = results.Where(trans => !string.IsNullOrEmpty(trans.OrderId)).Select(x => x.OrderId).Distinct().ToList();
            var exceptions = new ConcurrentQueue<Exception>();
            Parallel.ForEach(orderIds, new ParallelOptions { MaxDegreeOfParallelism = 20 }, (orderId) =>
            {
                try
                {
                    var order =
                        (_orderWebApiClient.GetOrder(orderId, responseFields: "OrderNumber,Type").Result.ReadAsAsync())
                            .Result;
                    Parallel.ForEach(results.Where(x => x.OrderId == orderId),
                        new ParallelOptions { MaxDegreeOfParallelism = 20 }, (transaction) =>
                        {
                            transaction.OrderNumber = order?.OrderNumber.ToString();
                            transaction.OrderType = order?.Type;
                        });
                }
                catch (Exception ex)
                {
                    _log.Error($"Error getting order info for orderId - {orderId}", ex, orderId);
                    exceptions.Enqueue(ex);
                }
            });
            return new CustomerPoTransactionsCsvFileResult("text/csv")
            {
                FileDownloadName = "purchaseOrderTransactions_export.csv",
                CustomerPurchaseOrderTransactions = results
            };

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

            if (extFilter != null && extFilter.Count > 0)
            {
                if (filter != null)
                {
                    filter += " and ";
                }
                filter += extFilter.ToCreditFilterString();

            }

            var sort = pagingParams.sort.ToSortString();

            var dcitemTask = (await _creditWebApiClient.GetCredits(startIndex, pageSize, sortBy: sort, filter: filter));

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
                        cred.Customer = Mapper.Map<ApiCustomer>(customer);
                    }
                }
            }

            return List2(vmitem, dcitem.TotalCount);
        }

        [HttpPostRoute(UriTemplate = "credits/create")]
        public async Task<Response<Credit>> AddCredit(Credit credit, [FromUri] string userId = null)
        {
            var dcItem = Mapper.Map<Customer.Contracts.Credit.Credit>(credit);
            dcItem.InitialBalance = dcItem.CurrentBalance;
            dcItem.CurrencyCode = "USD";
            dcItem = (await _creditWebApiClient.AddCredit(dcItem, userId)).ReadAsSync();
            return Single2(Mapper.Map<Credit>(dcItem));
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

            var dcitem = Mapper.Map<Customer.Contracts.Credit.Credit>(credit);
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
        public async Task<HttpResponseMessage> ResetPassword(int accountId, [FromUri] int? siteId, [FromUri] string userId = null)
        {
            if (siteId.HasValue)
            {
                (_apiContext as ApiContext).SiteId = siteId;
            }

            var result = await _customerWebApiClient.SendPasswordResetEmail(accountId, userId);
            if (result.HasException)
            {
                throw result.ReadException();
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpGetRoute(UriTemplate = "{accountId}/unlock")]
        public async Task<HttpResponseMessage> Unlock(int accountId, [FromUri] string userId = null)
        {
            var action = new DC.CustomerAccountAction
            {
                ActionName = DC.CustomerAccountAction.CustomerAccountActionNameConst.UNLOCK_ACCOUNT
            };
            var result = await _customerWebApiClient.PerformCustomerAccountAction(accountId, action, userId);
            if (result.HasException)
            {
                throw result.ReadException();
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        public class ResendCreditCreatedEmailArgs
        {
            public string Code { get; set; }
        }
        [HttpPostRoute(UriTemplate = "resendcreditcreatedemail")]
        public async Task<Response<Credit>> ResendCreditCreatedEmail(ResendCreditCreatedEmailArgs args, [FromUri] string userId = null)
        {
            await (await _creditWebApiClient.ResendCreditCreatedEmail(args.Code, userId)).ReadAsAsync();
            return this.EmptySingle2<Credit>();
        }


        [HttpGetRoute(UriTemplate = "{accountId}/auditLog/list")]
        public async Task<Response<List<CustomerAuditEntry>>> GetAuditLog([FromUri] int? accountId, [FromUri]PagingParamaters pagingParams = null)
        {
            if (!accountId.HasValue)
            {
                throw new ArgumentException("No customerId provided.");
            }
            // Labes. this needs to change when adding localizability to the admin
            Dictionary<string, string> labels = new Dictionary<string, string>()
            {
                { "@LineofCreditChangeLabel","Line of Credit Change"},
                {"@PurchaseOrderEnableLabel","Purchase Orders Enabled" },
                {"@PurchaseOrderDisableLabel","Purchase Orders Disabled" },
                {"@OverdraftAllowanceLabel", "Overdraft Allowance Change" },
                {"@OverdraftAllowanceTypeLabel", "Overdraft Allowance Type Change" },
                {"@paymentTermAddedLabel", "Payment Term Change" },
                {"@paymentTermRemovedLabel", "Payment Term Changed" },
            };

            int? startIndex = pagingParams.startIndex;

            var auditEntryCollection = (await _customerWebApiClient.GetAccountAuditLog(accountId.Value, startIndex: startIndex, pageSize: pagingParams.pageSize)).ReadAsSync();

            //Replace labels with localized content
            foreach (var auditEntry in auditEntryCollection.Items)
            {
                if (labels.ContainsKey(auditEntry.Description))
                {
                    auditEntry.Description = labels[auditEntry.Description];
                }
            }
            var results = auditEntryCollection.Items.Select(entry => entry.Map<CustomerAuditEntry>()).ToList();
            return List2(results, auditEntryCollection.TotalCount);
        }


    }
}
