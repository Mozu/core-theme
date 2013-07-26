using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.Core.Api.Routing;
using DC = Mozu.Customer.Contracts;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Customers;
using ApiCustomer = Mozu.SiteBuilder.UX.Admin.Api.Models.Customer;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Helpers.CustomerHelpers;
using AutoMapper;
//using Mozu.SiteBuilder.Mvc.Customers;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/customer", SuppressDescriptorGeneration = true)]
    public class CustomerController : BaseController
    {
        private readonly ICustomerAccountWebApiClient _customerWebApiClient;
        private readonly ICustomerGroupWebApiClient _customerGroupWebApiClient;


        public CustomerController(ICustomerAccountWebApiClient customerWebApiClient, Mozu.Customer.Contracts.Clients.ICustomerGroupWebApiClient customerGroupWebApiClient )
        {
            _customerWebApiClient = customerWebApiClient;
            _customerGroupWebApiClient = customerGroupWebApiClient;
        }

        [HttpGetRoute(UriTemplate = "search")]
        public async Task<Response<List<ApiCustomer>>> GetAdvancedSearch([FromUri]PagingParamaters pagingParameters, [FromUri]FilterCollection extFilter)
        {
            // todo : hook up search pieces and create filter
            throw new NotImplementedException();
        }


        [HttpGetRoute(UriTemplate = "groups/list")]
        public async Task<Response<List<KeyValuePair< int,string >>>> GetGroups()
        {
            var ret =(await _customerGroupWebApiClient.GetGroups(0, 200)).ReadAsSync().Items.OrderBy(x => x.Name).Select(x => new KeyValuePair<int, string>(x.Id, x.Name)).ToList();
            return List2(ret);
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
            var filter = extFilter.ToFilterString();

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

        [HttpPostRoute(UriTemplate = "edit")]
        public async Task<Response<List<ApiCustomer>>> EditCustomers(List<ApiCustomer> customers)
        {
            var retList = new List<ApiCustomer>();
            var dcCustomers = Mapper.Map<List<Mozu.Customer.Contracts.CustomerAccount>>(customers);
            foreach (var dcCust in dcCustomers)
            {
                var existingDcCustoemr = (await _customerWebApiClient.GetAccount(dcCust.Id)).ReadAsSync();

                existingDcCustoemr.Groups = existingDcCustoemr.Groups ?? new List<DC.CustomerGroup>();
                var existingGroups = existingDcCustoemr.Groups.Select(x => x.Id).ToList();
                var newGroups = dcCust.Groups.Select(x => x.Id).ToList();

                var groupsToAdd = newGroups.Where(x => !existingGroups.Contains(x));
                var groupsToDel = existingGroups.Where(x => !newGroups.Contains(x));

                var addTasks =groupsToAdd.Select(x => 
                    _customerWebApiClient.AddAccountGroup(dcCust.Id, x)
                    ).ToList();
                var delTasks =groupsToDel.Select(x => _customerWebApiClient.DeleteAccountGroup(  dcCust.Id , x)).ToList();

               
                await Task.WhenAll( addTasks);
                await Task.WhenAll( delTasks);
                if (dcCust.Contacts != null)
                {
                    foreach (var dcContact in dcCust.Contacts)
                    {
                        _customerWebApiClient.UpdateAccountContact(dcContact, dcCust.Id, dcContact.Id);
                    }    
                }

                await _customerWebApiClient.UpdateAccount(dcCust, dcCust.Id);
                retList.Add( Mapper.Map<ApiCustomer>((await _customerWebApiClient.GetAccount(dcCust.Id)).ReadAsSync()));
            }
            return List2(retList);
            
        }

//        [HttpGetRoute(UriTemplate = "autocomplete/?query={query}")]
//        public async Task<Response<List<AutoCompleteField<string>>>> GetSearch(string query)
//        {
//            var groups = await _customerWebApiClient.GetCustomerGroups(x => x.ToLower().Contains(query.ToLower()));
//
//            return List2(groups.Select(x => new AutoCompleteField<string> { Display = x, Value = x }).ToList());
//        }

//        [HttpPostRoute(UriTemplate = "notes/create")]
//        public async Task<Response<CustomerAccountNote>> CreateNote(CustomerAccountNote customerAccountNote, [FromUri]FilterCollection extFilter)
//        {
//            var customerAccountId = extFilter.Get<CustomerAccount, int>(x => x.Id);
//            var customerNote = await _customerWebApiClient.CreateCustomerNote(customerAccountNote, customerAccountId);
//
//            return Single2(customerNote);
//        }

//        [HttpPostRoute(UriTemplate = "groups/update")]
//        public Response<CustomerGroup> UpdateGroup(CustomerGroup group)
//        {
//            // TODO: This is required for models that are stored in a TreeList. Right now, to leverage
//            //       checkboxes and drag and drop, a TreeList is being used for these in the UI.
//            var response = Single2(group, message: "Groups cannot be updated at this time.");
//
//            return response;
//        }

//        [HttpPostRoute(UriTemplate = "groups/create")]
//        public async Task<Response<CustomerGroup>> CreateGroup(CustomerGroup newGroup)
//        {
//            var group = await _customerGroupsRepository.Create(newGroup);
//
//            return Single2(group);
//        }
//
//        [HttpPostRoute(UriTemplate = "groups/delete")]
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

//        [HttpPostRoute(UriTemplate = "groups/{customerId}/update")]
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

     

//        private static string GetGroupsSearchFilter(FilterCollection extFilter)
//        {
//            return null;
//        }
    }
}