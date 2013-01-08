using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
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

        [WebGet(UriTemplate = "/read/accountcontact/?id={id}")]
        public Task<Response<CustomerAccountContact>> GetAccountContact(int? customerAccountId, int? contactId)
        {
            var accountContact = _accountContactRepository.Get(customerAccountId, contactId);

            return Single(accountContact);
        }

        [WebGet(UriTemplate = "/read/{customerId}")]
        public Task<Response<List<CustomerAccountContact>>> Read(PagingParamaters pagingParams, FilterCollection extFilter, int? customerId)
        {
            var addresses = _accountContactRepository.GetAll(customerId);

            return List(addresses.ToList());
        }

        [WebInvoke(Method = "POST", UriTemplate = "/update/{customerId}")]
        public Task<Response<CustomerAccountContact>> Update(CustomerAccountContact contact, int? customerId)
        {
            var updatedAccountContact = _accountContactRepository.Update(contact, customerId);
            return Single(updatedAccountContact);
        }

        [WebInvoke(Method = "POST", UriTemplate = "/create/{customerId}")]
        public Task<Response<CustomerAccountContact>> Create(CustomerAccountContact accountContact, int? customerId)
        {
            var newAccountContact = _accountContactRepository.Create(accountContact, customerId);

            return Single(newAccountContact);
        }

        [WebInvoke(Method = "POST", UriTemplate = "/delete/{customerId}/?force={force}")]
        public Task<Response<CustomerAccountContact>> Delete(CustomerAccountContact contact, int? customerId, bool force)
        {
            if (force)
            {
                _accountContactRepository.Delete(contact, customerId);
                return EmptySingle<CustomerAccountContact>();
            }
            return Single(contact);
        }

        [WebInvoke(Method = "POST", UriTemplate = "/duplicate/{customerId}")]
        public Task<Response<CustomerAccountContact>> Duplicate(CustomerAccountContact accountContact, int? customerId)
        {
            var duplicate = _accountContactRepository.Duplicate(accountContact);

            return Single(duplicate);
        }
    }
}