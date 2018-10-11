using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.Core;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Api.Routing;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Account;
using Mozu.SiteBuilder.UX.Admin.Helpers.CustomerHelpers;
using ApiB2BAccount = Mozu.SiteBuilder.UX.Admin.Api.Models.B2BAccount;
using ApiB2BUser = Mozu.SiteBuilder.UX.Admin.Api.Models.B2BAccountUser;
using DC = Mozu.Customer.Contracts;
using Mozu.Core.Api.Client;
using Mozu.Core.Behaviors;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.UX.Admin.Helpers;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/b2baccount", SuppressDescriptorGeneration = true)]
    public class B2BAccountController : BaseController
    {
        IB2BAccountWebApiClient _b2bAccountWebApiClient;
        ICustomerAccountWebApiClient _customerWebApiClient;
        ICustomerSetWebApiClient _customerSetWebApiClient;
        private readonly ICustomerSegmentWebApiClient _customerSegmentWebApiClient;
        private readonly IApiContext _apiContext;

        public B2BAccountController(IB2BAccountWebApiClient b2bAccountWebApiClient,
            ICustomerAccountWebApiClient customerWebApiClient, 
            ICustomerSegmentWebApiClient customerSegmentWebApiClient, 
            IApiContext apiContext,
            ICustomerSetWebApiClient customerSetWebApiClient)
        {
            _b2bAccountWebApiClient = b2bAccountWebApiClient;
            _customerWebApiClient = customerWebApiClient;
            _customerSegmentWebApiClient = customerSegmentWebApiClient;
            _apiContext = apiContext;
            _customerSetWebApiClient = customerSetWebApiClient;
        }

        [HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<ApiB2BAccount>>> List(
            [FromUri] PagingParamaters pagingParameters,
            [FromUri] FilterCollection extFilter, 
            bool? showAnonymous = null, 
            bool? isPOFlagRequired = null,
            bool? filterByCustomerSet = false)
        {
            int accountId;

            if (filterByCustomerSet != true)
            {
                _b2bAccountWebApiClient = _b2bAccountWebApiClient.CloneWithApiContext(x => x.SiteId = null);
                _customerWebApiClient = _customerWebApiClient.CloneWithApiContext(x => x.SiteId = null);
            }

            var filter = extFilter.ToFilterString();
            var q = extFilter.ToQString();

            if (pagingParameters.id != null)
            {
                accountId = Convert.ToInt32(pagingParameters.id);
            }
            else
            {
                extFilter.TryGetValue("customeraccountid", out accountId);
            }

            // get single account
            if (accountId > 0)
            {
                var dcB2BAccount = await GetB2BAccount(accountId);
                if (dcB2BAccount == null)
                {
                    return List2(new List<ApiB2BAccount>());
                }

                var b2BAccount = dcB2BAccount.Map<ApiB2BAccount>();
                if (pagingParameters.id == null || b2BAccount.Id == null)
                {
                    return List2(b2BAccount);
                }

                // include payments and PO if customer id came from paging params
                b2BAccount.PaymentCards =
                    (await _customerWebApiClient.GetAccountCards(b2BAccount.Id.Value)).ReadAsSync().Items;

                b2BAccount.PurchaseOrderAccount =
                    (await _customerWebApiClient.GetCustomerPurchaseOrderAccount(b2BAccount.Id.Value)).ReadAsAsync().Result;

                return List2(b2BAccount);
            }

            var qLimit = !string.IsNullOrEmpty(q) && extFilter.SearchType == "global" ? 3 : (int?) null;
            var sort = pagingParameters.sort.ToSortString();
            var dcCustomers = (await _b2bAccountWebApiClient.GetB2BAccounts(
                startIndex: pagingParameters.startIndex,
                pageSize: pagingParameters.pageSize,
                sortBy: sort,
                qLimit: qLimit,
                q: q,
                filter: filter.ToFilterSafeString()
            )).ReadAsSync();

            var b2BAccounts = Mapper.Map<List<ApiB2BAccount>>(dcCustomers.Items);

            //TODO:this flag info should ideally come from getAccounts api call  
            if (isPOFlagRequired.GetValueOrDefault(false))
            {
                var poTasks = b2BAccounts
                    .Select(a => _customerWebApiClient.GetCustomerPurchaseOrderAccount(a.Id, "id,isEnabled"))
                    .ToArray();
                await Task.WhenAll(poTasks);

                var poAccounts = poTasks.Where(x => !x.Result.HasException)
                    .Select(x => x.Result.ReadAsSync())
                    .ToArray();

                foreach (var customer in b2BAccounts)
                {
                    customer.IsPoEnabled =
                        poAccounts.FirstOrDefault(x => x?.AccountId == customer.Id)?.IsEnabled == true;
                }
            }

            return List2(b2BAccounts, dcCustomers.TotalCount);
        }

        /// <summary>
        /// Get single Account.
        /// </summary>
        private Task<DC.B2BAccount> GetB2BAccount(int accountId)
        {
            var customerTask = _b2bAccountWebApiClient.GetB2BAccount(accountId);
            return customerTask.Result.ResponseMessage.IsSuccessStatusCode ? customerTask.Result.ReadAsAsync() : null;
        }

        [HttpPostRoute(UriTemplate = "edit")]
        public async Task<Response<List<ApiB2BAccount>>> EditCustomers(List<ApiB2BAccount> b2bAccounts)
        {
            var retList = new List<ApiB2BAccount>();
            var dcB2BAccounts = Mapper.Map<List<DC.B2BAccount>>(b2bAccounts);
            var purchaseOrderUpdateBehaviorId = new PurchaseOrderUpdateBehavior().Id;
            if (_apiContext.UserClaims != null &&
                _apiContext.UserClaims.BehaviorIds.Any(id => id == purchaseOrderUpdateBehaviorId))
            {
                // save purchase orderInfo
                foreach (var b2bAccount in b2bAccounts)
                {
                    if (b2bAccount.PurchaseOrderAccount != null)
                    {
                        var purchaseOrder = Mapper.Map<CustomerPurchaseOrderAccount>(b2bAccount.PurchaseOrderAccount);

                        if (purchaseOrder.Id != null && purchaseOrder.Id != 0 && b2bAccount.Id != null)
                        {
                            purchaseOrder.AccountId = b2bAccount.Id.Value;
                            await EditCustomerPurchaseOrder(purchaseOrder);
                        }
                        else if (purchaseOrder.IsEnabled && b2bAccount.Id != null)
                        {
                            purchaseOrder.AccountId = b2bAccount.Id.Value;
                            await CreateCustomerPurchaseOrder(purchaseOrder, b2bAccount.Id, b2bAccount.IsActive);
                        }
                    }
                }
            }

            foreach (var dcAccount in dcB2BAccounts)
            {
                var dcExistingAccount = await GetB2BAccount(dcAccount.Id);
                var contactsTuple = ManageContacts(dcAccount, dcExistingAccount);
                var contactsManagementTasks = contactsTuple.Item1;
                var contactsDeleteTasks = contactsTuple.Item2;
                var attrTuple = ManageAttributes(dcAccount, dcExistingAccount);
                var attrTasks = attrTuple.Item1;
                var attrDeleteTasks = attrTuple.Item2;
                var segmentTasks = ManageSegments(dcAccount, dcExistingAccount);


                await Task.WhenAll(contactsManagementTasks, contactsDeleteTasks, attrTasks, attrDeleteTasks,
                    segmentTasks);
                IfTaskHasExceptionThenThrow(contactsManagementTasks);
                IfTaskHasExceptionThenThrow(contactsDeleteTasks);
                IfTaskHasExceptionThenThrow(attrTasks);
                IfTaskHasExceptionThenThrow(attrDeleteTasks);
                IfTaskHasExceptionThenThrow(segmentTasks);

                var response = await _b2bAccountWebApiClient.UpdateAccount(dcAccount, dcAccount.Id);
                IfResponseHasExceptionThenThrow(response);

                var updatedCustomer = await GetB2BAccount(dcAccount.Id);

                if (dcExistingAccount.IsActive ?? true)
                {
                    if (!dcAccount.IsActive ?? true)
                    {
                        var customerAccountAction = new DC.CustomerAccountAction
                        {
                            ActionName = DC.CustomerAccountAction.CustomerAccountActionNameConst.DISABLE_ACCOUNT
                        };
                        await _customerWebApiClient.PerformCustomerAccountAction(dcAccount.Id, customerAccountAction);
                    }
                }
                else
                {
                    if (dcAccount.IsActive ?? true)
                    {
                        var customerAccountAction = new DC.CustomerAccountAction
                        {
                            ActionName = DC.CustomerAccountAction.CustomerAccountActionNameConst.ENABLE_ACCOUNT
                        };
                        await _customerWebApiClient.PerformCustomerAccountAction(dcAccount.Id, customerAccountAction);
                    }
                }

                var customer = updatedCustomer.Map<ApiB2BAccount>();

                if (customer.Id != null)
                {
                    customer.PurchaseOrderAccount =
                        (await _customerWebApiClient.GetCustomerPurchaseOrderAccount(customer.Id.Value))
                        .ReadAsAsync().Result;
                }

                retList.Add(customer);
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
        public async Task<Response<ApiB2BAccount>> CreateB2BAccount(ApiB2BAccount b2baccount)
        {
            //var tasks = new List<Task<DC.B2BAccount>>();

            if (b2baccount.SiteId < 1)
            {
                throw new ArgumentException("No Site Found");
            }

            b2baccount.IsActive = true;

                var b2bClient = _b2bAccountWebApiClient.CloneWithApiContext(ctx => { ctx.SiteId = b2baccount.SiteId; });
                // anonymous customer: AddAccount
                var dc = b2baccount.Map<DC.B2BAccount>();
                var segmentIds = b2baccount.Segments?.Select(x => x.Id).ToList() ?? new List<int>();
                var dcB2bAccount = (await AddCustomerAccount(dc, segmentIds, b2bClient));

           
            var result = dcB2bAccount.Map<ApiB2BAccount>();

            return Single2(result);
        }

        [HttpGetRoute(UriTemplate = "{accountId}/unlock")]
        public async Task<HttpResponseMessage> Unlock(int accountId)
        {
            var customerAccountAction = new DC.CustomerAccountAction
            {
                ActionName = DC.CustomerAccountAction.CustomerAccountActionNameConst.UNLOCK_ACCOUNT
            };

            var result = await _customerWebApiClient.PerformCustomerAccountAction(accountId, customerAccountAction);

            if (result.HasException)
            {
                throw result.ReadException();
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        private async Task<DC.B2BAccount> AddCustomerAccount(
            DC.B2BAccount customerAccountAndAuthInfo, List<int> segmentIds, IB2BAccountWebApiClient b2bClient)
        {
            var customerAccount = (await b2bClient.AddAccount(customerAccountAndAuthInfo)).ReadAsSync();
            if (segmentIds.IsNullOrEmpty())
            {
                return customerAccount;
            }

            foreach (var segmentId in segmentIds)
            {
                await _customerSegmentWebApiClient.AddSegmentAccounts(new List<int> {customerAccount.Id},
                    segmentId);
            }

            customerAccount = (await b2bClient.GetB2BAccount(customerAccount.Id)).ReadAsSync();

            return customerAccount;
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

        private Task<ServiceClientResponse<StreamContent>[]> ManageSegments(DC.B2BAccount dcB2BAccount,
            DC.B2BAccount dcExistingCustomer)
        {

            var groupManagementTasks = new List<Task<ServiceClientResponse<StreamContent>>>();
            dcExistingCustomer.Segments = dcExistingCustomer.Segments ?? new List<DC.CustomerSegment>();
            var existingGroups = dcExistingCustomer.Segments.Select(x => x.Id).ToList();
            var newGroups = dcB2BAccount.Segments.Select(x => x.Id).ToList();

            var groupsToAdd = newGroups.Except(existingGroups);
            var groupsToDel = existingGroups.Except(newGroups);

            groupManagementTasks.AddRange(groupsToAdd.Select(x =>
                _customerSegmentWebApiClient.AddSegmentAccounts(new List<int> {dcB2BAccount.Id}, x)));
            groupManagementTasks.AddRange(groupsToDel.Select(x =>
                _customerSegmentWebApiClient.DeleteSegmentAccounts(new List<int> {dcB2BAccount.Id}, x)));

            return Task.WhenAll(groupManagementTasks);
        }

        /// <summary>
        /// Update contacts subroutine for EditCustomers. Yes, a subroutine.
        /// </summary>
        private Tuple<Task<ServiceClientResponse<DC.CustomerContact>[]>, Task<ServiceClientResponse<StreamContent>[]>>
            ManageContacts(DC.B2BAccount dcCustomer, DC.B2BAccount dcExistingCustomer)
        {
            var contactManagementTasks = new List<Task<ServiceClientResponse<DC.CustomerContact>>>();
            var contactDeleteTasks = new List<Task<ServiceClientResponse<StreamContent>>>();

            if (dcCustomer?.Contacts != null && dcExistingCustomer != null)
            {
                var comparer = new ContactIdEqualityComparer();
                var updateComparer = new ContactUpdateComparer();
                var contactsToUpdate =
                    dcCustomer.Contacts.Intersect(dcExistingCustomer.Contacts, updateComparer).ToList();

                var contactsToAdd = dcCustomer.Contacts.Except(dcExistingCustomer.Contacts, comparer).ToList();
                var contactsToDel = dcExistingCustomer.Contacts.Except(dcCustomer.Contacts, comparer).ToList();

                contactManagementTasks.AddRange(contactsToUpdate.Select(con =>
                    _customerWebApiClient.UpdateAccountContact(con, con.AccountId, con.Id)));

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
            ManageAttributes(DC.B2BAccount dcCustomer, DC.B2BAccount dcExistingCustomer)
        {
            var attributeTasks = new List<Task<ServiceClientResponse<DC.CustomerAttribute>>>();
            var deleteTasks = new List<Task<ServiceClientResponse<StreamContent>>>();

            var custAttrIds = (dcCustomer.Attributes ?? new List<DC.CustomerAttribute>())
                .Where(attribute => attribute.Values != null && attribute.Values.All(o => o != null))
                .Select(attr => attr.FullyQualifiedName);

            var existingAttrIds = (dcExistingCustomer.Attributes ?? new List<DC.CustomerAttribute>())
                .Select(attr => attr.FullyQualifiedName);

            var nullAttrIds = (dcCustomer.Attributes ?? new List<DC.CustomerAttribute>())
                .Where(attribute => attribute.Values == null)
                .Select(attr => attr.FullyQualifiedName);

            var createdAttributeIds = custAttrIds.Except(existingAttrIds).ToList();
            var updatedAttributeIds = custAttrIds.Intersect(existingAttrIds).ToList();
            var deleteAttributeIds = nullAttrIds.Intersect(existingAttrIds).ToList();

            if (createdAttributeIds.Count > 0)
            {
                attributeTasks.AddRange(dcCustomer.Attributes
                    .Where(a => createdAttributeIds.Contains(a.FullyQualifiedName))
                    .Select(a => _b2bAccountWebApiClient.AddB2BAccountAttribute(a, dcCustomer.Id)));
            }

            if (updatedAttributeIds.Count > 0)
            {
                attributeTasks.AddRange(dcCustomer.Attributes
                    .Where(a => updatedAttributeIds.Contains(a.FullyQualifiedName))
                    .Select(a =>
                        _b2bAccountWebApiClient.UpdateB2BAccountAttribute(a, dcCustomer.Id, a.FullyQualifiedName)));
            }

            if (deleteAttributeIds.Count > 0)
            {
                deleteTasks.AddRange(dcCustomer.Attributes.Where(a => deleteAttributeIds.Contains(a.FullyQualifiedName))
                    .Select(a =>
                        _b2bAccountWebApiClient.DeleteB2BAccountAttribute(dcCustomer.Id, a.FullyQualifiedName)));
            }

            return new Tuple<Task<ServiceClientResponse<DC.CustomerAttribute>[]>,
                Task<ServiceClientResponse<StreamContent>[]>>(Task.WhenAll(attributeTasks), Task.WhenAll(deleteTasks));
        }


        private class ContactUpdateComparer : IEqualityComparer<DC.CustomerContact>
        {
            // If the Id's are same but any other field is different, then return true, to indicate there is an update.
            public bool Equals(DC.CustomerContact c1, DC.CustomerContact c2)
            {
                var result = c1 != null && c2 != null && c1.AccountId == c2.AccountId && c1.Id == c2.Id;
                if (result)
                {
                    if (!CompareHelper.AreSame(c1.Address, c2.Address))
                        return true;

                    if (!CompareHelper.AreSame(c1.PhoneNumbers, c2.PhoneNumbers))
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

                    if (!c1.Types.All(c => c2.Types.Any(t => CompareHelper.AreSame(c, t))))
                        return true;

                    return false;
                }

                return false;
            }

            private static bool ContactFieldCompare(DC.CustomerContact contact1, DC.CustomerContact contact2,
                Func<DC.CustomerContact, string> field)
            {
                return string.Equals(field(contact1), field(contact2), StringComparison.OrdinalIgnoreCase);
            }

            public int GetHashCode(DC.CustomerContact c)
            {
                return c.Id;
            }
        }

        [HttpPostRoute(UriTemplate = "purchaseOrder/create")]
        public async Task<Response<CustomerPurchaseOrderAccount>> CreateCustomerPurchaseOrder(
            CustomerPurchaseOrderAccount customerPurchaseOrderAccount, int? id, bool isActive = false)
        {
            var results = customerPurchaseOrderAccount;
            if (!isActive)
            {
                var dcExistingCustomer = (await _b2bAccountWebApiClient.GetB2BAccount(id)).ReadAsSync();
                isActive = dcExistingCustomer.IsActive ?? false;
            }

            if (isActive)
            {
                var dcCustomerPurchaseOrderAccount =
                    customerPurchaseOrderAccount.Map<DC.CustomerPurchaseOrderAccount>();
                var result = (await _customerWebApiClient.CreateCustomerPurchaseOrderAccount(
                    customerPurchaseOrderAccount.AccountId, dcCustomerPurchaseOrderAccount)).ReadAsSync();
                results = result.Map<CustomerPurchaseOrderAccount>();
            }
            else
            {
                throw new ArgumentException("Customer is disabled");
            }
            return Single2(results);
        }

        [HttpPostRoute(UriTemplate = "purchaseOrder/edit")]
        public async Task<Response<CustomerPurchaseOrderAccount>> EditCustomerPurchaseOrder(
            CustomerPurchaseOrderAccount customerPurchaseOrderAccount)
        {
            var dcCustomerPurchaseOrderAccount = customerPurchaseOrderAccount.Map<DC.CustomerPurchaseOrderAccount>();
            var dcResult = (await _customerWebApiClient.UpdateCustomerPurchaseOrderAccount(
                customerPurchaseOrderAccount.AccountId, dcCustomerPurchaseOrderAccount)).ReadAsSync();
            var result = dcResult.Map<CustomerPurchaseOrderAccount>();

            return Single2(result);
        }


        /*********** 
         *  customer set start
         **********/

        [HttpGetRoute(UriTemplate = "{accountId}/customerSet/sites")]
        public async Task<HttpResponseMessage> GetCustomerSetsById([FromUri] PagingParamaters pagingParameters,
            [FromUri] FilterCollection extFilter, [FromUri] int accountId)
        {
            var dcCustomer = (await _b2bAccountWebApiClient.GetB2BAccount(accountId)).ReadAsSync();
            var code = dcCustomer.CustomerSet;
            var set = (await _customerSetWebApiClient.GetCustomerSet(code)).ReadAsSync();
            var applicableSites = set.Sites;

            return Request.CreateResponse(HttpStatusCode.OK, List2(applicableSites, applicableSites.Count));
        }

        /*********** 
         *  user start
         **********/

        [HttpGetRoute(UriTemplate = "{accountId}/users")]
        public async Task<Response<List<DC.B2BUser>>> GetAccountUsers(int accountId,
            [FromUri] PagingParamaters pagingParams, [FromUri] FilterCollection extFilter)
        {
            var startIndex = pagingParams?.startIndex;
            int? pageSize = pagingParams?.pageSize ?? 10;
            var sort = pagingParams?.sort?.ToSortString();
            var filter = extFilter.ToFilterString();
            var q = extFilter.ToQString();
            var qLimit = q == null ? (int?) null : 26;

            var userCollection = (await _b2bAccountWebApiClient.GetUsers(accountId,
                startIndex: startIndex,
                pageSize: pageSize,
                sortBy: sort,
                filter: filter,
                q: q,
                qLimit: qLimit)).ReadAsSync();

            var roleTasks = userCollection.Items
                .Select(x => _b2bAccountWebApiClient.GetUserRolesAsync(accountId, x.UserId))
                .ToArray();

            await Task.WhenAll(roleTasks);
            var successfulRoleTasks = roleTasks.Where(x => !x.Result.HasException)
                .Select(x => x.Result.ReadAsSync())
                .ToArray();

            foreach (var b2BUser in userCollection.Items)
            {
                b2BUser.Roles = successfulRoleTasks
                    .Select(x => x.Items.FirstOrDefault(y => y.UserId == b2BUser.UserId))
                    .Where(x => x != null)
                    .ToList();
            }

            return List2(Mapper.Map<List<DC.B2BUser>>(userCollection.Items), userCollection.TotalCount);
        }

        [HttpPostRoute(UriTemplate = "{accountId}/user/create")]
        public async Task<Response<ApiB2BUser>> AddAccountUser([FromUri]int accountId, ApiB2BUser user)
        {
            if (user.SiteId == 0)
            {
                throw new ArgumentException("No Site Found");
            }

            user.LocaleCode = SbApiContext.LocaleCode;
            user.IsActive = true;
            if (string.IsNullOrEmpty(user.UserName))
            {
                user.UserName = user.EmailAddress;
            }

            var b2bAccountClient = _b2bAccountWebApiClient.CloneWithApiContext(ctx => { ctx.SiteId = user.SiteId; });
            var authUser = new DC.B2BUserAndAuthInfo
            {
                B2BUser = Mapper.Map<DC.B2BUser>(user)
            };

            var resp = (await b2bAccountClient.AddUser(accountId, authUser)).ReadAsSync();

            if (!user.Roles.IsNullOrEmpty())
            {
                var roleTasks = user.Roles
                    .Select(x => _b2bAccountWebApiClient.RemoveUserRoleAsync(accountId, x.UserId, x.RoleId))
                    .ToArray();
                await Task.WhenAll(roleTasks);
            }

            await b2bAccountClient.AddUserRoleAsync(accountId, resp.UserId, user.Role);

            var ret = Mapper.Map<ApiB2BUser>(resp);
            ret.Role = user.Role;
            return Single2(ret);
        }

        [HttpPostRoute(UriTemplate = "{accountId}/user/{userId}/update")]
        public async Task<Response<ApiB2BUser>> UpdateAccountUser([FromUri] int accountId, [FromUri] string userId,
            ApiB2BUser user)
        {
            var dcUser = Mapper.Map<DC.B2BUser>(user);

            var resp = (await _b2bAccountWebApiClient.UpdateUser(accountId, userId, dcUser)).ReadAsSync();

            if (!user.Roles.IsNullOrEmpty())
            {
                var roleTasks = user.Roles
                    .Select(x => _b2bAccountWebApiClient.RemoveUserRoleAsync(accountId, x.UserId, x.RoleId))
                    .ToArray();
                await Task.WhenAll(roleTasks);
            }

            await _b2bAccountWebApiClient.AddUserRoleAsync(accountId, resp.UserId, user.Role);

            var ret = Mapper.Map<ApiB2BUser>(resp);
            ret.Role = user.Role;
            return Single2(ret);
        }

        [HttpPostRoute(UriTemplate = "{accountId}/user/{userId}/remove")]
        public async Task<HttpResponseMessage> RemoveAccountUser(int accountId, string userId)
        {
            var task = _b2bAccountWebApiClient.RemoveUser(accountId, userId);
            await Task.WhenAll(task);

            if (!task.Result.ResponseMessage.IsSuccessStatusCode)
            {
                throw task.Result.ReadException();
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
