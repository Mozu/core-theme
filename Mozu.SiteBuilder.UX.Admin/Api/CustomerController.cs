using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using DC = Mozu.Customer.Contracts;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Customers;
using ApiCustomer = Mozu.SiteBuilder.UX.Admin.Api.Models.Customer;
using Mozu.Customer.Contracts.Clients;
using AutoMapper;
//using Mozu.SiteBuilder.Mvc.Customers;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class CustomerController : BaseController
    {
        private readonly ICustomerAccountWebApiClient _customerWebApiClient;
        private readonly Mozu.SiteBuilder.Mvc.Customers.ICustomerGroupsRepository _customerGroupsRepository;

        public CustomerController(ICustomerAccountWebApiClient customerWebApiClient, Mozu.SiteBuilder.Mvc.Customers.ICustomerGroupsRepository customerGroupsRepository)
        {
            _customerWebApiClient = customerWebApiClient;
            _customerGroupsRepository = customerGroupsRepository;
        }

        [WebGet(UriTemplate = "search")]
        public async Task<Response<List<ApiCustomer>>> GetAdvancedSearch([FromUri]PagingParamaters pagingParameters, [FromUri]FilterCollection extFilter)
        {
            // todo : hook up search pieces and create filter
            throw new NotImplementedException();
        }

        [WebGet(UriTemplate = "list")]
        public async Task<Response<List<ApiCustomer>>> List([FromUri]PagingParamaters pagingParameters, [FromUri]FilterCollection extFilter)
        {
            var filter = GetCustomerSearchFilter(extFilter);

            if (pagingParameters.id != null)
            {
                int customerId = Convert.ToInt32(pagingParameters.id);
                var dcCustomer = (await _customerWebApiClient.GetAccount(customerId)).ReadAsSync();

                var customer = Mapper.Map<ApiCustomer>(dcCustomer);
                return List2(customer);
            }

            var dcCustomers = (await _customerWebApiClient.GetAccounts(
                                startIndex: pagingParameters.startIndex,
                                pageSize: pagingParameters.pageSize,
                                sortBy: "Id desc",
                                filter: filter
                            )).ReadAsSync();

            var customers = Mapper.Map<List<ApiCustomer>>(dcCustomers.Items);
            return List2(customers);
        }

        [WebInvoke(UriTemplate = "edit")]
        public async Task<Response<List<ApiCustomer>>> EditCustomers(List<ApiCustomer> customers)
        {
            var retList = new List<ApiCustomer>();
            var dcCustomers = Mapper.Map<List<Mozu.Customer.Contracts.CustomerAccount>>(customers);
            foreach (var dcCust in dcCustomers)
            {
                retList.Add(Mapper.Map<ApiCustomer>((await _customerWebApiClient.UpdateAccount(dcCust, dcCust.Id)).ReadAsSync()));
            }
            return List2(retList);
        }

//        [WebGet(UriTemplate = "autocomplete/?query={query}")]
//        public async Task<Response<List<AutoCompleteField<string>>>> GetSearch(string query)
//        {
//            var groups = await _customerWebApiClient.GetCustomerGroups(x => x.ToLower().Contains(query.ToLower()));
//
//            return List2(groups.Select(x => new AutoCompleteField<string> { Display = x, Value = x }).ToList());
//        }

//        [WebInvoke(Method = "POST", UriTemplate = "notes/create")]
//        public async Task<Response<CustomerAccountNote>> CreateNote(CustomerAccountNote customerAccountNote, [FromUri]FilterCollection extFilter)
//        {
//            var customerAccountId = extFilter.Get<CustomerAccount, int>(x => x.Id);
//            var customerNote = await _customerWebApiClient.CreateCustomerNote(customerAccountNote, customerAccountId);
//
//            return Single2(customerNote);
//        }

//        [WebInvoke(Method = "POST", UriTemplate = "groups/update")]
//        public Response<CustomerGroup> UpdateGroup(CustomerGroup group)
//        {
//            // TODO: This is required for models that are stored in a TreeList. Right now, to leverage
//            //       checkboxes and drag and drop, a TreeList is being used for these in the UI.
//            var response = Single2(group, message: "Groups cannot be updated at this time.");
//
//            return response;
//        }

//        [WebInvoke(Method = "POST", UriTemplate = "groups/create")]
//        public async Task<Response<CustomerGroup>> CreateGroup(CustomerGroup newGroup)
//        {
//            var group = await _customerGroupsRepository.Create(newGroup);
//
//            return Single2(group);
//        }
//
//        [WebInvoke(Method = "POST", UriTemplate = "groups/delete")]
//        public async Task<Response<CustomerGroup>> DeleteGroup(CustomerGroup group)
//        {
//            Task<Response<CustomerGroup>> result = null;
//            try
//            {
//                await _customerGroupsRepository.Delete(group);
//
//                return await Message<CustomerGroup>(true, string.Format("Successfully deleted group '{0}'", group.Name));
//            }
//            catch(AggregateException agex)
//            {
//                var ex = agex.UnwrapAgg();
//                result = Message<CustomerGroup>(false, ex.Message);
//            }
//            catch (Exception ex)
//            {
//                result = Message<CustomerGroup>(false, ex.Message);
//            }
//            return await result;
//        }

//        [WebInvoke(Method = "POST", UriTemplate = "groups/{customerId}/update")]
//        public async Task<Response<List<CustomerGroup>>> UpdateCustomerGroups(List<CustomerGroup> customerGroups, int? customerId)
//        {
//            if (!customerId.HasValue)
//                return Message3<List<CustomerGroup>>(false, "customerId is missing. This value is required.");
//
//            if (customerGroups == null || !customerGroups.Any())
//                return Message3<List<CustomerGroup>>(false, "No groups to update.");
//
//            var groups = new List<CustomerGroup>();
//            foreach (var customerGroup in customerGroups)
//            {
//                var result = await _customerGroupsRepository.AssignGroupToCustomer(customerId.Value, customerGroup.Id);
//                groups.Add(result);
//            }
//
//            return List2(groups);
//        }

        private static string GetCustomerSearchFilter(FilterCollection extFilter)
        {
            if (string.IsNullOrEmpty(extFilter.query))
                return null;

            extFilter.Add(new FilterCollectionItem { comparison = "cont", field = "PrimaryBillingContact.FirstName", value = extFilter.query });
            extFilter.Add(new FilterCollectionItem { comparison = "cont", field = "PrimaryBillingContact.LastNameOrSurname", value = extFilter.query });

            var filter = string.Join(" or ", extFilter.Select(item => String.Join(" ", item.field, item.comparison, string.Format("\"{0}\"", item.value))).ToArray());

            return filter;
        }

//        private static string GetGroupsSearchFilter(FilterCollection extFilter)
//        {
//            return null;
//        }
    }
}