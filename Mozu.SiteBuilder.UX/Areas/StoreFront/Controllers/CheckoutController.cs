using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Sockets;
using System.Threading.Tasks;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.CommerceRuntime.Contracts.Commerce;
using Mozu.CommerceRuntime.Contracts.Fulfillment;
using Mozu.CommerceRuntime.Contracts.Orders;
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
using Mozu.SiteBuilder.Mvc.OAF;

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




        //private static string _merchantId;
        private const string CookieName = "order";

        public CheckoutController(IAuthenticationHelper authHelper, ICookieProvider cookieProvider, ICustomerAccountWebApiClient customerAccountWebApiClient, IOrderWebApiClient orderWebApiClient, Mozu.Location.Contracts.Clients.ILocationRuntimeWebApiClient locationRuntimeWebApiClient, ICreditWebApiClient creditWebApiClient, Mozu.CommerceRuntime.Contracts.Clients.ICartWebApiClient cartWebApiClient, ISettings settings)
        {

            _authHelper = authHelper;
            _cookieProvider = cookieProvider;

            _orderWebApiClient = orderWebApiClient;
            _cartWebApiClient = cartWebApiClient;
            _settings = settings;
            _customerAccountWebApiClient = customerAccountWebApiClient;
            _creditWebApiClient = creditWebApiClient.CloneWithoutUserClaims();
            _locationRuntimeWebApiClient = locationRuntimeWebApiClient.CloneWithoutUserClaims();


        }



        /*public string MerchantId
        {
            get { return _merchantId ?? (_merchantId = _orderService.GetMerchantId()); }
        }*/


        private static List<string> CompletedOrderStates = new List<string>{
            Order.OrderStatusConst.SUBMITTED,
            Order.OrderStatusConst.ACCEPTED,
            Order.OrderStatusConst.PENDING_REVIEW,
            Order.OrderStatusConst.PROCESSING,
            Order.OrderStatusConst.COMPLETED,
            Order.OrderStatusConst.ERRORED
        };


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
                var order = (await _orderWebApiClient.CreateOrderFromCart(id)).ReadAsSync();
                redirectUrl = CreateRedirectUrl("/checkout/" + order.Id);
            }
            catch (Exception e)
            {
                UpdateCartWithExceptionMessage(id, e);
                redirectUrl = CreateRedirectUrl("/cart/");
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
        public async Task<ActionResult> Index(string orderId)
        {
            var pc = this.PageContext;
            pc.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = "checkout"
                }

            };
            pc.PageType = "checkout";
            //var id = OrderId;
            var id = orderId;
            if (string.IsNullOrWhiteSpace(id)) return Redirect("/cart");
            Order model = null;
            Customer.Contracts.CustomerAccount account = null;
            CardCollection cards = null;
            Customer.Contracts.Credit.CreditCollection credits = null;


            var shipTask = GetShippableCountries();
            var billTask = GetBillingCountries();
            var shipStateTask = GetUSShippingStates();
            var billStateTask = GetUSBillingStates();

            var orderTask = _orderWebApiClient.GetOrder(id);
            await Task.WhenAll(shipTask, billTask, orderTask, shipStateTask, billStateTask);

            try
            {
                model = orderTask.Result.ReadAsAsync().Result;

            }
            catch
            {
            }
            if (model == null) return Redirect("/cart");
            if (CompletedOrderStates.Contains(model.Status)) return Redirect("/checkout/" + model.Id + "/confirmation");
            bool addedPrimaryShippingContactToOrderJustNow = false;

            // dynamic dOrder = jOrder;
            this.PageContext.BillingCountries = billTask.Result;
            this.PageContext.ShippingCountries = shipTask.Result;

            this.PageContext.BillingStates = billStateTask.Result;
            this.PageContext.ShippingStates = shipStateTask.Result;
            this.PageContext.VisaCheckoutButtonUrl = _settings.AppSettings("VisaCheckoutButtonUrl");
            this.PageContext.VisaCheckoutJavaScriptSdkUrl = _settings.AppSettings("VisaCheckoutJavaScriptSdkUrl");

            if (!this.PageContext.User.IsAnonymous)
            {
                account = (await _customerAccountWebApiClient.GetAccount(this.PageContext.User.AccountId)).ReadAsSync();
                cards = (await _customerAccountWebApiClient.GetAccountCards(this.PageContext.User.AccountId)).ReadAsSync();
                credits = (await _creditWebApiClient.GetCredits(0, 25, null, String.Format("CustomerId eq \"{0}\" and activationdate le \"{1}\" and expirationdate ge \"{1}\"", this.PageContext.User.AccountId, DateTime.UtcNow.ToString("o")))).ReadAsSync();
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
            var ipAddress = this.HttpContext.Request.Headers["x-forwarded-for"] ?? this.HttpContext.Request.ServerVariables["REMOTE_ADDR"];
            //  System.Net.IPAddress ipAddressStruct;
            if (!ipAddress.IsIPAddressValid())
            {
                ipAddress = "127.0.0.1";
            }

            model.IPAddress = ipAddress;

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
                jOrder.Add("customer", accountJson);
            }

            if (model.FulfillmentInfo != null && model.FulfillmentInfo.FulfillmentContact != null
                && model.FulfillmentInfo.FulfillmentContact.Address != null)
            {
                if (addedPrimaryShippingContactToOrderJustNow)
                {
                    try
                    {
                        model = (await _orderWebApiClient.UpdateOrder(id, model)).ReadAsSync();
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
                }

                var asm = (methods ?? new List<ShippingRate>(0)).ToJArray();
                JObject si = (JObject)jOrder["fulfillmentInfo"];
                si.Add("availableShippingMethods", asm);
            }

            if (this.SiteContext.CheckoutSettings.VisaCheckout.IsEnabled)
            {
                this.HttpContext.Response.AddHeader("X-Frame-Options", "sameorigin");
            }

            return View("checkout", jOrder);
        }


        public class CheckoutPciSettings
        {
            public string apiBase { get; set; }
        }
        
        [SbActionExtensionFilter(actionId: ActionFilterConstants.OrderConfirmationBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController)]
        [SbActionExtensionFilter(actionId: ActionFilterConstants.OrderConfirmationAfterAction, executionType: ActionExtensionExecutionTypes.AfterController)]
        [System.Web.Http.HttpGet]
        public async Task<ActionResult> Confirmation(string orderId)
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


            if (order == null)
                return Redirect("/");

            if (!CompletedOrderStates.Contains(order.Status)) return Redirect("/checkout/" + order.Id);
            Mozu.Location.Contracts.LocationCollection locations = null;

            if (order.Items.Exists(x => x.FulfillmentMethod == FulfillmentMethodConst.PICKUP))
            {
                //var locationsTask = (await _locationRuntimeWebApiClient.GetInStorePickupLocations(0, null, null, string.Join(" or ", order.Items.Select(x => "Code eq " + x.FulfillmentLocationCode).Distinct().ToList())));
                var locationsTask = (await _locationRuntimeWebApiClient.GetInStorePickupLocations(0, null, null, string.Join(" or ", order.Items.Select(x => string.Format("Code eq \"{0}\"", x.FulfillmentLocationCode)).Distinct().ToList())));

                locations = locationsTask.ReadAsSync();
            }

            var jOrder = order.ToJObject();

            jOrder.Add("hasDirectShip", order.Items.Exists(x => x.FulfillmentMethod == FulfillmentMethodConst.SHIP));

            if (locations != null)
            {
                var jItems = (JArray)jOrder["items"];

                for (int i = 0; i < order.Items.Count; i++)
                {
                    if (order.Items[i].FulfillmentMethod == FulfillmentMethodConst.SHIP)
                    {
                        var location = locations.Items.Find(x => x.Code == order.Items[i].FulfillmentLocationCode);
                        if (location != null)
                        {
                            ((JObject)jItems[i]).Add("fulfillmentLocationName", location.Name);
                        }
                    }
                }
            }
            this.ViewData["mailCheckTo"] = locTask.Result.ReadAsSync();
            return View("confirmation", jOrder);
        }
    }
}
