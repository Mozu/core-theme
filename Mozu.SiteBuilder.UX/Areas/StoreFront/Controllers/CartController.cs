using System;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Mvc;
using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Carts;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models;
using VMCart = Mozu.SiteBuilder.UX.Models.StoreFront.Cart.Cart;
using CartItem = Mozu.SiteBuilder.UX.Models.StoreFront.Cart.CartItem;
using VM=Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using System.Linq;
using IOrderWebApiClient = Mozu.CommerceRuntime.Contracts.Clients.IOrderWebApiClient ;
using Product = Mozu.ProductRuntime.Contracts.Product;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    public class CartController : BaseController
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

        public ActionResult Index()
        {
            var cart = _cartClient.GetOrCreateCart().Result.ReadAsAsync().Result;

            return View("cart", cart); //Mapper.Map<VMCart>(cart));
        }

        public JsonDCResult ApplyCoupon(string couponCode)
        {
            if (!string.IsNullOrEmpty(couponCode))
                _cartClient.ApplyCoupon(couponCode).Result.ReadAsAsync().Wait();

            var cart = _cartClient.GetOrCreateCart().Result.ReadAsAsync().Result;

            return new JsonDCResult()
            {
                Data = Mapper.Map<VMCart>(cart)
            };
        }

        public JsonDCResult RemoveCoupon(string couponCode)
        {
            //if (!string.IsNullOrEmpty(couponCode))
            //    _cartClient.RemoveCoupon(couponCode).Result.ReadAsAsync().Wait();

            var cart = _cartClient.GetOrCreateCart().Result.ReadAsAsync().Result;

            return new JsonDCResult()
            {
                Data = Mapper.Map<VMCart>(cart)
            };
        }

        public JsonDCResult GetCart()
        {
            // TODO: Use GetOrCreate here???
            var cart = _cartClient.GetOrCreateCart().Result.ReadAsAsync().Result;

            return new JsonDCResult()
            {
                Data = Mapper.Map<VMCart>(cart),
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        public JsonDCResult UpdateCart(VMCart cart)
        {
            
            var c = Mapper.Map<Cart>(cart);
            var ret = _cartClient.UpdateCart(c).Result.ReadAsAsync().Result;

            return new JsonDCResult()
            {
                Data = Mapper.Map<VMCart>(ret)
            };
        }

        public ActionResult Checkout(VMCart cart)
        {
            if (cart == null || cart.Id == null)
                return RedirectToAction("Index");

            var response = _orderWebApiClient.CreateOrderFromCart(cart.Id).Result;
            if (response.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
                return RedirectToAction("Index");

            var order = response.ReadAsAsync().Result;

            var cookie = new HttpCookie("") { Expires = (order.CreateDate ?? DateTime.Now).AddMinutes(20d) };
            cookie["orderid"] = order.Id;

            _cookieProvider.SaveResponseCookie("order", cookie);

            return RedirectToAction("Index", "Checkout");
        }

        [HttpPost]
        public JsonDCResult AddCartItem(CartItem item)
        {
            var cartItem = Mapper.Map<Mozu.CommerceRuntime.Contracts.Carts.CartItem>(item);
            var ret = _cartClient.AddItemToCart(cartItem).Result.ReadAsAsync().Result;
            var cart = _cartClient.GetOrCreateCart().Result.ReadAsAsync().Result;

            return new JsonDCResult()
            {
                Data = Mapper.Map<VMCart>(cart)
            };
        }

        [HttpPost]
        public JsonDCResult AddProduct(VM.ProductConfigurationRequest item)
        {
            var cartItem = Mapper.Map<Mozu.CommerceRuntime.Contracts.Carts.CartItem>(item);
            var addItemResponse = _cartClient.AddItemToCart(cartItem).Result;

            if (addItemResponse.HasException)
                throw addItemResponse.ReadException();

            var addedCartItem = addItemResponse.ReadAsAsync().Result;
            CommerceRuntime.Contracts.Carts.Cart cart = _cartClient.GetOrCreateCart().Result.ReadAsAsync().Result;

            return new JsonDCResult()
            {
                Data = Mapper.Map<VMCart>(cart)
            };
        }


        [HttpPost]
        public JsonDCResult UpdateCartItem(CartItem item)
        {
            var cartItem = _cartClient.GetIndividualCartItem(item.Id).Result.ReadAsAsync().Result;
            cartItem.Quantity = item.Quantity;

            try
            {
                var ret = _cartClient.UpdateIndividualCartItem(cartItem, cartItem.Id).Result.ReadAsAsync().Result;
            }
            catch(Exception)
            {
                // This can cause a serialization error but delete works so sink it for now.
            }
            
            var cart = _cartClient.GetOrCreateCart().Result.ReadAsAsync().Result;

            return new JsonDCResult()
            {
                Data = Mapper.Map<VMCart>(cart)
            };
        }

        public ActionResult DeleteCartItem(string id)
        {
            if(!string.IsNullOrEmpty(id))
            {
                //var ret = _cartClient.DeleteIndividualCartItem(id).Result.ReadAsAsync().Result;
            }
            
            var cart = _cartClient.GetOrCreateCart().Result.ReadAsAsync().Result;
            return View("Index", Mapper.Map<VMCart>(cart));
        }   
    }
}
