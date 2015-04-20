using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.Customers;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.UX.Models.Customers;

using PasswordInfo = Mozu.SiteBuilder.UX.Models.Customers.PasswordInfo;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Filters;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ContextInitialization]
    [HotOnlyAuthActionFilter]
    [SslOnlyActionFilter]
    [DataViewModeEnforcement]
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
        private readonly ICreditWebApiClient _creditApiClient;
        private readonly IReturnWebApiClient _returnApiClient;

        public MyAccountController(ICustomerRepository customerRepository, ICustomerAccountWebApiClient customerAccountWebApiClient, IAccountContactRepository accountContactRepository,  IOrderWebApiClient orderWebApiClient, IWishlistWebApiClient wishlistWebApiClient, ICreditWebApiClient creditWebApiClient, IReturnWebApiClient returnApiClient, IAuthenticationHelper authenticationHelper, ISiteBuilderApiContext apiContext)
        {
            _customerRepository = customerRepository;
            _customerAccountWebApiClient = customerAccountWebApiClient.CloneWithoutUserClaims();
            _accountContactRepository = accountContactRepository;
            
            _orderWebApiClient = orderWebApiClient;
            _wishlistApiClient = wishlistWebApiClient;
            _creditApiClient = creditWebApiClient.CloneWithoutUserClaims();
            _returnApiClient = returnApiClient;
            _authenticationHelper = authenticationHelper;
            _apiContext = apiContext;
        }


        //private static List<string> OpenOrderStates = new List<string>{
        //    Order.OrderStatusConst.SUBMITTED,
        //    Order.OrderStatusConst.ACCEPTED,
        //    Order.OrderStatusConst.PENDING_REVIEW,
        //    Order.OrderStatusConst.PROCESSING
        //};


        //todo:hyper  remiplement auth att.
       // [SiteBuilderAuthorize()]
        [HttpGet]
        public async Task<HttpResponseMessage> Index()
        {
            //var account = (await _customerAccountWebApiClient.GetAccounts(filter : "UserId eq \"" + CurrentUser.UserId + "\"")).ReadAsSync().Items.FirstOrDefault();

            var account = (await _customerAccountWebApiClient.GetAccount(this.PageContext.User.AccountId)).ReadAsSync();

            if (account == null)
            {
                return this.Request.CreateErrorResponse(HttpStatusCode.NotFound, "not found");
            }


            var pc = this.PageContext;
            pc.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = "my-account",
                    DocumentTypeFQN = "pageTemplateContent@mozu"
                }

            };
            pc.PageType = "my_account";



            var cardsTask = _customerAccountWebApiClient.GetAccountCards(account.Id);
            var orderHistoryTask = _orderWebApiClient.GetOrders(0, 5, null, "Status ne Created and Status ne Validated and Status ne Pending and Status ne Abandoned and Status ne Errored");
            var returnHistoryTask = _returnApiClient.GetReturns(0, 5, null);
            var storeCreditsTask = _creditApiClient.GetCredits(0, 25, "activationDate DESC", String.Format("CustomerId eq \"{0}\" and activationdate le \"{1}\" and expirationdate ge \"{1}\"", account.Id, DateTime.UtcNow.ToString("o")));
            var wishlistTask = _wishlistApiClient.GetWishlistByName(account.Id, DEFAULT_WISHLIST_NAME);

            var shipTask = GetShippableCountries();
            var billTask = GetBillingCountries();

            var shipStateTask = GetUSShippingStates();
            var billStateTask = GetUSBillingStates();

            await Task.WhenAll(cardsTask, orderHistoryTask, returnHistoryTask, storeCreditsTask, wishlistTask, shipStateTask, billStateTask);

            this.PageContext.ShippingCountries = shipTask.Result;
            this.PageContext.BillingCountries  = billTask.Result;

            this.PageContext.BillingStates = billStateTask.Result;
            this.PageContext.ShippingStates = shipStateTask.Result;
            
            CommerceRuntime.Contracts.Wishlists.Wishlist wishlist = null;
            try {
                if (wishlistTask.Result.ResponseMessage.IsSuccessStatusCode)
                {
                    wishlist = wishlistTask.Result.ReadAsSync();    
                }
                
            }
            catch (Exception)
            {

            }

            var cards = cardsTask.Result.ReadAsSync();
            //var openOrders = openOrdersTask.Result.ReadAsSync();
            var orderHistory = orderHistoryTask.Result.ReadAsSync();
            var returnHistory = returnHistoryTask.Result.ReadAsSync();
            var credits = storeCreditsTask.Result.ReadAsSync();
            if (wishlist != null) {
                var wishlistItemsTask = _wishlistApiClient.GetWishlistItemsByWishlistName(account.Id, DEFAULT_WISHLIST_NAME, null, null, "UpdateDate asc");
                wishlist.Items = wishlistItemsTask.Result.ReadAsSync().Items;
            }

            var jAccount = account.ToJObject();

            jAccount.Add("orderHistory", orderHistory.ToJObject());
            jAccount.Add("returnHistory", returnHistory.ToJObject());
            jAccount.Add("hasSavedCards", cards.Items.Count > 0);
            jAccount.Add("hasSavedContacts", account.Contacts.Count > 0);
            jAccount.Add("cards", cards.Items.ToJArray());
            if (credits.Items.Count > 0)
            {
                jAccount.Add("credits", credits.Items.ToJArray());
                jAccount.Add("totalCreditAmount", credits.Items.Select(c => c.CurrentBalance).Aggregate((x, y) => x + y));
            }

            if (wishlist != null) {
                var wishlistObj = wishlist.ToJObject();
                wishlistObj.Add("hasItems", wishlist.Items.Count() > 0);
                jAccount.Add("wishlist", wishlistObj);
            }

            return this.Request.CreateResponse(HttpStatusCode.OK,  View("my-account", jAccount));
        }

        //private string BuildOpenOrdersFilter(int accountId)
        //{
        //    var openOrdersSb = new StringBuilder();
        //    openOrdersSb.Append(string.Join(" or ", OpenOrderStates.Select(x => string.Format("Status eq \"{0}\"", x))));
        //    openOrdersSb.Append(" and CustomerAccountId eq \"");
        //    openOrdersSb.Append(accountId);
        //    openOrdersSb.Append("\" and OrderNumber ne null");
        //    return openOrdersSb.ToString();
        //}

        private string BuildOrderHistoryFilter(int accountId)
        {
            return String.Format("CustomerAccountId eq \"{0}\" and OrderNumber ne null", accountId);
        }
        private string BuildReturnHistoryFilter(int accountId)
        {
            return String.Format("CustomerAccountId eq \"{0}\"", accountId);
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