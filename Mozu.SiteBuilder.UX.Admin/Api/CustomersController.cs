using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.Customer.Contracts;
using Mozu.SiteBuilder.Mvc.Customers;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Customers;
using CustomerAccount = Mozu.SiteBuilder.UX.Models.Customers.CustomerAccount;
using CustomerAccountNote = Mozu.SiteBuilder.UX.Models.Customers.CustomerAccountNote;
using CustomerGroup = Mozu.SiteBuilder.UX.Models.Customers.CustomerGroup;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class CustomersController : BaseController
    {
        private readonly ICustomerRepository _customerRepository;
        private readonly ICustomerGroupsRepository _customerGroupsRepository;

        public CustomersController(ICustomerRepository customerRepository, ICustomerGroupsRepository customerGroupsRepository)
        {
            _customerRepository = customerRepository;
            _customerGroupsRepository = customerGroupsRepository;
        }

        [WebGet(UriTemplate = "search")]
        public async Task<Response<List<CustomerAccount>>> GetAdvancedSearch([FromUri]PagingParamaters pagingParameters, [FromUri]FilterCollection extFilter)
        {
            // todo : hook up search pieces and create filter
            var customerAccounts = await _customerRepository.GetAll(0, 1, null);
            return List2(customerAccounts.ToList());
        }

        [WebGet(UriTemplate = "list")]
        public async Task<Response<List<CustomerAccount>>> GetList([FromUri]PagingParamaters pagingParameters, [FromUri]FilterCollection extFilter)
        {
            var filter = GetCustomerSearchFilter(extFilter);

            var customers = await _customerRepository.GetAll(
                                filter: filter,
                              //  responseGroups  : "OrderSummary",
                                sortBy: "Id desc",
                                startIndex: pagingParameters.startIndex,
                                pageSize: pagingParameters.pageSize);

            return List2(customers.ToList());
        }

        [WebGet(UriTemplate = "edit/{id}")]
        public async Task<Response<CustomerAccount>> GetEdit(int? id)
        {
            var customer = await _customerRepository.Get(id);

            return Single2(customer);
        }

        [WebGet(UriTemplate = "autocomplete/?query={query}")]
        public async Task<Response<List<AutoCompleteField<string>>>> GetSearch(string query)
        {
            var groups = await _customerRepository.GetCustomerGroups(x => x.ToLower().Contains(query.ToLower()));

            return List2(groups.Select(x => new AutoCompleteField<string> { Display = x, Value = x }).ToList());
        }

        [WebGet(UriTemplate = "notes/list")]
        public async Task<Response<List<CustomerAccountNote>>> GetNotes([FromUri]PagingParamaters pagingParameters, [FromUri]FilterCollection extFilter)
        {
            var customerAccountId = extFilter.Get<CustomerAccount, int>(x => x.Id);
            var notes = await _customerRepository.GetCustomerNotes(customerAccountId, pagingParameters.startIndex, pagingParameters.pageSize);

            return List2(notes);
        }

        [WebInvoke(Method = "POST", UriTemplate = "notes/create")]
        public async Task<Response<CustomerAccountNote>> CreateNote(CustomerAccountNote customerAccountNote, [FromUri]FilterCollection extFilter)
        {
            var customerAccountId = extFilter.Get<CustomerAccount, int>(x => x.Id);
            var customerNote = await _customerRepository.CreateCustomerNote(customerAccountNote, customerAccountId);

            return Single2(customerNote);
        }

        [WebGet(UriTemplate = "groups/list")]
        public async Task<Response<List<CustomerGroup>>> GetGroups([FromUri]PagingParamaters pagingParamaters, [FromUri]FilterCollection extFilter)
        {
            var filter = GetGroupsSearchFilter(extFilter);

            var groups = await _customerGroupsRepository.GetAll(filter, pagingParamaters.startIndex, pagingParamaters.pageSize);

            return List2(groups);
        }

        [WebInvoke(Method = "POST", UriTemplate = "groups/update")]
        public Response<CustomerGroup> UpdateGroup(CustomerGroup group)
        {
            // TODO: This is required for models that are stored in a TreeList. Right now, to leverage
            //       checkboxes and drag and drop, a TreeList is being used for these in the UI.
            var response = Single2(group, message: "Groups cannot be updated at this time.");

            return response;
        }

        [WebInvoke(Method = "POST", UriTemplate = "groups/create")]
        public async Task<Response<CustomerGroup>> CreateGroup(CustomerGroup newGroup)
        {
            var group = await _customerGroupsRepository.Create(newGroup);

            return Single2(group);
        }

        [WebInvoke(Method = "POST", UriTemplate = "groups/delete")]
        public async Task<Response<CustomerGroup>> DeleteGroup(CustomerGroup group)
        {
            Task<Response<CustomerGroup>> result = null;
            try
            {
                await _customerGroupsRepository.Delete(group);

                return await Message<CustomerGroup>(true, string.Format("Successfully deleted group '{0}'", group.Name));
            }
            catch(AggregateException agex)
            {
                var ex = agex.UnwrapAgg();
                result = Message<CustomerGroup>(false, ex.Message);
            }
            catch (Exception ex)
            {
                result = Message<CustomerGroup>(false, ex.Message);
            }
            return await result;
        }

        [WebInvoke(Method = "POST", UriTemplate = "groups/{customerId}/update")]
        public async Task<Response<List<CustomerGroup>>> UpdateCustomerGroups(List<CustomerGroup> customerGroups, int? customerId)
        {
            if (!customerId.HasValue)
                return Message3<List<CustomerGroup>>(false, "customerId is missing. This value is required.");

            if (customerGroups == null || !customerGroups.Any())
                return Message3<List<CustomerGroup>>(false, "No groups to update.");

            var groups = new List<CustomerGroup>();
            foreach (var customerGroup in customerGroups)
            {
                var result = await _customerGroupsRepository.AssignGroupToCustomer(customerId.Value, customerGroup.Id);
                groups.Add(result);
            }

            return List2(groups);
        }

        private static string GetCustomerSearchFilter(FilterCollection extFilter)
        {
            if (string.IsNullOrEmpty(extFilter.query))
                return null;

            extFilter.Add(new FilterCollectionItem { comparison = "cont", field = "PrimaryBillingContact.FirstName", value = extFilter.query });
            extFilter.Add(new FilterCollectionItem { comparison = "cont", field = "PrimaryBillingContact.LastNameOrSurname", value = extFilter.query });

            var filter = string.Join(" or ", extFilter.Select(item => String.Join(" ", item.field, item.comparison, string.Format("\"{0}\"", item.value))).ToArray());

            return filter;
        }

        private static string GetGroupsSearchFilter(FilterCollection extFilter)
        {
            return null;
        }
    }
}