using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Runtime.Serialization;
using System.Threading.Tasks;
using System.Web.Http;

using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.CommerceRuntime.Contracts.Orders;
using Mozu.Core.Api.Contracts.Client;

using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Orders;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.UX.Models.Checkout;
using Mozu.SiteSettings.Shipping.Contracts.Clients;
using System.Linq;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{

   

    public class CheckoutController : BaseApiController
    {
       
        private readonly IAuthenticationHelper _authHelper;
        private readonly ICookieProvider _cookieProvider;
        private readonly IPciSettingsProvider _pciSettingsProvider;
        private readonly IOrderWebApiClient _orderWebApiClient;
        private readonly IShippingSettingsWebApiClient _shippingSettingsWebApiClient;
        private readonly OrderStatusProvider _orderStatusProvider = new OrderStatusProvider();

        //private static string _merchantId;
        private const string CookieName = "order";

        public CheckoutController(IAuthenticationHelper authHelper, ICookieProvider cookieProvider, IPciSettingsProvider pciSettingsProvider, IOrderWebApiClient orderWebApiClient, IShippingSettingsWebApiClient shippingSettingsWebApiClient)
        {
          
            _authHelper = authHelper;
            _cookieProvider = cookieProvider;
            _pciSettingsProvider = pciSettingsProvider;
            _orderWebApiClient = orderWebApiClient;
            _shippingSettingsWebApiClient = shippingSettingsWebApiClient;
        }

        /*public string MerchantId
        {
            get { return _merchantId ?? (_merchantId = _orderService.GetMerchantId()); }
        }*/

        public async Task<List<KeyValuePair<string, string>>> GetShippableCountries()
        {
            var result =  (await  _shippingSettingsWebApiClient.GetShippingRegions()).ReadAsAsync().Result;

            return result.Select(x => new KeyValuePair<string, string>(x.ISOCountryCode, x.ISOCountryCode)).ToList();
        }


        [System.Web.Http.HttpGet]
        public async Task<ActionResult> Index(string orderId)
        {
            var pc = this.SiteContext.PageContext;
            pc.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = "checkout"
                }

            };
            //var id = OrderId;
            var id = orderId;
            if (string.IsNullOrWhiteSpace(id)) return Redirect("/cart");
            Order model;
            try
            {

                model = (await _orderWebApiClient.GetOrder(id)).ReadAsAsync().Result;
            }
            catch (Mozu.Core.Api.Client.Exceptions.ApiWebClientException e)
            {
                // TODO: more granular exception handling here
                return Redirect("/cart");
            }
            if (model == null) return Redirect("/cart");
            if (model.Status == "Submitted") return Redirect("/checkout/" + model.Id + "/confirmation");




            if (model.ShippingInfo != null && model.ShippingInfo.ShippingContact != null && model.ShippingInfo.ShippingContact.Address != null)
            {
                ViewData["availableShippingMethods"] = _orderWebApiClient.GetAvailableShipmentMethods(id).Result.ReadAsSync();
            }



            ViewData["paymentApiBase"] = _pciSettingsProvider.GetPaymentApiBase();
            ViewData["availableCountries"] = (await GetShippableCountries()).Select(x => new { code = x.Key, name = x.Value } as object).ToList();


            return View("checkout", model);
        }



     

        [System.Web.Http.HttpGet]
        public async Task<ActionResult>  Confirmation(string orderId)
        {
            var order = (await _orderWebApiClient.GetOrder(orderId)).ReadAsSync();
            if (order == null)
                return Redirect("/cart");
            this.ViewData["MailCheckTo"] = (await _shippingSettingsWebApiClient.GetShippingOriginAddress()).ReadAsSync();
            return View("confirmation", order);
        }

       
    }
}
