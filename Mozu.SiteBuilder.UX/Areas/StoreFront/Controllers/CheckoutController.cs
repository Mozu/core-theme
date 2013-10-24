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
using Mozu.Core.Api.Client;

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
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{

   

    public class CheckoutController : BaseApiController
    {
       
        private readonly IAuthenticationHelper _authHelper;
        private readonly ICookieProvider _cookieProvider;
   
        private readonly IOrderWebApiClient _orderWebApiClient;
        private readonly IShippingSettingsWebApiClient _shippingSettingsWebApiClient;
        private readonly OrderStatusProvider _orderStatusProvider = new OrderStatusProvider();

        //private static string _merchantId;
        private const string CookieName = "order";

        public CheckoutController(IAuthenticationHelper authHelper, ICookieProvider cookieProvider,  IOrderWebApiClient orderWebApiClient, IShippingSettingsWebApiClient shippingSettingsWebApiClient)
        {
          
            _authHelper = authHelper;
            _cookieProvider = cookieProvider;
            
            _orderWebApiClient = orderWebApiClient;
            _shippingSettingsWebApiClient = shippingSettingsWebApiClient.CloneWithoutUserClaims();
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
            var pc = this.PageContext;
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



            var jOrder = Newtonsoft.Json.Linq.JObject.FromObject(model);

           // dynamic dOrder = jOrder;

            if (model.FulfillmentInfo != null && model.FulfillmentInfo.FulfillmentContact != null && model.FulfillmentInfo.FulfillmentContact.Address != null)
            {
                var methods = (await _orderWebApiClient.GetAvailableShipmentMethods(id)).ReadAsSync();
                var asm = JArray.FromObject(methods);
                JObject si = (JObject)jOrder["ShippingInfo"];
                si.Add("AvailableShippingMethods", asm);
                //jOrder.Add("AvailableShippingMethods", asm);
                //ViewData["availableShippingMethods"] = _orderWebApiClient.GetAvailableShipmentMethods(id).Result.ReadAsSync();
            }
            else
            {
                var countries = (await GetShippableCountries());
                if (countries.Count > 0)
                {
                    var ac = new JArray(countries.Select(x => new JObject {new JProperty("code", x.Key), new JProperty("name", x.Value)}).ToArray());

                    jOrder.Add("AvailableCountries", ac);
                }
                //else
                //{
                //    jOrder.Add("AvailableShippingMethods", new JArray(new int[0]));
                //}
            }
                
            







            return View("checkout", jOrder);
        }


        public class CheckoutPciSettings
        {
            public string apiBase { get; set; }
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
