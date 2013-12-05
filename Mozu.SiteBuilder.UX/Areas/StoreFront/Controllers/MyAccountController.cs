using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.CommerceRuntime.Contracts.Orders;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.Customers;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.Customers;

using PasswordInfo = Mozu.SiteBuilder.UX.Models.Customers.PasswordInfo;


namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [InitCmsPageContextActionFilter]
    [HotOnlyAuthActionFilter]
    public class MyAccountController : BaseApiController
    {
        private const string DEFAULT_WISHLIST_NAME = "my_wishlist";

        private readonly ICustomerRepository _customerRepository;
        private readonly IAccountContactRepository _accountContactRepository;
        
        private readonly IOrderWebApiClient _orderWebApiClient;
        private readonly IAuthenticationHelper _authenticationHelper;
        private readonly ISiteBuilderApiContext _apiContext;
        private readonly ICustomerAccountWebApiClient _customerAccountWebApiClient;
        private readonly IWishlistWebApiClient _wishlistApiClient;

        public MyAccountController(ICustomerRepository customerRepository, ICustomerAccountWebApiClient customerAccountWebApiClient, IAccountContactRepository accountContactRepository,  IOrderWebApiClient orderWebApiClient, IWishlistWebApiClient wishlistWebApiClient, IAuthenticationHelper authenticationHelper, ISiteBuilderApiContext apiContext)
        {
            _customerRepository = customerRepository;
            _customerAccountWebApiClient = customerAccountWebApiClient.CloneWithoutUserClaims();
            _accountContactRepository = accountContactRepository;
            
            _orderWebApiClient = orderWebApiClient.CloneWithoutUserClaims();
            _wishlistApiClient = wishlistWebApiClient.CloneWithoutUserClaims();
            _authenticationHelper = authenticationHelper;
            _apiContext = apiContext;
        }


        private static List<string> OpenOrderStates = new List<string>{
            Order.OrderStatusConst.SUBMITTED,
            Order.OrderStatusConst.ACCEPTED,
            Order.OrderStatusConst.PENDING_REVIEW,
            Order.OrderStatusConst.PROCESSING
        };


        //todo:hyper  remiplement auth att.
       // [SiteBuilderAuthorize()]
        [HttpGet]
        public async Task<HttpResponseMessage> Index()
        {
            var account = (await _customerAccountWebApiClient.GetAccounts(filter : "UserId eq \"" + CurrentUser.UserId + "\"")).ReadAsSync().Items.FirstOrDefault();

            if (account == null)
            {
                return this.Request.CreateErrorResponse(HttpStatusCode.NotFound, "not found");
            }

          
            var cardsTask = _customerAccountWebApiClient.GetAccountCards(account.Id);
            var openOrdersTask = _orderWebApiClient.GetOrders(0, 25, null, BuildOpenOrdersFilter(account.Id));
            var orderHistoryTask = _orderWebApiClient.GetOrders(0, 25, null, BuildOrderHistoryFilter(account.Id));
            var wishlistTask = _wishlistApiClient.GetWishlists(0, 25, null, BuildWishlistFilter(account.Id));

            
            var cards = cardsTask.Result.ReadAsSync();
            var openOrders = openOrdersTask.Result.ReadAsSync();
            var orderHistory = orderHistoryTask.Result.ReadAsSync();
            var wishlistResult = wishlistTask.Result.ReadAsSync();

            var wishlist = (wishlistResult != null && wishlistResult.Items != null ? wishlistResult.Items.FirstOrDefault() : null) ?? new Mozu.CommerceRuntime.Contracts.Wishlists.Wishlist();

            //this.ViewData["Orders"] = orders.Items;
            this.ViewData["User"] = PageContext.User ;

            var jSerializer = new Newtonsoft.Json.JsonSerializer() { ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver() };
            var jAccount = Newtonsoft.Json.Linq.JObject.FromObject(account, jSerializer);

            jAccount.Add("openOrders", Newtonsoft.Json.Linq.JObject.FromObject(openOrders, jSerializer));
            jAccount.Add("orderHistory", Newtonsoft.Json.Linq.JObject.FromObject(orderHistory, jSerializer));

            jAccount.Add("hasSavedCards", (Newtonsoft.Json.Linq.JValue)(cards.Items.Count > 0));
            jAccount.Add("hasSavedContacts", (Newtonsoft.Json.Linq.JValue)(account.Contacts.Count > 0));

            var primaryBillingAccount = account.Contacts.Find(x => x.Types.Exists(y => y.IsPrimary && y.Name == "Billing"));
            if (primaryBillingAccount == null)
            {
                if (account.Contacts.Count == 0)
                {
                    primaryBillingAccount = (await _customerAccountWebApiClient.AddAccountContact(new Customer.Contracts.CustomerContact
                    {
                        FirstName = PageContext.User.FirstName,
                        LastNameOrSurname = PageContext.User.LastName,
                        Address = new Core.Api.Contracts.Address(),
                        Email = PageContext.User.Email ,
                        Types = new List<Customer.Contracts.ContactType>{
                            new Customer.Contracts.ContactType{
                                IsPrimary = true,
                                Name = Customer.Contracts.ContactTypeConst.BILLING
                            }
                        }
                    }, account.Id)).ReadAsSync();
                }
                else
                {
                    primaryBillingAccount = account.Contacts.First();
                }
            }
            jAccount.Add("primaryBillingContact", Newtonsoft.Json.Linq.JObject.FromObject(primaryBillingAccount, jSerializer));

            jAccount.Add("cards", Newtonsoft.Json.Linq.JArray.FromObject(cards.Items, jSerializer));

            jAccount.Add("user", Newtonsoft.Json.Linq.JObject.FromObject(CurrentUser, jSerializer));

            if (wishlist != null)
                jAccount.Add("wishlist", Newtonsoft.Json.Linq.JObject.FromObject(wishlist, jSerializer));

            return this.Request.CreateResponse(HttpStatusCode.OK,  View("my-account", jAccount));
        }

        private string BuildOpenOrdersFilter(int accountId)
        {
            var openOrdersSb = new StringBuilder();
            openOrdersSb.Append(string.Join(" or ", OpenOrderStates.Select(x => string.Format("Status eq \"{0}\"", x))));
            openOrdersSb.Append(" and CustomerAccountId eq \"");
            openOrdersSb.Append(accountId);
            openOrdersSb.Append("\" and OrderNumber ne null");
            return openOrdersSb.ToString();
        }

        private string BuildOrderHistoryFilter(int accountId)
        {
            return String.Format("CustomerAccountId eq \"{0}\" and OrderNumber ne null", accountId);
        }

        private string BuildWishlistFilter(int accountId)
        {
            return String.Format("CustomerAccountId eq \"{0}\" and Name eq \"{1}\"", accountId, DEFAULT_WISHLIST_NAME);
        }

        public  Task<CustomerAccount> GetAccount()
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
           
           
            var account = (await _customerAccountWebApiClient.GetAccount(this.PageContext.User.AccountId)).ReadAsSync();
            account.EmailAddress = email;

            account = (await _customerAccountWebApiClient.UpdateAccount(account, account.Id)).ReadAsSync();

            return account.EmailAddress ;
        }

        [HttpPost]
        public async Task<bool> ChangePassword(PasswordInfo info)
        {

            var account = (await _customerAccountWebApiClient.ChangePassword(new Customer.Contracts.PasswordInfo()
                                                                             {
                                                                                 NewPassword = info.NewPassword,
                                                                                 OldPassword = info.OldPassword
                                                                             }, this.PageContext.User.AccountId ));

         
            if (account.HasException)
            {
                throw account.ReadException();
            }
            return true;
        }

        protected LightweightUserClaims CurrentUser
        {
            get { return _apiContext.UserClaims; }
        }
    }
}