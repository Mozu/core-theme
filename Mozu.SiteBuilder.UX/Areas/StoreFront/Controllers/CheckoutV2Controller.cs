using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Sockets;
using System.Threading.Tasks;
using MongoDB.Bson;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.CommerceRuntime.Contracts.Commerce;
using Mozu.CommerceRuntime.Contracts.Fulfillment;
using Mozu.CommerceRuntime.Contracts.Orders;
using Mozu.CommerceRuntime.Contracts.Products;
using Mozu.CommerceRuntime.Contracts.Checkouts;
using Mozu.Core.Api.Client;
using Mozu.Core.Settings;
using Mozu.Customer.Contracts;
using Mozu.Customer.Contracts.Clients;
using Mozu.Location.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Filters;
using Mozu.Core.Actions;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.OAF;
using AutoMapper;
using Mozu.SiteBuilder.UX.Models.Customers;


namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [SslOnlyActionFilter]
    [ContextInitialization]
    [NoWarmAuthActionFilter(ReturnUrl = "/cart/checkout")]
    [DataViewModeEnforcement]
    [SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController, Priority = ActionFilterConstants.GlobalPageBeforePriority)]
    [SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageAfterAction, executionType: ActionExtensionExecutionTypes.AfterController, Priority = ActionFilterConstants.GlobalPageAfterPriority)]
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
        private readonly ICheckoutWebApiClient _checkoutWebApiClient;



        //private static string _merchantId;
        private const string CookieName = "order";

        public CheckoutV2Controller(IAuthenticationHelper authHelper, ICookieProvider cookieProvider,
            ICustomerAccountWebApiClient customerAccountWebApiClient, IOrderWebApiClient orderWebApiClient,
            Mozu.Location.Contracts.Clients.ILocationRuntimeWebApiClient locationRuntimeWebApiClient,
            ICreditWebApiClient creditWebApiClient, Mozu.CommerceRuntime.Contracts.Clients.ICartWebApiClient
            cartWebApiClient, ISettings settings, ICheckoutWebApiClient checkoutWebApiClient)
        {

            _authHelper = authHelper;
            _cookieProvider = cookieProvider;

            _orderWebApiClient = orderWebApiClient;
            _cartWebApiClient = cartWebApiClient;
            _settings = settings;
            _customerAccountWebApiClient = customerAccountWebApiClient;
            _creditWebApiClient = creditWebApiClient.CloneWithoutUserClaims();
            _locationRuntimeWebApiClient = locationRuntimeWebApiClient.CloneWithoutUserClaims();
            _checkoutWebApiClient = checkoutWebApiClient;
        }



        /*public string MerchantId
        {
            get { return _merchantId ?? (_merchantId = _orderService.GetMerchantId()); }
        }*/


        //private static List<string> CompletedOrderStates = new List<string>{
        //    Order.OrderStatusConst.SUBMITTED,
        //    Order.OrderStatusConst.ACCEPTED,
        //    Order.OrderStatusConst.PENDING_REVIEW,
        //    Order.OrderStatusConst.PROCESSING,
        //    Order.OrderStatusConst.COMPLETED,
        //    Order.OrderStatusConst.ERRORED
        //};


        [System.Web.Http.HttpPost]
        public async Task<HttpResponseMessage> Index(string id = null, HttpRequestMessage requestMessage = null)
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
                else {
                    var order = (await _orderWebApiClient.CreateOrderFromCart(id)).ReadAsSync();
                    redirectUrl = CreateRedirectUrl(this.SiteContext.SiteSubdirectory + "/checkout/" + order.Id);
                }
            }
            catch (Exception e)
            {
                UpdateCartWithExceptionMessage(id, e);
                redirectUrl = CreateRedirectUrl(this.SiteContext.SiteSubdirectory + "/cart/");
            }
            var req = this.Request.CreateResponse(HttpStatusCode.Redirect);
            req.Headers.Location = redirectUrl;
            return req;
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
                Message = string.Format("{0}{1}", e.Message, (e.InnerException != null)
                    ? " : " + e.InnerException.Message
                    : string.Empty),
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
        [System.Web.Http.HttpGet]
        [ClientCacheHeaders(ForceRevalidate = true)]
        public async Task<ActionResult> Index(string checkoutId)
        {
            var pc = this.PageContext;
            pc.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = "checkoutv2"
                }

            };
            pc.PageType = "checkoutv2";

            if (string.IsNullOrWhiteSpace(checkoutId)) return Redirect(this.SiteContext.SiteSubdirectory + "/cart");
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
            if (model == null) return Redirect(this.SiteContext.SiteSubdirectory + "/cart");
            if (model.SubmittedDate.HasValue) return Redirect(this.SiteContext.SiteSubdirectory + "/checkoutv2/" + model.Id + "/confirmation");

            Func<Product, string> getProductCode = x => !string.IsNullOrEmpty(x.VariationProductCode) ? x.VariationProductCode : x.ProductCode;


            bool addedPrimaryShippingContactToOrderJustNow = false;

            // dynamic dOrder = jOrder;
            this.PageContext.BillingCountries = billTask.Result;
            this.PageContext.ShippingCountries = shipTask.Result;

            this.PageContext.BillingStates = billStateTask.Result;
            this.PageContext.ShippingStates = shipStateTask.Result;
            this.PageContext.VisaCheckoutButtonUrl = _settings.AppSettings("VisaCheckoutButtonUrl");
            this.PageContext.VisaCheckoutJavaScriptSdkUrl = _settings.AppSettings("VisaCheckoutJavaScriptSdkUrl");

            this.PageContext.StorefrontOrderAttributes = shopperOrderAttributesTask.Result;

            if (!this.PageContext.User.IsAnonymous)
            {
                account = (await _customerAccountWebApiClient.GetAccount(this.PageContext.User.AccountId)).ReadAsSync();
                cards = (await _customerAccountWebApiClient.GetAccountCards(this.PageContext.User.AccountId)).ReadAsSync();
                accountPurchaseOrder = (await _customerAccountWebApiClient.GetCustomerPurchaseOrderAccount(this.PageContext.User.AccountId)).ReadAsSync();
                credits = (await _creditWebApiClient.GetCredits(0, 25, null, String.Format("CustomerId eq \"{0}\" and activationdate le \"{1}\" and expirationdate ge \"{1}\" and currentBalance ge 0.01", this.PageContext.User.AccountId, DateTime.UtcNow.ToString("o")))).ReadAsSync();
                CustomerContact defaultShippingContact = null;


                //TO-DO : Do we have the idea of primary shipping contact in Checkout?
                try
                {
                    defaultShippingContact = account.Contacts.First(data => data.Types.Exists(addressType => addressType.Name == ContactTypeConst.SHIPPING && addressType.IsPrimary));
                }
                catch (NullReferenceException)
                {
                }

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

                if (defaultShippingContact != null)
                {

                    var primaryDestination = model.Destinations.Find(destination => 
                    destination.DestinationContact.Address.Address1 == defaultShippingContact.Address.Address1 &&
                    destination.DestinationContact.Address.Address2 == defaultShippingContact.Address.Address2 &&
                    destination.DestinationContact.Address.StateOrProvince == defaultShippingContact.Address.StateOrProvince &&
                    destination.DestinationContact.Address.CityOrTown == defaultShippingContact.Address.CityOrTown &&
                    destination.DestinationContact.Address.PostalOrZipCode == defaultShippingContact.Address.PostalOrZipCode);

                    if (primaryDestination == null)
                    {
                        primaryDestination = (await _checkoutWebApiClient.AddDestination(model.Id, new Destination
                        {
                            DestinationContact = defaultShippingContact
                        })).ReadAsSync();
                    }

                    List<ItemsForDestination> itemsFordestination = new List<ItemsForDestination>()
                    {
                        new ItemsForDestination() { DestinationId = primaryDestination.Id }
                    };

                    var itemIds = new List<string>();
                    model.Items.ForEach(x => { if (x.DestinationId.IsNullOrEmpty()) { itemIds.Add(x.Id);  } });

                    itemsFordestination[0].ItemIds = itemIds;

                    model = (await _checkoutWebApiClient.BulkUpdateItemDestinations(model.Id, itemsFordestination)).ReadAsSync();
                    
                    addedPrimaryShippingContactToOrderJustNow = true;
                }
            }


            model.IPAddress = PageContext.IpAddress;

            var jSerializer = new JsonSerializer() { ContractResolver = new CamelCasePropertyNamesContractResolver() };
            var jOrder = model.ToJObject();


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
                    var paymentTermOptions = this.SiteContext.CheckoutSettings.PurchaseOrder.PaymentTerms;
                    // helper object that inherits from contract, filters for specific site, then create new payment array and apply it to accountPurchaseOrder before doing .toJObject()
                    var paymentTermList = new List<PurchaseOrderPaymentTerm>();
                    foreach (var term in customerPurchaseOrder.PaymentTerms)
                    {
                        if (term.SiteId == SiteContext.SiteId)
                        {
                            paymentTermList.Add(term);
                        }
                    }
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
                    var resp = await _checkoutWebApiClient.GetAvailableShipmentMethods(checkoutId);
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

            if (this.SiteContext.CheckoutSettings.VisaCheckout.IsEnabled)
            {
                this.HttpContext.Response.AddHeader("X-Frame-Options", "sameorigin");
            }

            return View("checkoutv2", jOrder);
        }


        public class CheckoutPciSettings
        {
            public string apiBase { get; set; }
        }

        [SbActionExtensionFilter(actionId: ActionFilterConstants.OrderConfirmationBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController)]
        [SbActionExtensionFilter(actionId: ActionFilterConstants.OrderConfirmationAfterAction, executionType: ActionExtensionExecutionTypes.AfterController)]
        [System.Web.Http.HttpGet]
        public async Task<ActionResult> Confirmation(string checkoutId)
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

            var pc = this.PageContext;
            pc.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = "confirmationv2"
                }

            };
            pc.PageType = "confirmationv2";


            var shopperOrderAttributesTask = GetShopperOrderAttributes();

            this.PageContext.StorefrontOrderAttributes = shopperOrderAttributesTask.Result;

            if (checkout == null)
                return Redirect(this.SiteContext.SiteSubdirectory + "/");

           // if (!CompletedOrderStates.Contains(checkout.Status)) return Redirect(this.SiteContext.SiteSubdirectory + "/checkout/" + checkout.Id);
            Mozu.Location.Contracts.LocationCollection locations = null;

            if (checkout.Items.Exists(x => x.FulfillmentMethod == FulfillmentMethodConst.PICKUP))
            {
                var locationsTask = (await _locationRuntimeWebApiClient.GetInStorePickupLocations(0, null, null, string.Join(" or ", checkout.Items.Select(x => string.Format("Code eq \"{0}\"", x.FulfillmentLocationCode)).Distinct().ToList())));

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

            this.ViewData["mailCheckTo"] = locTask.Result.ReadAsSync();
            return View("confirmationv2", jOrder);
        }
    }
}
