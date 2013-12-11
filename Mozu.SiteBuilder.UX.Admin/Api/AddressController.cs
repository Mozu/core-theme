using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.Mvc.Customers;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Customers;
using Mozu.Tenant.Contracts.Clients;
using Mozu.Customer.Contracts.Clients;
using AutoMapper;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/address", SuppressDescriptorGeneration = true)]
    public class AddressController : BaseController
    {
        private readonly IAccountContactRepository _accountContactRepository;
        private readonly IAddressValidationWebApiClient _addressValidationWebApiClient;
        private readonly ITenantsWebApiClient _tenantsWebApiClient;

        public AddressController(IAccountContactRepository accountContactRepository, IAddressValidationWebApiClient addressValidationWebApiClient, ITenantsWebApiClient tenantsWebApiClient)
        {
            _accountContactRepository = accountContactRepository;

            _tenantsWebApiClient = tenantsWebApiClient;
            _addressValidationWebApiClient = addressValidationWebApiClient.CloneWithApiContext(ctx => { ctx.MasterCatalogId = null; ctx.SiteId = null; }).CloneWithoutUserClaims();
        }

		[HttpGetRoute(UriTemplate = "read/accountcontact/?id={id}")]
        public async Task<Response<CustomerAccountContact>> GetAccountContact(int? customerAccountId, int? contactId)
        {
            var accountContact = await _accountContactRepository.Get(customerAccountId, contactId);

            return Single2(accountContact);
        }

		[HttpGetRoute(UriTemplate = "read/{customerId}")]
        public async Task<Response<List<CustomerAccountContact>>> Read([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter, int? customerId)
        {
            var addresses = await _accountContactRepository.GetAll(customerId);

            return List2(addresses.ToList());
        }

        [HttpPostRoute(UriTemplate = "update/{customerId}")]
        public async Task<Response<CustomerAccountContact>> Update(CustomerAccountContact contact, int? customerId)
        {
            var updatedAccountContact = await _accountContactRepository.Update(contact, customerId);
            return Single2(updatedAccountContact);
        }

        [HttpPostRoute(UriTemplate = "create/{customerId}")]
        public async Task<Response<CustomerAccountContact>> Create(CustomerAccountContact accountContact, int? customerId)
        {
            var newAccountContact = await _accountContactRepository.Create(accountContact, customerId);

            return Single2(newAccountContact);
        }

        [HttpPostRoute(UriTemplate = "delete/{customerId}/?force={force}")]
        public Response<CustomerAccountContact> Delete(CustomerAccountContact contact, int? customerId, bool force)
        {
            // TODO: this only deletes if you force=true ??
            if (force)
            {
                _accountContactRepository.Delete(contact, customerId);
                return EmptySingle2<CustomerAccountContact>();
            }
            return Single2(contact);
        }

        [HttpPostRoute(UriTemplate = "duplicate/{customerId}")]
        public async Task<Response<CustomerAccountContact>> Duplicate(CustomerAccountContact accountContact, int? customerId)
        {
            var duplicate = await _accountContactRepository.Duplicate(accountContact);

            return Single2(duplicate);
        }

        [HttpPostRoute(UriTemplate = "validate")]
        public async Task<Response<List<Models.Contact>>> ValidateAddress(Models.Contact contact)
        {
            var req = new Customer.Contracts.AddressValidationRequest()
            {
                Address = Mapper.Map<Core.Api.Contracts.Address>(contact)
            };

            var tenant = (await _tenantsWebApiClient.GetTenantInternal(SbApiContext.TenantId, false)).ReadAsSync();
            var svc = _addressValidationWebApiClient.CloneWithApiContext(ctx => ctx.SiteId = tenant.Sites.FirstOrDefault().Id);

            var list = (await svc.ValidateAddress(req))
                .ReadAsSync()
                .AddressCandidates.Select(x => Mapper.Map<Models.Contact>(x))
                .ToList();

            list.Each(addr =>
            {
                if (addr.Address2 == null) addr.Address2 = "";
                if (addr.Address3 == null) addr.Address3 = "";
                if (addr.Address4 == null) addr.Address4 = "";
            });
 
            return List2(list);
        }
    }
}