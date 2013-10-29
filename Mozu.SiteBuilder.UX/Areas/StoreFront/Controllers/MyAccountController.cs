using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Core;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.User.Contracts;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.Customers;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.Customers;
using Mozu.User.Contracts.Clients;
using PasswordInfo = Mozu.SiteBuilder.UX.Models.Customers.PasswordInfo;
using Mozu.Customer.Contracts.Clients;
using System.Linq;


namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [StoreFrontAuthorizeAttribute]
    public class MyAccountController : BaseApiController
    {
        private readonly ICustomerRepository _customerRepository;
        private readonly IAccountContactRepository _accountContactRepository;
        private readonly IUserWebApiClient _userWebApiClient;
        private readonly IOrderWebApiClient _orderWebApiClient;
        private readonly IAuthenticationHelper _authenticationHelper;
        private readonly ISiteBuilderApiContext _apiContext;
        private readonly ICustomerAccountWebApiClient _customerAccountWebApiClient;

        public MyAccountController(ICustomerRepository customerRepository, ICustomerAccountWebApiClient customerAccountWebApiClient, IAccountContactRepository accountContactRepository, IUserWebApiClient userWebApiClient, IOrderWebApiClient orderWebApiClient, IAuthenticationHelper authenticationHelper, ISiteBuilderApiContext apiContext)
        {
            if(customerRepository == null)
            {
                throw new ArgumentNullException("customerRepository");
            }

            if(customerAccountWebApiClient == null)
            {
                throw new ArgumentNullException("customerAccountWebApiClient");
            }

            if(accountContactRepository == null)
            {
                throw new ArgumentNullException("accountContactRepository");
            }

            if(userWebApiClient == null)
            {
                throw new ArgumentNullException("userWebApiClient");
            }

            if (orderWebApiClient == null)
            {
                throw new ArgumentNullException("orderWebApiClient");
            }

            if (authenticationHelper == null)
            {
                throw new ArgumentNullException("authenticationHelper");
            }

            _customerRepository = customerRepository;
            _customerAccountWebApiClient = customerAccountWebApiClient;
            _accountContactRepository = accountContactRepository;
            _userWebApiClient = userWebApiClient;
            _orderWebApiClient = orderWebApiClient;
            _authenticationHelper = authenticationHelper;
            _apiContext = apiContext;
        }

        //todo:hyper  remiplement auth att.
       // [SiteBuilderAuthorize()]
        public async Task<HttpResponseMessage> Index()
        {
            var account = (await _customerAccountWebApiClient.GetAccounts(null, null, null, null, "UserId eq " + CurrentUser.UserId)).ReadAsSync().Items.FirstOrDefault();

            if (account == null)
            {
                return this.Request.CreateErrorResponse(HttpStatusCode.NotFound, "not found");

            }

            var filter = string.Format("OrderStatus ne \"New\" and CustomerAccountId eq \"{0}\" and OrderNumber ne null", account.Id);

            var orders = await _orderWebApiClient.GetOrders(0, 25, null, filter).Result.ReadAsAsync();

            this.ViewData["Orders"] = orders.Items;

            this.ViewData["User"] = _userWebApiClient.GetUser(CurrentUser.UserId).Result.ReadAsSync();

            return this.Request.CreateResponse(HttpStatusCode.OK,  View("myaccount", account));
        }

        public  Task<CustomerAccount  > GetAccount()
        {
            return _customerRepository.GetByUserId(CurrentUser.UserId);
        }

        [HttpPost]
        // TODO: Do we need this? If so, do we trust the account ID that's passed in?
        public  Task<CustomerAccount> Update(CustomerAccount account)
        {
            return   _customerRepository.Update(account, account.Id);

        }

        [HttpPost]
        public async Task<Mozu.SiteBuilder.UX.Models.Customers.CustomerAccountContact> UpdateCustomerContact(CustomerAccountContact contact)
        {
            var account = await _customerRepository.GetByUserId(CurrentUser.UserId);

            return  await  _accountContactRepository.Update(contact, account.Id);

          
        }

        [HttpPost]
        public async Task<Mozu.SiteBuilder.UX.Models.Customers.CustomerAccountContact> AddCustomerContact(CustomerAccountContact contact)
        {
            var account = await _customerRepository.GetByUserId(CurrentUser.UserId);

            return  await _accountContactRepository.Create(contact, account.Id);

          
        }

        [HttpPost]
        public async Task<bool> DeleteCustomerContact(CustomerAccountContact contact)
        {
            var account = await _customerRepository.GetByUserId(CurrentUser.UserId);

            _accountContactRepository.Delete(contact, account.Id);

            return true;
            
        }

        [HttpPost]
        public async Task<string> UpdateEmail(string email)
        {
            var userId = CurrentUser.UserId;
            var user = await _userWebApiClient.GetUser(userId).Result.ReadAsAsync();

            user.EmailAddress = email;

            var res = await _userWebApiClient.UpdateUser(user, userId).Result.ReadAsAsync();

            return email;
        }

        [HttpPost]
        public async Task<bool> ChangePassword(PasswordInfo info)
        {
            var passwordInfo = new Mozu.User.Contracts.PasswordInfo { NewPassword = info.NewPassword, OldPassword = info.OldPassword };
            var res = await _userWebApiClient.ChangePassword(passwordInfo, CurrentUser.UserId).Result.ReadAsAsync();

            return true;
        }

        protected LightweightUserClaims CurrentUser
        {
            get { return _apiContext.UserClaims; }
        }
    }
}