using System;
using System.Collections.Generic;
using System.Web.Mvc;
using AutoMapper;
using Mozu.Core;
using Mozu.Order.Contracts.Clients;
using Mozu.User.Contracts;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.Customers;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.Customers;
using Mozu.User.Contracts.Clients;
using PasswordInfo = Mozu.SiteBuilder.UX.Models.Customers.PasswordInfo;

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

        public MyAccountController(ICustomerRepository customerRepository, IAccountContactRepository accountContactRepository, IUserWebApiClient userWebApiClient, IOrderWebApiClient orderWebApiClient, IAuthenticationHelper authenticationHelper)
        {
            if(customerRepository == null)
            {
                throw new ArgumentNullException("customerRepository");
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
            _accountContactRepository = accountContactRepository;
            _userWebApiClient = userWebApiClient;
            _orderWebApiClient = orderWebApiClient;
            _authenticationHelper = authenticationHelper;
        }

        [SiteBuilderAuthorize()]
        public ActionResult Index()
        {
            var account = _customerRepository.GetByUserId(UserId);

            var filter = string.Format("OrderStatus ne \"New\" and CustomerAccountId eq \"{0}\" and OrderNumber ne null", account.Id);

            var orders = _orderWebApiClient.GetOrders(0, 25, null, filter).Result.ReadAsAsync().Result;

            account.Orders = Mapper.Map<List<Models.Orders.Order>>(orders.Items);

            return View("myaccount", account);
        }

        public ActionResult GetAccount()
        {
            var res = _customerRepository.GetByUserId(UserId);

            return new JsonDCResult { Data = res };
        }

        [HttpPost]
        // TODO: Do we need this? If so, do we trust the account ID that's passed in?
        public ActionResult Update(CustomerAccount account)
        {
            var res = _customerRepository.Update(account, account.Id);

            return new JsonDCResult { Data = res };
        }

        [HttpPost]
        public ActionResult UpdateCustomerContact(CustomerAccountContact contact)
        {
            var account = _customerRepository.GetByUserId(UserId);

            var res = _accountContactRepository.Update(contact, account.Id).Result;

            return new JsonDCResult { Data = res };
        }

        [HttpPost]
        public ActionResult AddCustomerContact(CustomerAccountContact contact)
        {
            var account = _customerRepository.GetByUserId(UserId);

            var res = _accountContactRepository.Create(contact, account.Id).Result;

            return new JsonDCResult { Data = res };
        }

        [HttpPost]
        public ActionResult DeleteCustomerContact(CustomerAccountContact contact)
        {
            var account = _customerRepository.GetByUserId(UserId);

            _accountContactRepository.Delete(contact, account.Id);

            return new JsonDCResult { Data = true };
        }

        [HttpPost]
        public ActionResult UpdateEmail(string email)
        {
            var userId = UserId;
            var u = _userWebApiClient.GetUser(userId).Result.ReadAsAsync().Result;

            u.EmailAddress = email;

            var res = _userWebApiClient.UpdateUser(u, userId).Result.ReadAsAsync().Result;

            return new JsonDCResult { Data = email };
        }

        [HttpPost]
        public ActionResult ChangePassword(PasswordInfo info)
        {
            var passwordInfo = new Mozu.User.Contracts.PasswordInfo { NewPassword = info.NewPassword, OldPassword = info.OldPassword };
            var res = _userWebApiClient.ChangePassword(passwordInfo, UserId).Result.ReadAsAsync();

            return new JsonDCResult { Data = true };
        }

        protected string UserId
        {
            get
            {
                LightweightUserClaims claims = _authenticationHelper.GetCurrentUser();

                return claims.UserId;
            }
        }
    }
}