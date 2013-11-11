using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.Core.Api.Routing;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Helpers.CustomerHelpers;
using ApiCustomer = Mozu.SiteBuilder.UX.Admin.Api.Models.Customer;
using DC = Mozu.Customer.Contracts;
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
            if (pagingParameters.id != null)
            {
                int customerId = Convert.ToInt32(pagingParameters.id);
                var dcCustomer = (await _customerWebApiClient.GetAccount(customerId)).ReadAsSync();

                var customer = Mapper.Map<ApiCustomer>(dcCustomer);
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
            return List2(customers);
        }

        [HttpPostRoute(UriTemplate = "edit")]
        public async Task<Response<List<ApiCustomer>>> EditCustomers(List<ApiCustomer> customers)
        {
            var retList = new List<ApiCustomer>();
            var dcCustomers = Mapper.Map<List<Mozu.Customer.Contracts.CustomerAccount>>(customers);
            foreach (var dcCust in dcCustomers)
            {
                var dcExistingCustomer = (await _customerWebApiClient.GetAccount(dcCust.Id)).ReadAsSync();

                await Task.WhenAll( ManageGroups(dcCust, dcExistingCustomer), ManageContacts(dcCust), ManageAttributes(dcCust, dcExistingCustomer) );
                var updatedCustomer = (await _customerWebApiClient.UpdateAccount(dcCust, dcCust.Id)).ReadAsSync();

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
    }
}
