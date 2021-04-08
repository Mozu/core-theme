using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Carts;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.CommerceRuntime.Contracts.Commerce;
using Mozu.CommerceRuntime.Contracts.Orders;
using Mozu.CommerceRuntime.Contracts.Checkouts;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Client.Exceptions;
using Mozu.Core.ErrorHandling;
using Mozu.Core.Settings;
using Mozu.Location.Contracts;
using Mozu.Location.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Newtonsoft.Json.Linq;
using IOrderWebApiClient = Mozu.CommerceRuntime.Contracts.Clients.IOrderWebApiClient;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.Core.Extensions;
using Newtonsoft.Json.Serialization;
using Mozu.SiteBuilder.UX.Filters;
using Newtonsoft.Json;
using Mozu.Core.Actions;
using Mozu.SiteBuilder.Mvc.OAF;
using System.Net.Http;
using Mozu.SiteBuilder.Mvc.SEO;
using System.Net;
using Microsoft.AspNetCore.Mvc;
using Mozu.SiteSettings.General.Contracts.General.Routing;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ContextInitialization]
    [ClientCacheHeaders(ForceRevalidate = true)]
    [DataViewModeEnforcement]
    [SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController, Priority = ActionFilterConstants.GlobalPageBeforePriority)]
    [SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageAfterAction, executionType: ActionExtensionExecutionTypes.AfterController, Priority = ActionFilterConstants.GlobalPageAfterPriority)]
    public class CartController : BaseApiController
    {
        readonly ICartWebApiClient _cartClient;
        IOrderWebApiClient _orderWebApiClient;
        readonly ICookieProvider _cookieProvider;
        readonly ILocationRuntimeWebApiClient _locationClient;
        readonly ISettings _settings;
        readonly ICheckoutWebApiClient _checkoutWebApiClient;
        Lazy<JsonSerializerSettings> _cartSerializer = new Lazy<JsonSerializerSettings>(() => new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() });
        readonly ICustomRouteHandler _customRouteHandler;

        public CartController(ICartWebApiClient cartClient, IOrderWebApiClient orderWebApiClient, ICookieProvider cookieProvider, ILocationRuntimeWebApiClient locationClient, ISettings settings, ICustomRouteHandler customRouteHandler, ICheckoutWebApiClient checkoutWebApiClient)
        {
            if(cartClient == null)
            {
                throw new ArgumentNullException("cartClient");
            }

            _cartClient = cartClient;
            
            _orderWebApiClient = orderWebApiClient;
            _cookieProvider = cookieProvider;
            _locationClient = locationClient;
            _settings = settings;
            _customRouteHandler = customRouteHandler;
            _checkoutWebApiClient = checkoutWebApiClient;
        }

        private string BuildLocationsFilter(IEnumerable<string> locationCodes)
        {
            return string.Join(" or ", locationCodes.Select(x => "Code eq \"" + x +"\""));
        }

        [SbActionExtensionFilter(actionId: ActionFilterConstants.CartBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController)]
        [SbActionExtensionFilter(actionId: ActionFilterConstants.CartAfterAction, executionType: ActionExtensionExecutionTypes.AfterController)]
        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var redirect =  _customRouteHandler.RedirectWithContext(Request, FancyRoute.Cart);
            if (redirect != null) return redirect;

            var pc = this.PageContext;
            pc.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = "cart",
                    DocumentTypeFQN = "pageTemplateContent@mozu"
                }

            };

            PageContext.PageType = "cart";

            var viewResult = await RenderCartViewWithMessage(null);
            return Ok(viewResult);
        }

        private async Task<IActionResult> RenderCartViewWithMessage(Exception error)
        {
            var jCart = await RenderCart(error);

            if (!SiteContext.CheckoutSettings.VisaCheckout.IsEnabled) return View("cart", jCart);
            HttpContext.Response.Headers.Add("X-Frame-Options", "SAMEORIGIN");
            PageContext.VisaCheckoutButtonUrl = _settings.AppSettings("VisaCheckoutButtonUrl");
            PageContext.VisaCheckoutJavaScriptSdkUrl = _settings.AppSettings("VisaCheckoutJavaScriptSdkUrl");

            return View("cart", jCart);
        }

        private async Task<JObject> RenderCart(Exception error)
        {
            var cart = (await _cartClient.GetOrCreateCart()).ReadAsAsync().Result;
            LocationCollection locations = null;
            if (cart.Items != null && cart.Items.Any(x => x.FulfillmentMethod == FulfillmentMethodConst.PICKUP))
            {
                locations = (await _locationClient.GetInStorePickupLocations(0, null, null, BuildLocationsFilter(cart.Items.Select(x => x.FulfillmentLocationCode).Distinct().ToList()))).ReadAsSync();
            }

            var cartVM = CreateCartWithLocations(cart, locations);
            var jCart = cartVM.ToJObject(_cartSerializer.Value);
            var messagesArray = new JArray();

            if (error != null)
            {
                if (PageContext.IsDebugMode || PageContext.DebugFlags.HasFlag(DebugModeFlagValues.ShowErrors)) throw error;
                messagesArray.Add(new { message = error.Message }.ToJObject(_cartSerializer.Value));
            }

            if (cart.CartMessages != null)
            {
                static int Rank(string messageType)
                {
                    return messageType switch
                    {
                        "newPriceList" => 2,
                        "exclusivePriceList" => 1,
                        _ => 0
                    };
                }

                var messages = cart.CartMessages.Where(x => !string.IsNullOrEmpty(x.Message)).ToList();
                messages.Sort((a, b) => Rank(b.MessageType).CompareTo(Rank(a.MessageType))); // Sort descending
                foreach (var cartMessage in messages)
                {
                    messagesArray.Add(new
                    {
                        message = cartMessage.Message,
                        messageType = cartMessage.MessageType,
                        productsRemoved = cartMessage.ProductsRemoved
                    }.ToJObject(_cartSerializer.Value));
                }
            }

            if (messagesArray.Count > 0)
            {
                jCart.Add("messages", messagesArray);
            }

            return jCart;
        }
        private UX.Models.StoreFront.Commerce.Cart CreateCartWithLocations(Cart cart, LocationCollection locations)
        {
            var cartbase = Mapper.Map<UX.Models.StoreFront.Commerce.Cart>(cart);
            if (locations != null && locations.Items.Any())
            {
                foreach (var cartItem in cartbase.Items.Where(item => item.FulfillmentMethod == FulfillmentMethodConst.PICKUP))
                {
                    var location = locations.Items.FirstOrDefault(x => x.Code.EqualsIgnoreCase(cartItem.FulfillmentLocationCode));
                    if (location != null) cartItem.FulfillmentLocationName = location.Name;
                }
            }
            return cartbase;
        }
        
        public class CheckoutModel
        {
            public string Id { get; set; }
            public string DigitalWalletType { get; set; }
            public string DigitalWalletData { get; set; }
        }

        [HttpGet]
        public async Task<JObject> GetCart()
        {
            return await RenderCart(null);
        }

        [NoWarmAuthActionFilter(ReturnUrl = "/cart/checkout")]
        [HttpPost]
        [HttpGet]
        public async Task<IActionResult> Checkout(CheckoutModel model)
        {
            Cart cart = null;
            Exception error = null;
            Order order = null;
            Checkout checkout = null;
            if (model == null || string.IsNullOrEmpty(model.Id))
            {
                cart = (await _cartClient.GetOrCreateCart()).ReadAsSync();
                model = new CheckoutModel {Id = cart.Id};
            }

            try
            {
                //TO-DO: isMultiShip var
                var isMultiShip = SiteContext.GeneralSettings.IsMultishipEnabled.GetValueOrDefault();

                // Multiship flag is jacked right now.
                if (isMultiShip)
                {
                    // add visit id to UserClaims bag for this call.
                    var checkoutWebApiClient = _checkoutWebApiClient.CloneWithApiContext(apiContext =>
                    {
                        apiContext.UserClaims = apiContext.UserClaims.Copy();
                        apiContext.UserClaims.Bag["VisitId"] = this.PageContext.Visit != null ? this.PageContext.Visit.VisitId : null;
                    });

                    if (!model.DigitalWalletData.IsNullOrEmpty() && !model.DigitalWalletType.IsNullOrEmpty())
                    {
                       checkout = (await checkoutWebApiClient.ProcessDigitalWallet(model.Id, model.DigitalWalletType,
                                                                new DigitalWallet { DigitalWalletData = model.DigitalWalletData, CartId = model.Id }
                                                                )).ReadAsSync();
                                                                
                    }
                    else
                    {
                        checkout = (await checkoutWebApiClient.CreateCheckoutFromCart(model.Id)).ReadAsSync();
                    }
                    return new RedirectResult(CreateRedirectUrl(this.SiteContext.SiteSubdirectory + "/checkoutv2/" + checkout.Id).ToString());
                }

                // add visit id to UserClaims bag for this call.
                var orderWebApiClient = _orderWebApiClient.CloneWithApiContext(apiContext =>
                {
                    apiContext.UserClaims = apiContext.UserClaims.Copy();
                    apiContext.UserClaims.Bag["VisitId"] = this.PageContext.Visit != null ? this.PageContext.Visit.VisitId : null;
                });

                if (!model.DigitalWalletData.IsNullOrEmpty() && !model.DigitalWalletType.IsNullOrEmpty())
                {
                    order = (await orderWebApiClient.ProcessDigitalWallet(model.Id, model.DigitalWalletType,
                                                            new DigitalWallet { DigitalWalletData = model.DigitalWalletData, CartId = model.Id }
                                                            )).ReadAsSync();
                }
                else
                {
                    order = (await orderWebApiClient.CreateOrderFromCart(model.Id)).ReadAsSync();
                }
                return new RedirectResult(CreateRedirectUrl(this.SiteContext.SiteSubdirectory + "/checkout/" + order.Id).ToString());
            }
            catch (Exception e)
            {
                error = e;
            }

            switch (error)
            {
                case ApiWebClientException apiException when apiException.ErrorCode.Equals(ErrorCodes.VALIDATION_CONFLICT):
                    // If order failed validation, show the message to say what happened and refresh the cart to try to fix the problem.
                    // Price change - item repriced
                    // Product/variant no longer active - item dropped
                    // Misconfigured product - item dropped
                    // Inadequate inventory - item remains (shopper can remove/reduce quantity)

                    try
                    {
                        cart ??= (await _cartClient.GetOrCreateCart()).ReadAsSync();
                        var updatedCart = (await _cartClient.UpdateCart(cart)).ReadAsSync();
                        var cartHasItems = updatedCart.Items != null && updatedCart.Items.Any();

                        const string prefix = "Validation Error: "; // Automatically added by VaeValidationConflictException in Mozu.Core
                        var message = error.Message.StartsWith(prefix) ? error.Message.Substring(prefix.Length) : error.Message;
                        if (cartHasItems)
                        {
                            message += " Please review your cart and proceed to checkout.";
                        }
                        error = new Exception(message, error);
                    }
                    catch
                    {
                        // ignored
                    }

                    break;
            }

            return await RenderCartViewWithMessage(error);

        }

        private Uri CreateRedirectUrl(string path)
        {
            Uri redirectUrl;
            if (_settings.CoreSettings.IsSSLValidationEnabled && this.PageContext.HandledByProxy && !this.PageContext.IsSecure)
            {
                var uriBuilder = new UriBuilder(PageContext.Url) {Scheme = "https", Port = 443, Path = path};
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
