using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
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
using Mozu.Core.Actions;
using Mozu.SiteBuilder.Mvc.OAF;

using Kibo.Fulfillment.Contracts.Api;

using DCs = Mozu.CommerceRuntime.Contracts;
using Newtonsoft.Json.Linq;
using Mozu.Core.Extensions;
using RabbitMQ.Client.Impl;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ContextInitialization]
    [HotOnlyAuthActionFilter]
    [SslOnlyActionFilter]
    [DataViewModeEnforcement]
    [SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController, Priority = ActionFilterConstants.GlobalPageBeforePriority)]
    [SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageAfterAction, executionType: ActionExtensionExecutionTypes.AfterController, Priority = ActionFilterConstants.GlobalPageAfterPriority)]
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
        private readonly IShipmentControllerApiClient _shipmentControllerApiClient;

        public MyAccountController(ICustomerRepository customerRepository, ICustomerAccountWebApiClient customerAccountWebApiClient, IAccountContactRepository accountContactRepository,  IOrderWebApiClient orderWebApiClient, IWishlistWebApiClient wishlistWebApiClient, ICreditWebApiClient creditWebApiClient, IReturnWebApiClient returnApiClient, IAuthenticationHelper authenticationHelper, ISiteBuilderApiContext apiContext, IShipmentControllerApiClient shipmentControllerApiClient)
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
            _shipmentControllerApiClient = shipmentControllerApiClient;
        }
        

        //private static List<string> OpenOrderStates = new List<string>{
        //    Order.OrderStatusConst.SUBMITTED,
        //    Order.OrderStatusConst.ACCEPTED,
        //    Order.OrderStatusConst.PENDING_REVIEW,
        //    Order.OrderStatusConst.PROCESSING
        //};


        //todo:hyper  remiplement auth att.
        // [SiteBuilderAuthorize()]
        [SbActionExtensionFilter(actionId: ActionFilterConstants.MyAccountBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController)]
        [SbActionExtensionFilter(actionId: ActionFilterConstants.MyAccountAfterAction, executionType: ActionExtensionExecutionTypes.AfterController)]
        [HttpGet]
        public async Task<IActionResult> Index()
        {

            //var account = (await _customerAccountWebApiClient.GetAccounts(filter : "UserId eq \"" + CurrentUser.UserId + "\"")).ReadAsSync().Items.FirstOrDefault();
            // If there isn't an active user or account id for the user, then we are going to redirect to the user/login page.
            if (PageContext.User?.AccountId == null)
            {
                var uri = new Uri(SiteContext.SiteSubdirectory+ "/user/login", UriKind.Relative);
                return new RedirectResult(uri.ToString());
            }

            var account = (await _customerAccountWebApiClient.GetAccount(PageContext.User.AccountId, null, PageContext.User.UserId)).ReadAsSync();

            if (account == null)
            {
                return NotFound();
            }

            var pageType = "my_account";
            var pagePath = "my-account";

            if (account.AccountType == "B2B")
            {
               pageType = "b2b_account";
               pagePath = "b2b-account";
            }
            

            var pc = this.PageContext;
            pc.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = pagePath,
                    DocumentTypeFQN = "pageTemplateContent@mozu"
                }

            };
            pc.PageType = pageType;



            var cardsTask = _customerAccountWebApiClient.GetAccountCards(account.Id);
            var orderHistoryTask = _orderWebApiClient.GetOrders(0, 5, null, "Status ne Created and Status ne Validated and Status ne Pending and Status ne Abandoned and Status ne Errored");
            var returnHistoryTask = _returnApiClient.GetReturns(0, 5, null);
            var reasonList = _returnApiClient.GetReasons();
            var storeCreditsTask = _creditApiClient.GetCredits(0, 25, "activationDate DESC", string.Format("CustomerId eq \"{0}\" and activationdate le \"{1}\" and expirationdate ge \"{1}\" and currentBalance ge 0.01", account.Id, DateTime.UtcNow.ToString("o")));
            var wishlistTask = _wishlistApiClient.GetWishlistByName(account.Id, DEFAULT_WISHLIST_NAME);
            var purchaseOrderAccount =
                (await _customerAccountWebApiClient.GetCustomerPurchaseOrderAccount(this.PageContext.User.AccountId))
                    .ReadAsSync();

            var shipTask = GetShippableCountries();
            var billTask = GetBillingCountries();

            var shipStateTask = GetUSShippingStates();
            var billStateTask = GetUSBillingStates();

            await Task.WhenAll(cardsTask, orderHistoryTask, returnHistoryTask, reasonList, storeCreditsTask, wishlistTask, shipStateTask, billStateTask);

            PageContext.ShippingCountries = shipTask.Result;
            PageContext.BillingCountries  = billTask.Result;

            PageContext.BillingStates = billStateTask.Result;
            PageContext.ShippingStates = shipStateTask.Result;

            PageContext.ReasonCollection = reasonList.Result.ReadAsSync().ToJObject();

            PageContext.StorefrontOrderAttributes = GetShopperOrderAttributes().Result;
            
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

            orderHistory.Items.ForEach(order => order.Shipments = null);
            var orderHistoryObject = orderHistory.ToJObject();

            orderHistoryObject.Value<JArray>("items").Each(order =>
            {
                var orderShipments = fetchOrderShipments(order.Value<String>("id")).Result;
                order["shipments"] = orderShipments.ToJObject();
            });

            var jAccount = account.ToJObject();

            jAccount.Add("orderHistory", orderHistoryObject);
            jAccount.Add("returnHistory", returnHistory.ToJObject());
            jAccount.Add("hasSavedCards", cards.Items.Count > 0);
            jAccount.Add("hasSavedContacts", account.Contacts.Count > 0);
            jAccount.Add("cards", cards.Items.ToJArray());

            if (SiteContext.CheckoutSettings.PurchaseOrder != null && SiteContext.CheckoutSettings.PurchaseOrder.IsEnabled && purchaseOrderAccount != null)
            {
                var customerPurchaseOrder = Mapper.Map<Mozu.SiteBuilder.UX.Models.Customers.CustomerPurchaseOrderAccount>(purchaseOrderAccount);
                //var paymentTermOptions = this.SiteContext.CheckoutSettings.PurchaseOrder.PaymentTerms;
                // helper object that inherits from contract, filters for specific site, then create new payment array and apply it to accountPurchaseOrder before doing .toJObject()
                var paymentTermList = customerPurchaseOrder.PaymentTerms.Where(term => term.SiteId == SiteContext.SiteId).ToList();
                customerPurchaseOrder.PaymentTerms = paymentTermList;
                var purchaseOrderJObject = customerPurchaseOrder.ToJObject();

                jAccount.Add("purchaseOrder", purchaseOrderJObject);
            }

            if (credits.Items.Count > 0)
            {
                jAccount.Add("credits", credits.Items.ToJArray());
                jAccount.Add("totalCreditAmount", credits.Items.Select(c => c.CurrentBalance).Aggregate((x, y) => x + y));
            }

            if (wishlist == null) return Ok(View(pagePath, jAccount));

            var wishlistObj = wishlist.ToJObject();
            wishlistObj.Add("hasItems", wishlist.Items.Any());
            jAccount.Add("wishlist", wishlistObj);

            return Ok(View(pagePath, jAccount));
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

        async Task<Kibo.Fulfillment.Contracts.Model.PagedModelOfEntityModelOfShipment> fetchOrderShipments(string orderId)
        {
            try
            {
                var SHIPMENT_FILTER = "orderId==" + orderId + ";shipmentStatus!=REASSIGNED;shipmentType!=Transfer";

                var fulfillmentClient = _shipmentControllerApiClient.CloneWithoutUserClaims();
                var response = (await fulfillmentClient.GetShipmentsUsingGET(SHIPMENT_FILTER)).ReadAsSync();

                return response;
            }
            catch (Exception)
            {
                return new Kibo.Fulfillment.Contracts.Model.PagedModelOfEntityModelOfShipment();
            }
        }

        private string BuildOrderHistoryFilter(int accountId)
        {
            return $"CustomerAccountId eq \"{accountId}\" and OrderNumber ne null";
        }
        private string BuildReturnHistoryFilter(int accountId)
        {
            return $"CustomerAccountId eq \"{accountId}\"";
        }

        private string BuildWishlistFilter(int accountId)
        {
            return $"CustomerAccountId eq \"{accountId}\" and Name eq \"{DEFAULT_WISHLIST_NAME}\"";
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
        public async Task<Mozu.SiteBuilder.UX.Models.Customers.CustomerAccountContact> UpdateCustomerContact(CustomerAccountContact incomingContact)
        {
            var account = await _customerRepository.GetByUserId(CurrentUser.UserId);

            return  await  _accountContactRepository.Update(incomingContact, account.Id);

          
        }

        [HttpPost]
        public async Task<Mozu.SiteBuilder.UX.Models.Customers.CustomerAccountContact> AddCustomerContact(CustomerAccountContact incomingContact)
        {
            var account = await _customerRepository.GetByUserId(CurrentUser.UserId);

            return  await _accountContactRepository.Create(incomingContact, account.Id);

          
        }

        [HttpPost]
        public async Task<bool> DeleteCustomerContact(CustomerAccountContact incomingContact)
        {
            var account = await _customerRepository.GetByUserId(CurrentUser.UserId);

            _accountContactRepository.Delete(incomingContact, account.Id);

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

        protected LightweightUserClaims CurrentUser => _apiContext.UserClaims;
    }
}