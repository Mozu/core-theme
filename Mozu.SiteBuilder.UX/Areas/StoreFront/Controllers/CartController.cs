using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;

using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Carts;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
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
        

        public CartController(ICartWebApiClient cartClient, IOrderWebApiClient orderWebApiClient, ICookieProvider cookieProvider, ILocationRuntimeWebApiClient locationClient)
        {
            if(cartClient == null)
            {
                throw new ArgumentNullException("cartClient");
            }

            _cartClient = cartClient;
            
            _orderWebApiClient = orderWebApiClient;
            _cookieProvider = cookieProvider;
            _locationClient = locationClient;
        }

        private string BuildLocationsFilter(List<string> locationCodes)
        {
            return string.Join(" or ", locationCodes.Select(x => "Code eq " + x));
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
                    DocumentType = "page_template"
                }

            };

            PageContext.PageType = "cart";
           
            
            var cart = (await _cartClient.GetOrCreateCart() ).ReadAsAsync().Result;
            var locations = (await _locationClient.GetInStorePickupLocations(0, null, null, BuildLocationsFilter(cart.Items.Select(x => x.FulfillmentLocationCode).Distinct().ToList()))).ReadAsSync();

            var cartVM = Mapper.Map<Mozu.SiteBuilder.UX.Models.StoreFront.Commerce.Cart>(cart);

            var jSerializer = new JsonSerializer() { ContractResolver = new CamelCasePropertyNamesContractResolver() };
            var jCart = JObject.FromObject(cartVM, jSerializer);

            var jItems = (JArray)jCart["items"];

            for (int i = 0; i < cartVM.Items.Count; i++)
            {
                if (cartVM.Items[i].FulfillmentLocationCode != null)
                {
                    ((JObject)jItems[i]).Add("fulfillmentLocationName", locations.Items.Find(x => x.Code == cartVM.Items[i].FulfillmentLocationCode).Name);
                }
            }
            
            return View( "cart", jCart); // Mapper.Map<VMCart>(cart));
        }

       
    }
}
