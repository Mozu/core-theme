using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
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

        [WebGet(UriTemplate = "/search")]
        public Task<Response<List<CustomerAccount>>> GetAdvancedSearch(PagingParamaters pagingParameters, FilterCollection extFilter)
        {
            // todo : hook up search pieces and create filter
            return List(_customerRepository.GetAll(0, 1, null).ToList());
        }

        [WebGet(UriTemplate = "/list")]
        public Task<Response<List<CustomerAccount>>> GetList(PagingParamaters pagingParameters, FilterCollection extFilter)
        {
            var filter = GetCustomerSearchFilter(extFilter);

            var customers = _customerRepository.GetAll(
                                filter: filter,
                              //  responseGroups  : "OrderSummary",
                                sortBy: "Id desc",
                                startIndex: pagingParameters.startIndex,
                                pageSize: pagingParameters.pageSize);

            return List(customers.ToList());
        }

        [WebGet(UriTemplate = "/edit/{id}")]
        public Task<Response<CustomerAccount>> GetEdit(int? id)
        {
            var customer = _customerRepository.Get(id);

            return Single(customer);
        }

        [WebGet(UriTemplate = "/autocomplete/?query={query}&value={groupIds}")]
        public Task<Response<List<AutoCompleteField<string>>>> GetSearch(string query, FilterCollection extFilter, string groupIds)
        {
            var groups = _customerRepository.GetCustomerGroups(x => x.ToLower().Contains(query.ToLower()));

            return List(groups.Select(x => new AutoCompleteField<string> { Display = x, Value = x }).ToList());
        }

        [WebGet(UriTemplate = "/notes/list")]
        public Task<Response<List<CustomerAccountNote>>> GetNotes(PagingParamaters pagingParameters, FilterCollection extFilter)
        {
            var customerAccountId = extFilter.Get<CustomerAccount, int>(x => x.Id);
            var notes = _customerRepository.GetCustomerNotes(customerAccountId, pagingParameters.startIndex, pagingParameters.pageSize);

            return List(notes);
        }

        [WebInvoke(Method = "POST", UriTemplate = "/notes/create")]
        public Task<Response<CustomerAccountNote>> CreateNote(CustomerAccountNote customerAccountNote, FilterCollection extFilter)
        {
            var customerAccountId = extFilter.Get<CustomerAccount, int?>(x => x.Id);
            var customerNote = _customerRepository.CreateCustomerNote(customerAccountNote, customerAccountId);

            return Single(customerNote);
        }

        [WebGet(UriTemplate = "/groups/list")]
        public Task<Response<List<CustomerGroup>>> GetGroups(PagingParamaters pagingParamaters, FilterCollection extFilter)
        {
            var filter = GetGroupsSearchFilter(extFilter);

            var groups = _customerGroupsRepository.GetAll(filter, pagingParamaters.startIndex, pagingParamaters.pageSize);

            return List(groups);
        }

        [WebInvoke(Method = "POST", UriTemplate = "/groups/update")]
        public Task<Response<CustomerGroup>> UpdateGroup(CustomerGroup group)
        {
            // TODO: This is required for models that are stored in a TreeList. Right now, to leverage
            //       checkboxes and drag and drop, a TreeList is being used for these in the UI.
            var response = Single(@group, message: "Groups cannot be updated at this time.");

            return response;
        }

        [WebInvoke(Method = "POST", UriTemplate = "/groups/create")]
        public Task<Response<CustomerGroup>> CreateGroup(CustomerGroup newGroup)
        {
            var group = _customerGroupsRepository.Create(newGroup);

            return Single(group);
        }

        [WebInvoke(Method = "POST", UriTemplate = "/groups/delete")]
        public Task<Response<CustomerGroup>> DeleteGroup(CustomerGroup group)
        {
            try
            {
                _customerGroupsRepository.Delete(group);

                return Message<CustomerGroup>(true, string.Format("Successfully deleted group '{0}'", group.Name));
            }
            catch(AggregateException agex)
            {
                var ex = agex.UnwrapAgg();
                return Message<CustomerGroup>(false, ex.Message);
            }
            catch (Exception ex)
            {
                return Message<CustomerGroup>(false, ex.Message);
            }
        }

        [WebInvoke(Method = "POST", UriTemplate = "/groups/{customerId}/update")]
        public Task<Response<List<CustomerGroup>>> UpdateCustomerGroups(List<CustomerGroup> customerGroups, int? customerId)
        {
            if (!customerId.HasValue)
                return Message<List<CustomerGroup>>(false, "customerId is missing. This value is required.");

            if (customerGroups == null || !customerGroups.Any())
                return EmptyList<CustomerGroup>();

            var groups = customerGroups.Select(x => _customerGroupsRepository.AssignGroupToCustomer(customerId.Value, x.Id));

            return List(groups.ToList());
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