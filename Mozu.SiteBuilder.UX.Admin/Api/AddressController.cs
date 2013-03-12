using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.SiteBuilder.Mvc.Customers;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Customers;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class AddressController : BaseController
    {
        private readonly IAccountContactRepository _accountContactRepository;

        public AddressController(IAccountContactRepository accountContactRepository)
        {
            _accountContactRepository = accountContactRepository;
        }

        [WebGet(UriTemplate = "read/accountcontact/?id={id}")]
        public async Task<Response<CustomerAccountContact>> GetAccountContact(int? customerAccountId, int? contactId)
        {
            var accountContact = await _accountContactRepository.Get(customerAccountId, contactId);

            return Single2(accountContact);
        }

        [WebGet(UriTemplate = "read/{customerId}")]
        public async Task<Response<List<CustomerAccountContact>>> Read([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter, int? customerId)
        {
            var addresses = await _accountContactRepository.GetAll(customerId);

            return List2(addresses.ToList());
        }

        [WebInvoke(Method = "POST", UriTemplate = "update/{customerId}")]
        public async Task<Response<CustomerAccountContact>> Update(CustomerAccountContact contact, int? customerId)
        {
            var updatedAccountContact = await _accountContactRepository.Update(contact, customerId);
            return Single2(updatedAccountContact);
        }

        [WebInvoke(Method = "POST", UriTemplate = "create/{customerId}")]
        public async Task<Response<CustomerAccountContact>> Create(CustomerAccountContact accountContact, int? customerId)
        {
            var newAccountContact = await _accountContactRepository.Create(accountContact, customerId);

            return Single2(newAccountContact);
        }

        [WebInvoke(Method = "POST", UriTemplate = "delete/{customerId}/?force={force}")]
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

        [WebInvoke(Method = "POST", UriTemplate = "duplicate/{customerId}")]
        public async Task<Response<CustomerAccountContact>> Duplicate(CustomerAccountContact accountContact, int? customerId)
        {
            var duplicate = await _accountContactRepository.Duplicate(accountContact);

            return Single2(duplicate);
        }
    }
}