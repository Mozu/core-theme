using System;
using System.Collections.Generic;
//using VMCart = Mozu.SiteBuilder.UX.Models.StoreFront.Cart.Cart;
//using CartItem = Mozu.SiteBuilder.UX.Models.StoreFront.Cart.CartItem;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Carts;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.CommerceRuntime.Contracts.Commerce;
using Mozu.CommerceRuntime.Contracts.Orders;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Settings;
using Mozu.Location.Contracts;
using Mozu.Location.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.Contexts;
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
        Lazy<JsonSerializerSettings> _cartSerializer = new Lazy<JsonSerializerSettings>(() => new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() });
        readonly ICustomRouteHandler _customRouteHandler;

        public CartController(ICartWebApiClient cartClient, IOrderWebApiClient orderWebApiClient, ICookieProvider cookieProvider, ILocationRuntimeWebApiClient locationClient, ISettings settings, ICustomRouteHandler customRouteHandler)
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
        }

        private string BuildLocationsFilter(IEnumerable<string> locationCodes)
        {
            return string.Join(" or ", locationCodes.Select(x => "Code eq \"" + x +"\""));
        }

        [SbActionExtensionFilter(actionId: ActionFilterConstants.CartBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController)]
        [SbActionExtensionFilter(actionId: ActionFilterConstants.CartAfterAction, executionType: ActionExtensionExecutionTypes.AfterController)]
        [System.Web.Http.HttpGet]
        public async Task<HttpResponseMessage> Index()
        {
            var redirect = await _customRouteHandler.RedirectWithContext(Request, FancyRoute.Cart);
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

            this.PageContext.VisaCheckoutButtonUrl = _settings.AppSettings("VisaCheckoutButtonUrl");
            this.PageContext.VisaCheckoutJavaScriptSdkUrl = _settings.AppSettings("VisaCheckoutJavaScriptSdkUrl");

            var viewResult = await RenderCartViewWithMessage(null);
            return Request.CreateResponse(HttpStatusCode.OK, viewResult);
        }

        private async Task<ActionResult> RenderCartViewWithMessage(Exception error)
        {
            var cart = (await _cartClient.GetOrCreateCart()).ReadAsAsync().Result;
            LocationCollection locations = null;
            if (cart.Items != null && cart.Items.Any(x => x.FulfillmentMethod == FulfillmentMethodConst.PICKUP))
            {
                locations = (await _locationClient.GetInStorePickupLocations(0, null, null, BuildLocationsFilter(cart.Items.Select(x => x.FulfillmentLocationCode).Distinct().ToList()))).ReadAsSync();
            }

            var cartVM = CreateCartWithLocations(cart, locations);
            var jCart = cartVM.ToJObject(_cartSerializer.Value);

            if (error != null)
            {
                if (PageContext.IsDebugMode) throw error;
                jCart.Add("messages", new JArray(new { message = error.Message }.ToJObject(_cartSerializer.Value)));
            }

            if (this.SiteContext.CheckoutSettings.VisaCheckout.IsEnabled)
            {
                this.HttpContext.Response.AddHeader("X-Frame-Options", "SAMEORIGIN");
            }

            return View("cart", jCart);
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


        [NoWarmAuthActionFilter(ReturnUrl = "/cart/checkout")]
        [System.Web.Http.HttpPost]
        [System.Web.Http.HttpGet]
        public async Task<ActionResult> Checkout(CheckoutModel model)
        {
            Cart cart = null;
            Exception error = null;
            CommerceRuntime.Contracts.Orders.Order order = null;
            if (model == null || string.IsNullOrEmpty(model.Id))
            {
                cart = (await _cartClient.GetOrCreateCart()).ReadAsSync();
                model = new CheckoutModel {Id = cart.Id};
            }

            try
            {
                // add visit id to UserClaims bag for this call.
                var orderWebApiClient = _orderWebApiClient.CloneWithApiContext(apiContext => {
                    apiContext.UserClaims = apiContext.UserClaims.Copy();
                    apiContext.UserClaims.Bag["VisitId"] = this.PageContext.Visit != null ? this.PageContext.Visit.VisitId : null;
                });
                
                if (!model.DigitalWalletData.IsNullOrEmpty() && !model.DigitalWalletType.IsNullOrEmpty())
                {
                    order = (await orderWebApiClient.ProcessDigitalWallet(model.Id,
                                                            model.DigitalWalletType, 
                                                            new DigitalWallet { DigitalWalletData = model.DigitalWalletData, CartId = model.Id}
                                                            )).ReadAsSync();
                }
                else
                {
                    order = (await orderWebApiClient.CreateOrderFromCart(model.Id)).ReadAsSync();
                }
            }
            catch (Exception e)
            {
                error = e;
            }
            // lame, can't await a task in an exception handler so have to do this here
            if (error != null)
            {
                return await RenderCartViewWithMessage(error);
            }
            
            return Redirect(CreateRedirectUrl("/checkout/" + order.Id).ToString());
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
