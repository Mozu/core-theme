using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.CommerceRuntime.Contracts.Commerce;
using Mozu.CommerceRuntime.Contracts.Orders;
using Mozu.Core.Actions;
using Mozu.Core.Api.Client;
using Mozu.Core.Exceptions;
using Mozu.Core.Extensions;
using Mozu.Core.Settings;
using Mozu.Customer.Contracts;
using Mozu.Customer.Contracts.Clients;
using Mozu.Location.Contracts.Clients;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.OAF;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Filters;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [SslOnlyActionFilter]
    [ContextInitialization]
    [DataViewModeEnforcement]
    [SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController, Priority = ActionFilterConstants.GlobalPageBeforePriority)]
    [SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageAfterAction, executionType: ActionExtensionExecutionTypes.AfterController, Priority = ActionFilterConstants.GlobalPageAfterPriority)]
    public class QuoteCheckoutController : BaseApiController
    {

        private readonly ICustomerAccountWebApiClient _customerAccountWebApiClient;
        private readonly IOrderWebApiClient _orderWebApiClient;
        private readonly ICreditWebApiClient _creditWebApiClient;
        private readonly ISettings _settings;

        public QuoteCheckoutController(
            ICustomerAccountWebApiClient customerAccountWebApiClient,
            IOrderWebApiClient orderWebApiClient,
            ICreditWebApiClient creditWebApiClient,
            ISettings settings)
        {

            _orderWebApiClient = orderWebApiClient;
            _customerAccountWebApiClient = customerAccountWebApiClient;
            _creditWebApiClient = creditWebApiClient.CloneWithoutUserClaims();
            _settings = settings;
        }

        private static List<string> CompletedOrderStates = new List<string>{
            Order.OrderStatusConst.SUBMITTED,
            Order.OrderStatusConst.ACCEPTED,
            Order.OrderStatusConst.PENDING_REVIEW,
            Order.OrderStatusConst.PROCESSING,
            Order.OrderStatusConst.COMPLETED,
            Order.OrderStatusConst.ERRORED
        };

        [HttpPost]
        [Route("checkout/quoteOrder/{quoteId}")]
        public async Task<IActionResult> Index(string quoteId = null)
        {
            if (quoteId.IsNullOrEmpty())
            {
                throw new VaeValidationConflictException($"Quote ID is required.");
            }

            var order = (await _orderWebApiClient.CreateOrderFromQuote(quoteId)).ReadAsSync();

            if (order == null)
            {
                throw new VaeValidationConflictException($"Can't convert quote to an order for Quote Id {quoteId}.");
            }

            var redirectUrl = CreateRedirectUrl(this.SiteContext.SiteSubdirectory + "/checkout/quoteOrder/" + order.Id);

            return new RedirectResult(redirectUrl.ToString());
        }

        [SbActionExtensionFilter(actionId: ActionFilterConstants.CheckoutBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController)]
        [SbActionExtensionFilter(actionId: ActionFilterConstants.CheckoutAfterAction, executionType: ActionExtensionExecutionTypes.AfterController)]
        [HttpGet]
        [ClientCacheHeaders(ForceRevalidate = true)]
        [Route("checkout/quoteOrder/{orderId}")]
        public async Task<IActionResult> Get(string orderId)
        {
            if (orderId.IsNullOrEmpty())
            {
                throw new VaeValidationConflictException($"Order ID is required.");
            }

            var order = (await _orderWebApiClient.GetOrder(orderId)).ReadAsSync();

            if (order == null)
            {
                throw new VaeValidationConflictException($"Can't find the order with Order ID {orderId}.");
            }
            if (!string.IsNullOrWhiteSpace(order.PriceListCode))
            {
                PageContext.PriceListCode = order.PriceListCode;
            }

            var pc = PageContext;
            pc.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = "checkout"
                }

            };
            pc.PageType = "checkout";
            Customer.Contracts.CustomerAccount account = null;
            CardCollection cards = null;
            Customer.Contracts.Credit.CreditCollection credits = null;
            Customer.Contracts.CustomerPurchaseOrderAccount accountPurchaseOrder = null;


            var shipTask = GetShippableCountries();
            var billTask = GetBillingCountries();
            var shipStateTask = GetUSShippingStates();
            var billStateTask = GetUSBillingStates();
            var shopperOrderAttributesTask = GetShopperOrderAttributes();

            await Task.WhenAll(shipTask, billTask, shipStateTask, billStateTask).ConfigureAwait(false);

            if (CompletedOrderStates.Contains(order.Status)) return new RedirectResult(this.SiteContext.SiteSubdirectory + "/checkout/" + order.Id + "/confirmation");

            // dynamic dOrder = jOrder;
            PageContext.BillingCountries = billTask.Result;
            PageContext.ShippingCountries = shipTask.Result;

            PageContext.BillingStates = billStateTask.Result;
            PageContext.ShippingStates = shipStateTask.Result;
            PageContext.VisaCheckoutButtonUrl = _settings.AppSettings("VisaCheckoutButtonUrl");
            PageContext.VisaCheckoutJavaScriptSdkUrl = _settings.AppSettings("VisaCheckoutJavaScriptSdkUrl");

            PageContext.StorefrontOrderAttributes = shopperOrderAttributesTask.Result;

            if (!PageContext.User.IsAnonymous)
            {
                account = (await _customerAccountWebApiClient.GetAccount(this.PageContext.User.AccountId.GetValueOrDefault(-1), null, this.PageContext.User.UserId)).ReadAsSync();
                cards = (await _customerAccountWebApiClient.GetAccountCards(this.PageContext.User.AccountId.GetValueOrDefault(-1))).ReadAsSync();
                accountPurchaseOrder = (await _customerAccountWebApiClient.GetCustomerPurchaseOrderAccount(this.PageContext.User.AccountId.GetValueOrDefault(-1))).ReadAsSync();
                credits = (await _creditWebApiClient.GetCredits(0, 25, null, String.Format("CustomerId eq \"{0}\" and activationdate le \"{1}\" and expirationdate ge \"{1}\" and currentBalance ge 0.01", this.PageContext.User.AccountId, DateTime.UtcNow.ToString("o")))).ReadAsSync();
            }

            order.IPAddress = PageContext.IpAddress;

            var jOrder = order.ToJObject();

            var isFulfillmentInfoRequired = order.Items.Exists(
                    x => x.FulfillmentMethod == Mozu.CommerceRuntime.Contracts.Commerce.FulfillmentMethodConst.SHIP);

            jOrder.Add("requiresFulfillmentInfo", isFulfillmentInfoRequired);
            jOrder.Add("requiresDigitalFulfillmentContact", order.Items.Exists(x => x.FulfillmentMethod == FulfillmentMethodConst.DIGITAL));

            var isShippingMethodRequired = order.Items.Exists(x => x.FulfillmentMethod == FulfillmentMethodConst.SHIP);
            jOrder.Add("requiresShippingMethod", isShippingMethodRequired);

            if (account != null)
            {
                var accountJson = account.ToJObject();
                accountJson.Add("cards", cards.Items.ToJArray());
                accountJson.Add("credits", credits.Items.ToJArray());
                if (SiteContext.CheckoutSettings.PurchaseOrder != null && SiteContext.CheckoutSettings.PurchaseOrder.IsEnabled && accountPurchaseOrder != null)
                {
                    var customerPurchaseOrder = Mapper.Map<Mozu.SiteBuilder.UX.Models.Customers.CustomerPurchaseOrderAccount>(accountPurchaseOrder);
                    
                    var paymentTermList = customerPurchaseOrder.PaymentTerms.Where(term => term.SiteId == SiteContext.SiteId).ToList();
                    customerPurchaseOrder.PaymentTerms = paymentTermList;
                    var purchaseOrderJObject = customerPurchaseOrder.ToJObject();
                    accountJson.Add("purchaseOrder", purchaseOrderJObject);
                }
                jOrder.Add("customer", accountJson);
            }

            if (SiteContext.CheckoutSettings.VisaCheckout.IsEnabled)
            {
                HttpContext.Response.Headers.Add("X-Frame-Options", "sameorigin");
            }

            return View("checkout", jOrder);
        }

        private Uri CreateRedirectUrl(string path)
        {
            Uri redirectUrl = null;
            if (_settings.CoreSettings.IsSSLValidationEnabled && this.PageContext.HandledByProxy && !this.PageContext.IsSecure)
            {
                var uriBuilder = new UriBuilder(PageContext.Url);
                uriBuilder.Scheme = "https";
                uriBuilder.Port = 443;
                uriBuilder.Path = path;
                redirectUrl = uriBuilder.Uri;
            }
            else
            {
                redirectUrl = new Uri(path, UriKind.Relative);
            }
            return redirectUrl;
        }
    }
}
