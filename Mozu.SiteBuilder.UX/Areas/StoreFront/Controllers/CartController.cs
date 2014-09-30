using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;

using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Carts;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.CommerceRuntime.Contracts.Commerce;
using Mozu.Location.Contracts;
using Mozu.SiteBuilder.Mvc;
using Mozu.Core.Settings;

using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
//using VMCart = Mozu.SiteBuilder.UX.Models.StoreFront.Cart.Cart;
//using CartItem = Mozu.SiteBuilder.UX.Models.StoreFront.Cart.CartItem;
using VM=Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using System.Linq;
using IOrderWebApiClient = Mozu.CommerceRuntime.Contracts.Clients.IOrderWebApiClient ;
using Product = Mozu.ProductRuntime.Contracts.Product;
using Mozu.Location.Contracts.Clients;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ContextInitialization]
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

        private string BuildLocationsFilter(List<string> locationCodes)
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
            if (cart.Items != null && cart.Items.Any(x => x.FulfillmentMethod == Mozu.CommerceRuntime.Contracts.Commerce.FulfillmentMethodConst.PICKUP))
            {
                locations = (await _locationClient.GetInStorePickupLocations(0, null, null, BuildLocationsFilter(cart.Items.Select(x => x.FulfillmentLocationCode).Distinct().ToList()))).ReadAsSync();
            }



            var cartVM = Mapper.Map<Mozu.SiteBuilder.UX.Models.StoreFront.Commerce.Cart>(cart);

            var jSerializer = new JsonSerializer() { ContractResolver = new CamelCasePropertyNamesContractResolver() };
            var jCart = JObject.FromObject(cartVM, jSerializer);

            var jItems = (JArray)jCart["items"];
            if (locations != null)
            {
                for (int i = 0; i < cartVM.Items.Count; i++)
                {
                    if (cartVM.Items[i].FulfillmentMethod == Mozu.CommerceRuntime.Contracts.Commerce.FulfillmentMethodConst.PICKUP)
                    {
                        var location = locations.Items.Find(x => x.Code == cartVM.Items[i].FulfillmentLocationCode);
                        if (location != null)
                        {
                            ((JObject)jItems[i]).Add("fulfillmentLocationName", location.Name);
                        }
                    }
                }
            }

            if (error != null)
            {
                var messages = new JArray();
                if (PageContext.IsDebugMode)
                {
                    throw error;
                }
                else
                {
                    messages.Add(JObject.FromObject(new { message = error.Message }, jSerializer));
                }
                jCart.Add("messages", messages);
            }

            return View("cart", jCart); // Mapper.Map<VMCart>(cart));
        }

     

        [NoWarmAuthActionFilter(ReturnUrl = "/cart/checkout")]
        [System.Web.Http.HttpPost]
        [System.Web.Http.HttpGet]   
        public async Task<ActionResult> Checkout(string id = null, HttpRequestMessage requestMessage = null)
        {
            Cart cart = null;
            Exception error = null;
            CommerceRuntime.Contracts.Orders.Order order = null;
            if (id == null)
            {
                cart = (await _cartClient.GetOrCreateCart()).ReadAsSync();
                id = cart.Id;
            }

            try
            {
                order = (await _orderWebApiClient.CreateOrderFromCart(id)).ReadAsSync();
            }
            catch (Exception e)
            {
                UpdateCartWithExceptionMessage(id, e);
                error = e;
            }
            if (error != null)
            {
                return await RenderCartViewWithMessage(error);
            }
            else
            {
                return Redirect(CreateRedirectUrl("/checkout/" + order.Id).ToString());
            }
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
