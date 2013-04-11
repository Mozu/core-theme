using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web.Mvc;
using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Core;

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
    [ValidateInput(false)]
    public class MyAccountController : BaseController
    {
        private readonly ICustomerRepository _customerRepository;
        private readonly IAccountContactRepository _accountContactRepository;
        private readonly IUserWebApiClient _userWebApiClient;
        private readonly IOrderWebApiClient _orderWebApiClient;
        private readonly IAuthenticationHelper _authenticationHelper;
        private readonly ICustomerAccountWebApiClient _customerAccountWebApiClient;

        public MyAccountController(ICustomerRepository customerRepository, ICustomerAccountWebApiClient customerAccountWebApiClient, IAccountContactRepository accountContactRepository, IUserWebApiClient userWebApiClient, IOrderWebApiClient orderWebApiClient, IAuthenticationHelper authenticationHelper)
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
        }

        [SiteBuilderAuthorize()]
        public async Task<ActionResult> Index()
        {
            var account = (await _customerAccountWebApiClient.GetCustomerAccounts(null, null, null, null, "UserId eq " + CurrentUser.UserId)).ReadAsSync().Items.FirstOrDefault();

            if (account == null)
            {
                return new HttpNotFoundResult();
            }

            var filter = string.Format("OrderStatus ne \"New\" and CustomerAccountId eq \"{0}\" and OrderNumber ne null", account.Id);

            var orders = await _orderWebApiClient.GetOrders(0, 25, null, filter).Result.ReadAsAsync();

            this.ViewData["Orders"] = orders.Items;

            this.ViewData["User"] = _userWebApiClient.GetUser(CurrentUser.UserId).Result.ReadAsSync();

            return View("myaccount", account);
        }

        public async Task<ActionResult> GetAccount()
        {
            var res = await _customerRepository.GetByUserId(CurrentUser.UserId);

            return new JsonDCResult { Data = res };
        }

        [HttpPost]
        // TODO: Do we need this? If so, do we trust the account ID that's passed in?
        public async Task<ActionResult> Update(CustomerAccount account)
        {
            var res = await _customerRepository.Update(account, account.Id);

            return new JsonDCResult { Data = res };
        }

        [HttpPost]
        public async Task<ActionResult> UpdateCustomerContact(CustomerAccountContact contact)
        {
            var account = await _customerRepository.GetByUserId(CurrentUser.UserId);

            var res = await _accountContactRepository.Update(contact, account.Id);

            return new JsonDCResult { Data = res };
        }

        [HttpPost]
        public async Task<ActionResult> AddCustomerContact(CustomerAccountContact contact)
        {
            var account = await _customerRepository.GetByUserId(CurrentUser.UserId);

            var res = await _accountContactRepository.Create(contact, account.Id);

            return new JsonDCResult { Data = res };
        }

        [HttpPost]
        public async Task<ActionResult> DeleteCustomerContact(CustomerAccountContact contact)
        {
            var account = await _customerRepository.GetByUserId(CurrentUser.UserId);

            _accountContactRepository.Delete(contact, account.Id);

            return new JsonDCResult { Data = true };
        }

        [HttpPost]
        public async Task<ActionResult> UpdateEmail(string email)
        {
            var userId = CurrentUser.UserId;
            var user = await _userWebApiClient.GetUser(userId).Result.ReadAsAsync();

            user.EmailAddress = email;

            var res = await _userWebApiClient.UpdateUser(user, userId).Result.ReadAsAsync();

            return new JsonDCResult { Data = email };
        }

        [HttpPost]
        public async Task<ActionResult> ChangePassword(PasswordInfo info)
        {
            var passwordInfo = new Mozu.User.Contracts.PasswordInfo { NewPassword = info.NewPassword, OldPassword = info.OldPassword };
            var res = await _userWebApiClient.ChangePassword(passwordInfo, CurrentUser.UserId).Result.ReadAsAsync();

            return new JsonDCResult { Data = true };
        }

        protected LightweightUserClaims CurrentUser
        {
            get
            {
                return _authenticationHelper.GetCurrentUser();
            }
        }
    }
}