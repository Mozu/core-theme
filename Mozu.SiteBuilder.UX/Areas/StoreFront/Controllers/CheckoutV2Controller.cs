using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.CommerceRuntime.Contracts.Commerce;
using Mozu.CommerceRuntime.Contracts.Fulfillment;
using Mozu.CommerceRuntime.Contracts.Products;
using Mozu.CommerceRuntime.Contracts.Checkouts;
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
//using Mozu.SiteBuilder.Mvc.OAF;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Mozu.SiteBuilder.UX.Models.Customers;
using Mozu.ProductRuntime.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [SslOnlyActionFilter]
    [ContextInitialization]
    [NoWarmAuthActionFilter(ReturnUrl = "/cart/checkout")]
    [DataViewModeEnforcement]
    //[SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController, Priority = ActionFilterConstants.GlobalPageBeforePriority)]
    //[SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageAfterAction, executionType: ActionExtensionExecutionTypes.AfterController, Priority = ActionFilterConstants.GlobalPageAfterPriority)]
    public class CheckoutV2Controller : BaseApiController
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

        public CheckoutV2Controller(
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


        //private static List<string> CompletedOrderStates = new List<string>{
        //    Order.OrderStatusConst.SUBMITTED,
        //    Order.OrderStatusConst.ACCEPTED,
        //    Order.OrderStatusConst.PENDING_REVIEW,
        //    Order.OrderStatusConst.PROCESSING,
        //    Order.OrderStatusConst.COMPLETED,
        //    Order.OrderStatusConst.ERRORED
        //};


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
                    redirectUrl = CreateRedirectUrl(this.SiteContext.SiteSubdirectory + "/checkoutv2/" + checkout.Id);
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

        //[SbActionExtensionFilter(actionId: ActionFilterConstants.CheckoutBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController)]
        //[SbActionExtensionFilter(actionId: ActionFilterConstants.CheckoutAfterAction, executionType: ActionExtensionExecutionTypes.AfterController)]
        [HttpGet]
        [ClientCacheHeaders(ForceRevalidate = true)]
        public async Task<IActionResult> Index(string checkoutId)
        {
            var pc = PageContext;
            pc.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = "checkoutv2"
                }

            };
            pc.PageType = "checkoutv2";

            if (string.IsNullOrWhiteSpace(checkoutId)) return new RedirectResult(SiteContext.SiteSubdirectory + "/cart");
            Checkout model = null;
            Customer.Contracts.CustomerAccount account = null;
            CardCollection cards = null;
            Customer.Contracts.Credit.CreditCollection credits = null;
            Customer.Contracts.CustomerPurchaseOrderAccount accountPurchaseOrder = null;


            var shipTask = GetShippableCountries();
            var billTask = GetBillingCountries();
            var shipStateTask = GetUSShippingStates();
            var billStateTask = GetUSBillingStates();
            var shopperOrderAttributesTask = GetShopperOrderAttributes();

            var checkoutTask = _checkoutWebApiClient.GetCheckout(checkoutId);
            await Task.WhenAll(shipTask, billTask, checkoutTask, shipStateTask, billStateTask).ConfigureAwait(false);

            try
            {
                model = checkoutTask.Result.ReadAsAsync().Result;
            }
            catch
            {
            }
            if (model == null) return new RedirectResult(this.SiteContext.SiteSubdirectory + "/cart");
            if (model.SubmittedDate.HasValue) return new RedirectResult(this.SiteContext.SiteSubdirectory + "/checkoutv2/" + model.Id + "/confirmation");

            Func<Product, string> getProductCode = x => !string.IsNullOrEmpty(x.VariationProductCode) ? x.VariationProductCode : x.ProductCode;
            var priceListChanged = await HasPriceListChanged(model.PriceListCode).ConfigureAwait(false);
            List<Product> productsRemoved = null;

            // TODO: Is this the right context (out of like 9) to check for PriceListCode?
            // TODO: Null checks needed between these two values?
            if (priceListChanged)
            {
                var updateResponse = await _checkoutWebApiClient.ChangeCheckoutPriceList(model.Id, null);
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
                        var newProductCodes = newModel.Items.Select(x => x.Product).Select(getProductCode).ToList();
                        var uniqueProducts = model.Items // Previous order items
                            .Select(x => x.Product)      // Get products
                            .GroupBy(getProductCode)     // Group by product code
                            .Select(x => x.First()); // Grab first product from each group
                        productsRemoved = uniqueProducts.Where(x => !newProductCodes.Contains(getProductCode(x))).ToList();
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
                if (!model.CustomerAccountId.HasValue)
                    model = (await _checkoutWebApiClient.UpdateCheckout(model.Id, model)).ReadAsSync();

                account = (await _customerAccountWebApiClient.GetAccount(PageContext.User.AccountId)).ReadAsSync();
                cards = (await _customerAccountWebApiClient.GetAccountCards(PageContext.User.AccountId)).ReadAsSync();
                accountPurchaseOrder = (await _customerAccountWebApiClient.GetCustomerPurchaseOrderAccount(PageContext.User.AccountId)).ReadAsSync();
                credits = (await _creditWebApiClient.GetCredits(0, 25, null, string.Format("CustomerId eq \"{0}\" and activationdate le \"{1}\" and expirationdate ge \"{1}\" and currentBalance ge 0.01", this.PageContext.User.AccountId, DateTime.UtcNow.ToString("o")))).ReadAsSync();
                CustomerContact defaultShippingContact;


                //TO-DO : Do we have the idea of primary shipping contact in Checkout?

                defaultShippingContact = account.Contacts.FirstOrDefault(data => data.Types.Exists(addressType => addressType.Name == ContactTypeConst.SHIPPING && addressType.IsPrimary));


                if (defaultShippingContact == null)
                {
                    var shippingAddresses = account.Contacts.Where(data => data.Types.Exists(addressType => addressType.Name == ContactTypeConst.SHIPPING)).ToList();
                    if (shippingAddresses.Count == 1)
                    {
                        //consider the only existing shipping address as default
                        defaultShippingContact = shippingAddresses.First();
                    }
                }

                // If a primary shipping address exists
                // Add the address as a destination
                // Then set all orderitems to that destination

                //var itemsByDestination = model.Items.GroupBy(item => item.DestinationId);

                bool ExpressCheckoutNeed()
                {
                    //if(itemsByDestination.FirstOrDefault(item => item.Key == null) != null)
                    //{
                    //    if(model.Destinations.Count > 1) {
                    //        if(itemsByDestination.Count() == 2 && itemsByDestination.FirstOrDefault(item => item.Key == primaryDestination.Id) != null)
                    //        {
                    //            return true;
                    //        }
                    //        return false;
                    //    }
                    //    return true;
                    //}
                    //return false;
                    return !model.Destinations.Any();
                }

                if (defaultShippingContact != null && ExpressCheckoutNeed())
                {

                    var primaryDestination = model.Destinations.Find(destination =>
                                                 destination.DestinationContact.Address.Address1 == defaultShippingContact.Address.Address1 &&
                                                 destination.DestinationContact.Address.Address2 == defaultShippingContact.Address.Address2 &&
                                                 destination.DestinationContact.Address.StateOrProvince == defaultShippingContact.Address.StateOrProvince &&
                                                 destination.DestinationContact.Address.CityOrTown == defaultShippingContact.Address.CityOrTown &&
                                                 destination.DestinationContact.Address.PostalOrZipCode == defaultShippingContact.Address.PostalOrZipCode) ??
                                             (await _checkoutWebApiClient.AddDestination(model.Id, new Destination
                                             {
                                                 DestinationContact = defaultShippingContact
                                             })).ReadAsSync();

                    var itemsFordestination = new List<ItemsForDestination>()
                    {
                        new ItemsForDestination() { DestinationId = primaryDestination.Id }
                    };

                    var itemIds = new List<string>();
                    model.Items.ForEach(x => { if (x.DestinationId.IsNullOrEmpty()) { itemIds.Add(x.Id); } });

                    itemsFordestination[0].ItemIds = itemIds;

                    model = (await _checkoutWebApiClient.BulkUpdateItemDestinations(model.Id, itemsFordestination)).ReadAsSync();

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
                    x => x.FulfillmentMethod == Mozu.CommerceRuntime.Contracts.Commerce.FulfillmentMethodConst.SHIP);

            jOrder.Add("requiresFulfillmentInfo", isFulfillmentInfoRequired);
            jOrder.Add("requiresDigitalFulfillmentContact", model.Items.Exists(x => x.FulfillmentMethod == FulfillmentMethodConst.DIGITAL));

            if (account != null)
            {
                var accountJson = account.ToJObject();
                accountJson.Add("cards", cards.Items.ToJArray());
                accountJson.Add("credits", credits.Items.ToJArray());
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

            if (addedPrimaryShippingContactToOrderJustNow)
            {
                List<CheckoutGroupRates> methods = null;
                if (isFulfillmentInfoRequired)
                {
                    var resp = await _checkoutWebApiClient.GetAvailableShippingMethods(checkoutId);
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

                var asm = (methods ?? new List<CheckoutGroupRates>(0)).ToJArray();
                jOrder.Add("shippingMethods", asm);
            }

            if (SiteContext.CheckoutSettings.VisaCheckout.IsEnabled)
            {
                HttpContext.Response.Headers.Add("X-Frame-Options", "sameorigin");
            }

            return View("checkoutv2", jOrder);
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

        //[SbActionExtensionFilter(actionId: ActionFilterConstants.OrderConfirmationBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController)]
        //[SbActionExtensionFilter(actionId: ActionFilterConstants.OrderConfirmationAfterAction, executionType: ActionExtensionExecutionTypes.AfterController)]
        [HttpGet]
        public async Task<IActionResult> Confirmation(string checkoutId)
        {
            var locTask = _locationRuntimeWebApiClient.GetDirectShipLocation();
            var checkoutTask = _checkoutWebApiClient.GetCheckout(checkoutId);
            Checkout checkout = null;
            await Task.WhenAll(locTask, checkoutTask);
            if (checkoutTask.Result.ResponseMessage.IsSuccessStatusCode)
            {
                try
                {
                    checkout = checkoutTask.Result.ReadAsSync();
                }
                catch
                {
                }
            }

            var pc = PageContext;
            pc.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = "confirmationv2"
                }

            };
            pc.PageType = "confirmationv2";


            var shopperOrderAttributesTask = GetShopperOrderAttributes();

            PageContext.StorefrontOrderAttributes = shopperOrderAttributesTask.Result;

            if (checkout == null)
                return new RedirectResult(SiteContext.SiteSubdirectory + "/");

            // if (!CompletedOrderStates.Contains(checkout.Status)) return Redirect(this.SiteContext.SiteSubdirectory + "/checkout/" + checkout.Id);
            Location.Contracts.LocationCollection locations = null;
            var pickUpItems = checkout.Items.FindAll(x => x.FulfillmentMethod == FulfillmentMethodConst.PICKUP);
            if (pickUpItems.NotIsNullOrEmpty())
            {
                var locationsTask = (await _locationRuntimeWebApiClient.GetInStorePickupLocations(0, null, null, string.Join(" or ", pickUpItems.Select(x =>
                    $"Code eq \"{x.FulfillmentLocationCode}\"").Distinct().ToList())));

                locations = locationsTask.ReadAsSync();
            }

            var jOrder = checkout.ToJObject();

            if (locations != null)
            {
                var jFulfillmentLocations = new JArray();

                locations.Items.ForEach(x => jFulfillmentLocations.Add(new JObject(
                    new JProperty("id", x.Code),
                    new JProperty("locationInfo", x.ToJObject()))));

                jOrder.Add("fulfillmentLocations", jFulfillmentLocations);

            }
            jOrder.Add("mailCheckTo",locTask.Result.ReadAsSync().ToJObject());
            //this.ViewData["mailCheckTo"] = locTask.Result.ReadAsSync();
            return View("confirmationv2", jOrder);
        }
    }
}
