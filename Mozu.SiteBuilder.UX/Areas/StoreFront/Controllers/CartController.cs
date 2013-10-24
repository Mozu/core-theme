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

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    public class CartController : BaseApiController
    {
        private readonly ICartWebApiClient _cartClient;
        IOrderWebApiClient _orderWebApiClient;
        private readonly ICookieProvider _cookieProvider;
        ISiteBuilderContext _context;

        public CartController(ICartWebApiClient cartClient, ISiteBuilderContext context, IOrderWebApiClient orderWebApiClient, ICookieProvider cookieProvider)
        {
            if(cartClient == null)
            {
                throw new ArgumentNullException("cartClient");
            }

            _cartClient = cartClient;
            _context = context;
            _orderWebApiClient = orderWebApiClient;
            _cookieProvider = cookieProvider;
        }

        [System.Web.Http.HttpGet]
        public async Task<ActionResult> Index()
        {
            var pc = this.PageContext;
            pc.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = "cart"
                }

            };
            
            var cart = (await _cartClient.GetOrCreateCart() ).ReadAsAsync().Result;

            var cartVM = Mapper.Map<Mozu.SiteBuilder.UX.Models.StoreFront.Commerce.Cart>(cart);
          
            
            return View( "cart", cartVM); // Mapper.Map<VMCart>(cart));
        }

       
    }
}
