using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.CommerceRuntime.Contracts.Commerce;
using Mozu.CommerceRuntime.Contracts.Fulfillment;
using Mozu.CommerceRuntime.Contracts.Orders;
using Mozu.CommerceRuntime.Contracts.Products;
using Mozu.Core.Api.Client;
using Mozu.Core.Settings;
using Mozu.Customer.Contracts;
using Mozu.Customer.Contracts.Clients;
using Mozu.Location.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Filters;
using Mozu.Core.Actions;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.OAF;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.Customer.Contracts.Credit;
using Mozu.SiteBuilder.UX.Hypr.Tags;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [SslOnlyActionFilter]
    [ContextInitialization]
    [NoWarmAuthActionFilter(ReturnUrl = "/cart/checkout")]
    [DataViewModeEnforcement]
    [SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController, Priority = ActionFilterConstants.GlobalPageBeforePriority)]
    [SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageAfterAction, executionType: ActionExtensionExecutionTypes.AfterController, Priority = ActionFilterConstants.GlobalPageAfterPriority)]
    public class CheckoutController : BaseApiController
    {

        private readonly IAuthenticationHelper _authHelper;
        private readonly ICookieProvider _cookieProvider;
        private readonly ICustomerAccountWebApiClient _customerAccountWebApiClient;
        private readonly IOrderWebApiClient _orderWebApiClient;
        private readonly ICartWebApiClient _cartWebApiClient;
        private readonly ISettings _settings;
        private readonly ILocationRuntimeWebApiClient _locationRuntimeWebApiClient;
        private readonly ICreditWebApiClient _creditWebApiClient;
        private readonly Lazy<IPriceListRuntimeWebApiClient> _priceListRuntimeWebApiClient;
        private readonly ICheckoutWebApiClient _checkoutWebApiClient;
        private const string CookieName = "order";

        public CheckoutController(
            IAuthenticationHelper authHelper,
            ICookieProvider cookieProvider,
            ICustomerAccountWebApiClient customerAccountWebApiClient,
            IOrderWebApiClient orderWebApiClient,
            ILocationRuntimeWebApiClient locationRuntimeWebApiClient,
            ICreditWebApiClient creditWebApiClient,
            ICartWebApiClient cartWebApiClient,
            Lazy<IPriceListRuntimeWebApiClient> priceListRuntimeWebApiClient,
            ISettings settings,
            ICheckoutWebApiClient checkoutWebApiClient)
        {

            _authHelper = authHelper;
            _cookieProvider = cookieProvider;
            _priceListRuntimeWebApiClient = priceListRuntimeWebApiClient;
            _orderWebApiClient = orderWebApiClient;
            _cartWebApiClient = cartWebApiClient;
            _settings = settings;
            _customerAccountWebApiClient = customerAccountWebApiClient;
            _creditWebApiClient = creditWebApiClient.CloneWithoutUserClaims();
            _locationRuntimeWebApiClient = locationRuntimeWebApiClient.CloneWithoutUserClaims();
            _checkoutWebApiClient = checkoutWebApiClient;
        }


        private static List<string> CompletedOrderStates = new List<string>{
            Order.OrderStatusConst.SUBMITTED,
            Order.OrderStatusConst.ACCEPTED,
            Order.OrderStatusConst.PENDING_REVIEW,
            Order.OrderStatusConst.PROCESSING,
            Order.OrderStatusConst.COMPLETED,
            Order.OrderStatusConst.ERRORED,
            Order.OrderStatusConst.PENDING_SHIPMENT
        };


        [HttpPost]
        public async Task<IActionResult> Index(string id = null, HttpRequestMessage requestMessage = null)
        {
            if (id == null)
            {
                var cart = (await _cartWebApiClient.GetOrCreateCart()).ReadAsSync();
                id = cart.Id;
            }

            Uri redirectUrl = null;
            try
            {
                var isMultiShip = SiteContext.GeneralSettings.IsMultishipEnabled.GetValueOrDefault();

                if (isMultiShip)
                {
                    var checkout = (await _checkoutWebApiClient.CreateCheckoutFromCart(id)).ReadAsSync();
                    redirectUrl = CreateRedirectUrl(this.SiteContext.SiteSubdirectory + "/checkout_V2/" + checkout.Id);
                }
                else
                {
                    var order = (await _orderWebApiClient.CreateOrderFromCart(id)).ReadAsSync();
                    redirectUrl = CreateRedirectUrl(this.SiteContext.SiteSubdirectory + "/checkout/" + order.Id);
                }
            }
            catch (Exception e)
            {
                UpdateCartWithExceptionMessage(id, e);
                redirectUrl = CreateRedirectUrl(this.SiteContext.SiteSubdirectory + "/cart/");
            }
            return new RedirectResult(redirectUrl.ToString());
        }

        /// <summary>
        /// not async as called from exception block
        /// </summary>
        /// <param name="cartId"></param>
        /// <param name="e"></param>
        private void UpdateCartWithExceptionMessage(string cartId, Exception e)
        {
            var badCart = (_cartWebApiClient.GetCart(cartId)).Result.ReadAsSync();
            badCart.ChangeMessages.Add(new ChangeMessage()
            {
                Message = $"{e.Message}{(e.InnerException != null ? " : " + e.InnerException.Message : string.Empty)}",
                Success = false,
                SubjectType = "Product",
            });
            _cartWebApiClient.UpdateCart(badCart).Result.ReadAsSync();
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

        [SbActionExtensionFilter(actionId: ActionFilterConstants.CheckoutBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController)]
        [SbActionExtensionFilter(actionId: ActionFilterConstants.CheckoutAfterAction, executionType: ActionExtensionExecutionTypes.AfterController)]
        [HttpGet]
        [ClientCacheHeaders(ForceRevalidate = true)]
        public async Task<IActionResult> Index(string orderId)
        {
            var pc = PageContext;
            pc.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = "checkout"
                }

            };
            pc.PageType = "checkout";
            var id = orderId;
            if (string.IsNullOrWhiteSpace(id)) return new RedirectResult(SiteContext.SiteSubdirectory + "/cart");
            Order model = null;
            Customer.Contracts.CustomerAccount account = null;
            CardCollection cards = null;
            List<Credit> credits = null;
            Customer.Contracts.CustomerPurchaseOrderAccount accountPurchaseOrder = null;


            var shipTask = GetShippableCountries();
            var billTask = GetBillingCountries();
            var shipStateTask = GetUSShippingStates();
            var billStateTask = GetUSBillingStates();
            var shopperOrderAttributesTask = GetShopperOrderAttributes();

            var orderTask = _orderWebApiClient.GetOrder(id);
            await Task.WhenAll(shipTask, billTask, orderTask, shipStateTask, billStateTask).ConfigureAwait(false);

            try
            {
                model = orderTask.Result.ReadAsAsync().Result;
            }
            catch
            {
            }
            if (model == null) return new RedirectResult(this.SiteContext.SiteSubdirectory + "/cart");
            if (CompletedOrderStates.Contains(model.Status)) return new RedirectResult(this.SiteContext.SiteSubdirectory + "/checkout/" + model.Id + "/confirmation");

            static string GetProductCode(Product x) => !string.IsNullOrEmpty(x.VariationProductCode) ? x.VariationProductCode : x.ProductCode;
            var priceListChanged = await HasPriceListChanged(model.PriceListCode).ConfigureAwait(false);
            List<Product> productsRemoved = null;

            // TODO: Is this the right context (out of like 9) to check for PriceListCode?
            // TODO: Null checks needed between these two values?
            if (priceListChanged)
            {
                var updateResponse = await _orderWebApiClient.ChangeOrderPriceList(model.Id, string.Empty);
                if (updateResponse.HasException)
                {
                    // Changing pricelist could cause odd things to happen. For example:
                    // - An exclusive pricelist is applied and all items are removed, resulting in an empty order.
                    // - An item now has volume pricing applied but an item doesn't meet minimum quantity.
                    // Dump them back to the cart to fix the problem. The error message should show on the cart page.
                    return new RedirectResult(this.SiteContext.SiteSubdirectory + "/cart");
                }
                else
                {
                    var newModel = updateResponse.ReadAsSync();

                    // See if any items were dropped due to changing to an exclusive price list.
                    if (model.Items.Count != newModel.Items.Count)
                    {
                        var newProductCodes = newModel.Items.Select(x => x.Product).Select((Func<Product, string>) GetProductCode).ToList();
                        var uniqueProducts = model.Items // Previous order items
                            .Select(x => x.Product)      // Get products
                            .GroupBy((Func<Product, string>) GetProductCode)     // Group by product code
                            .Select(x => x.First()); // Grab first product from each group
                        productsRemoved = uniqueProducts.Where(x => !newProductCodes.Contains(GetProductCode(x))).ToList();
                    }
                    model = newModel;
                }
            }

            var addedPrimaryShippingContactToOrderJustNow = false;

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
                account = (await _customerAccountWebApiClient.GetAccount(this.PageContext.User.AccountId, null, this.PageContext.User.UserId)).ReadAsSync();
                cards = (await _customerAccountWebApiClient.GetAccountCards(this.PageContext.User.AccountId)).ReadAsSync();
                accountPurchaseOrder = (await _customerAccountWebApiClient.GetCustomerPurchaseOrderAccount(this.PageContext.User.AccountId)).ReadAsSync();
                // In GetCredits() api call, `currentBalance` filter have performance issues. So, we are filtering the credits in memory.
                var creditResponse = (await _creditWebApiClient.GetCredits(0, 100, null, String.Format("CustomerId eq \"{0}\" and activationdate le \"{1}\" and expirationdate ge \"{1}\"", this.PageContext.User.AccountId, DateTime.UtcNow.ToString("o")))).ReadAsSync();
                credits = (creditResponse?.Items.SafeAny() ?? false) ?
                    creditResponse.Items.Where(x => x.CurrentBalance >= 0.01m).ToList() :
                    new List<Credit>();

                CustomerContact primaryShippingContact = null;
                //CustomerContact primaryBillingContact = null;

                try
                {
                    primaryShippingContact = account.Contacts.Find(x => x.Types.Exists(y => y.Name == ContactTypeConst.SHIPPING && y.IsPrimary));
                    //primaryBillingContact = account.Contacts.Find(x => x.Types.Exists(y => y.Name == ContactTypeConst.BILLING && y.IsPrimary));
                }
                catch (NullReferenceException)
                {
                }

                if (primaryShippingContact != null)
                {
                    if (model.FulfillmentInfo == null)
                    {
                        model.FulfillmentInfo = new FulfillmentInfo()
                        {
                            FulfillmentContact = primaryShippingContact
                        };
                        addedPrimaryShippingContactToOrderJustNow = true;
                    }
                    if (model.FulfillmentInfo.FulfillmentContact == null)
                    {
                        model.FulfillmentInfo.FulfillmentContact = primaryShippingContact;
                    }
                    addedPrimaryShippingContactToOrderJustNow = true;
                }
            }


            model.IPAddress = PageContext.IpAddress;

            //var jSerializer = new JsonSerializer() { ContractResolver = new CamelCasePropertyNamesContractResolver() };
            var jOrder = model.ToJObject();

            if (priceListChanged)
            {
                // TODO: These "magic strings" should be constants somewhere. They're currently used in the hypr message-bar template.
                var message = productsRemoved != null
                    ? "Please note, items not available for purchase have been removed."
                    : "You are now eligible for special pricing.";
                var messageType = productsRemoved != null ? "exclusivePricelist" : "newPricelist";
                jOrder.Add("messages", new JArray(new { message, messageType, productsRemoved }.ToJObject()));
            }

            var isFulfillmentInfoRequired = model.Items.Exists(
                    x => x.FulfillmentMethod == FulfillmentMethodConst.SHIP || x.FulfillmentMethod == FulfillmentMethodConst.DELIVERY);

            jOrder.Add("requiresFulfillmentInfo", isFulfillmentInfoRequired);
            jOrder.Add("requiresDigitalFulfillmentContact", model.Items.Exists(x => x.FulfillmentMethod == FulfillmentMethodConst.DIGITAL));

            var isShippingMethodRequired = model.Items.Exists(x => x.FulfillmentMethod == FulfillmentMethodConst.SHIP);
            jOrder.Add("requiresShippingMethod", isShippingMethodRequired);

            if (account != null)
            {
                var accountJson = account.ToJObject();
                accountJson.Add("cards", cards.Items.ToJArray());
                accountJson.Add("credits", credits.ToJArray());
                if (SiteContext.CheckoutSettings.PurchaseOrder != null && SiteContext.CheckoutSettings.PurchaseOrder.IsEnabled && accountPurchaseOrder != null)
                {
                    var customerPurchaseOrder = Mapper.Map<Mozu.SiteBuilder.UX.Models.Customers.CustomerPurchaseOrderAccount>(accountPurchaseOrder);
                    //var paymentTermOptions = this.SiteContext.CheckoutSettings.PurchaseOrder.PaymentTerms;
                    // helper object that inherits from contract, filters for specific site, then create new payment array and apply it to accountPurchaseOrder before doing .toJObject()
                    var paymentTermList = customerPurchaseOrder.PaymentTerms.Where(term => term.SiteId == SiteContext.SiteId).ToList();
                    customerPurchaseOrder.PaymentTerms = paymentTermList;
                    var purchaseOrderJObject = customerPurchaseOrder.ToJObject();
                    accountJson.Add("purchaseOrder", purchaseOrderJObject);
                }
                jOrder.Add("customer", accountJson);
            }

            if (model.FulfillmentInfo?.FulfillmentContact?.Address != null)
            {
                if (addedPrimaryShippingContactToOrderJustNow)
                {
                    try
                    {
                        (await _orderWebApiClient.UpdateOrder(id, model)).ReadAsSync();
                    }
                    catch { } // it's really okay if this doesn't work

                }

                List<ShippingRate> methods = null;
                if (isFulfillmentInfoRequired)
                {
                    var resp = await _orderWebApiClient.GetAvailableShipmentMethods(id);
                    if (resp.ResponseMessage.IsSuccessStatusCode)
                    {
                        methods = resp.ReadAsSync();
                    }
                    else
                    {
                        var message = resp.ReadException().Message;
                        var messageType = "error";
                        jOrder.Add("messages", new JArray(new { message, messageType }.ToJObject()));
                    }
                }

                var asm = (methods ?? new List<ShippingRate>(0)).ToJArray();
                var si = (JObject)jOrder["fulfillmentInfo"];
                si.Add("availableShippingMethods", asm);
            }

            if (SiteContext.CheckoutSettings.VisaCheckout.IsEnabled)
            {
                HttpContext.Response.Headers.Add("X-Frame-Options", "sameorigin");
            }

            return View("checkout", jOrder);
        }


        async Task<bool> HasPriceListChanged(string priceListCode)
        {
            if (SbApiContext.PriceListCode.EqualsIgnoreCase(priceListCode))
            {
                return false;
            }
            //filter out condition when default pricelist is explictly set.
            if (!string.IsNullOrEmpty(this.SbApiContext.PriceListCode) &&
                !string.IsNullOrEmpty(priceListCode)) return true;

            var nonEmptyPriceListCode = string.IsNullOrEmpty(SbApiContext.PriceListCode) ? priceListCode : SbApiContext.PriceListCode;

            var defaultPriceListRes = await _priceListRuntimeWebApiClient.Value.CloneWithoutUserClaims().GetDefaultPriceList().ConfigureAwait(false);
            if (!defaultPriceListRes.HasException)
            {
                return !string.Equals(defaultPriceListRes.ReadAsSync()?.PriceListCode, nonEmptyPriceListCode);
            }
            return true;
        }

        public class CheckoutPciSettings
        {
            public string apiBase { get; set; }
        }

        [SbActionExtensionFilter(actionId: ActionFilterConstants.OrderConfirmationBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController)]
        [SbActionExtensionFilter(actionId: ActionFilterConstants.OrderConfirmationAfterAction, executionType: ActionExtensionExecutionTypes.AfterController)]
        [HttpGet]
        public async Task<IActionResult> Confirmation(string orderId)
        {
            var locTask = _locationRuntimeWebApiClient.GetDirectShipLocation();
            var orderTask = _orderWebApiClient.GetOrder(orderId);
            Order order = null;
            await Task.WhenAll(locTask, orderTask);
            if (orderTask.Result.ResponseMessage.IsSuccessStatusCode)
            {
                try
                {
                    order = orderTask.Result.ReadAsSync();
                }
                catch
                {
                }
            }

            var pc = this.PageContext;
            pc.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = "confirmation"
                }

            };
            pc.PageType = "confirmation";


            var shopperOrderAttributesTask = GetShopperOrderAttributes();

            PageContext.StorefrontOrderAttributes = shopperOrderAttributesTask.Result;

            if (order == null)
                return new RedirectResult(this.SiteContext.SiteSubdirectory + "/");

            if (!CompletedOrderStates.Contains(order.Status)) return new RedirectResult(this.SiteContext.SiteSubdirectory + "/checkout/" + order.Id);
            Mozu.Location.Contracts.LocationCollection locations = null;

            if (order.Items.Exists(x => x.FulfillmentMethod == FulfillmentMethodConst.PICKUP))
            {
                var locationsTask = (await _locationRuntimeWebApiClient.GetInStorePickupLocations(0, null, null, string.Join(" or ", order.Items.Select(x => $"Code eq \"{x.FulfillmentLocationCode}\"").Distinct().ToList())));

                locations = locationsTask.ReadAsSync();
            }

            var jOrder = order.ToJObject();

            jOrder.Add("hasDirectShip", order.Items.Exists(x => x.FulfillmentMethod == FulfillmentMethodConst.SHIP));
            jOrder.Add("hasDelivery", order.Items.Exists(x => x.FulfillmentMethod == FulfillmentMethodConst.DELIVERY));

            if (locations != null)
            {
                var jItems = (JArray)jOrder["items"];

                for (var i = 0; i < order.Items.Count; i++)
                {
                    if (order.Items[i].FulfillmentMethod != FulfillmentMethodConst.SHIP) continue;

                    var location = locations.Items.Find(x => x.Code == order.Items[i].FulfillmentLocationCode);
                    if (location != null)
                    {
                        ((JObject)jItems[i]).Add("fulfillmentLocationName", location.Name);
                    }
                }
            }
            ViewData["mailCheckTo"] = locTask.Result.ReadAsSync();
            jOrder.Add("mailCheckTo", locTask.Result.ReadAsSync().ToJObject());
            return View("confirmation", jOrder);
        }
        //Internation Checkout route is being used by the borderfree application
        [HttpGet]
        public IActionResult InternationalCheckout()
        {
            PageContext.CmsContext = new CmsPageContext()
            {
                Initialized = false,
                Template = new DocumentRequest()
                {
                    ListFQN = "pageTemplateContent@mozu",
                    Path = "international-checkout"
                }
            };
            PageContext.PageType = string.IsNullOrEmpty(PageContext.PageType) ? "web_page" : PageContext.PageType;

            return View("international-checkout");
        }
    }
}
