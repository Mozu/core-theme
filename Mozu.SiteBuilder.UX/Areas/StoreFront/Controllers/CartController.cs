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

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ContextInitialization]
    [ClientCacheHeaders(ForceRevalidate = true)]
    public class CartController : BaseApiController
    {
        private readonly ICartWebApiClient _cartClient;
        IOrderWebApiClient _orderWebApiClient;
        private readonly ICookieProvider _cookieProvider;
        private readonly ILocationRuntimeWebApiClient _locationClient;
        private readonly ISettings _settings;

        public CartController(ICartWebApiClient cartClient, IOrderWebApiClient orderWebApiClient, ICookieProvider cookieProvider, ILocationRuntimeWebApiClient locationClient, ISettings settings)
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
        }

        private string BuildLocationsFilter(IEnumerable<string> locationCodes)
        {
            return string.Join(" or ", locationCodes.Select(x => "Code eq \"" + x +"\""));
        }

        [System.Web.Http.HttpGet]
        public async Task<ActionResult> Index()
        {
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


            return (await RenderCartViewWithMessage(null));
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
            var jCart = cartVM.ToJObject(new Newtonsoft.Json.JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() });

            if (error != null)
            {
                var messages = new JArray();
                if (PageContext.IsDebugMode)
                {
                    throw error;
                }
                else
                {
                    messages.Add(new { message = error.Message }.ToJObject());
                }
                jCart.Add("messages", messages);
            }

            return View("cart", jCart); // Mapper.Map<VMCart>(cart));
        }

        private Models.StoreFront.Commerce.Cart CreateCartWithLocations(Cart cart, LocationCollection locations)
        {
            var cartbase = Mapper.Map<Models.StoreFront.Commerce.Cart>(cart);
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
                    apiContext.UserClaims = apiContext.UserClaims.Copy<LightweightUserClaims>();
                    apiContext.UserClaims.Bag["VisitId"] = this.PageContext.Visit != null ? this.PageContext.Visit.VisitId : null;
                });
                order = (await orderWebApiClient.CreateOrderFromCart(model.Id)).ReadAsSync();
            }
            catch (Exception e)
            {
                UpdateCartWithExceptionMessage(model.Id, e);
                error = e;
            }
            if (error != null)
            {
                return await RenderCartViewWithMessage(error);
            }
            
            return Redirect(CreateRedirectUrl("/checkout/" + order.Id).ToString());
        }


        /// <summary>
        /// not async as called from exception block
        /// </summary>
        /// <param name="cartId"></param>
        /// <param name="e"></param>
        private void UpdateCartWithExceptionMessage(string cartId, Exception e)
        {
            var badCart = (_cartClient.GetCart(cartId)).Result.ReadAsSync();
            badCart.ChangeMessages.Add(new ChangeMessage()
            {
                Message = string.Format("{0}{1}", e.Message, (e.InnerException != null)
                    ? " : " + e.InnerException.Message
                    : string.Empty),
                Success = false,
                SubjectType = "Product",
            });
            _cartClient.UpdateCart(badCart).Result.ReadAsSync();
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
