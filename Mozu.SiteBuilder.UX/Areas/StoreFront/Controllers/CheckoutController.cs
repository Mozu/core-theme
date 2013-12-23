using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Runtime.Serialization;
using System.Threading.Tasks;
using System.Web.Http;

using Mozu.CommerceRuntime.Contracts.Fulfillment;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.CommerceRuntime.Contracts.Orders;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Api.Client;
using Mozu.Core.Settings;
using Mozu.Location.Contracts.Clients;
using Mozu.ShippingRuntime.Contracts.Clients;
using Mozu.Customer.Contracts;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Orders;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.UX.Models.Checkout;
using Mozu.SiteSettings.Shipping.Contracts.Clients;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [SslOnlyActionFilter]
    [ContextInitialization]
    [NoWarmAuthActionFilter]
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
        private readonly IShippingWebApiClient _shippingWebApiClient;
        
        private readonly OrderStatusProvider _orderStatusProvider = new OrderStatusProvider();

        //private static string _merchantId;
        private const string CookieName = "order";

        public CheckoutController(IAuthenticationHelper authHelper, ICookieProvider cookieProvider, ICustomerAccountWebApiClient customerAccountWebApiClient, IOrderWebApiClient orderWebApiClient, Mozu.ShippingRuntime.Contracts.Clients.IShippingWebApiClient shippingWebApiClient , Mozu.Location.Contracts.Clients.ILocationRuntimeWebApiClient locationRuntimeWebApiClient ,  ICreditWebApiClient creditWebApiClient, Mozu.CommerceRuntime.Contracts.Clients.ICartWebApiClient cartWebApiClient , ISettings settings)
        {
          
            _authHelper = authHelper;
            _cookieProvider = cookieProvider;
            
            _orderWebApiClient = orderWebApiClient;
            _cartWebApiClient = cartWebApiClient;
            _settings = settings;
            _customerAccountWebApiClient = customerAccountWebApiClient;
            _creditWebApiClient = creditWebApiClient.CloneWithoutUserClaims();
            _locationRuntimeWebApiClient = locationRuntimeWebApiClient.CloneWithoutUserClaims();
            _shippingWebApiClient = shippingWebApiClient.CloneWithoutUserClaims();
           

        }

        

        /*public string MerchantId
        {
            get { return _merchantId ?? (_merchantId = _orderService.GetMerchantId()); }
        }*/

        public async Task<List<KeyValuePair<string, string>>> GetShippableCountries()
        {

            var result = (await _shippingWebApiClient.GetShippableCountries()).ReadAsSync().Items;

            var res = result.Select(x => new KeyValuePair<string, string>(x.Name , x.Code )).ToList();
            if (res.Count == 0)
            {
                res.Add( new KeyValuePair<string, string>("us","us"));
            }
            return res;
        }

        private static List<string> CompletedOrderStates = new List<string>{
            Order.OrderStatusConst.SUBMITTED,
            Order.OrderStatusConst.ACCEPTED,
            Order.OrderStatusConst.PENDING_REVIEW
        };


         [System.Web.Http.HttpPost]
        public async Task<HttpResponseMessage > Index(string id=null , HttpRequestMessage requestMessage = null)
         {
             if (id == null)
             {
                 var cart = (await _cartWebApiClient.GetOrCreateCart()).ReadAsSync();
                 id = cart.Id;
             }
             var order = (await _orderWebApiClient.CreateOrderFromCart(id)).ReadAsSync();

             var req = this.Request.CreateResponse(HttpStatusCode.Redirect);
             Uri redirectUrl = null;
             if ( _settings.CoreSettings.IsSSLValidationEnabled &&  this.PageContext.HandledByProxy && !this.PageContext.IsSecure)
             {
                 var uriBuilder = new UriBuilder(PageContext.Url);
                 uriBuilder.Scheme = "https";
                 uriBuilder.Port = 443;
                 uriBuilder.Path = "/checkout/" + order.Id;
                 redirectUrl = uriBuilder.Uri;
                    
             }
             else
             {
                 redirectUrl  = new Uri("/checkout/" + order.Id,UriKind.Relative );
             }

             req.Headers.Location = redirectUrl;
             return req;



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
            Customer.Contracts.CustomerAccount account = null;
            CardCollection cards = null;
            Customer.Contracts.Credit.CreditCollection credits = null;

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
            if (CompletedOrderStates.Contains(model.Status)) return Redirect("/checkout/" + model.Id + "/confirmation");
            bool addedPrimaryShippingContactToOrderJustNow = false;

           // dynamic dOrder = jOrder;


            if (!this.PageContext.User.IsAnonymous)
            {
                account = (await _customerAccountWebApiClient.GetAccount(this.PageContext.User.AccountId)).ReadAsSync();
                cards = (await _customerAccountWebApiClient.GetAccountCards(this.PageContext.User.AccountId)).ReadAsSync();
                credits = (await _creditWebApiClient.GetCredits(0, 25, null, String.Format("CustomerId eq {0}",this.PageContext.User.AccountId))).ReadAsSync();
                CustomerContact primaryShippingContact = null;
                //CustomerContact primaryBillingContact = null;

                try
                {
                    primaryShippingContact = account.Contacts.Find(x => x.Types.Exists(y => y.Name == ContactTypeConst.SHIPPING && y.IsPrimary));
                    //primaryBillingContact = account.Contacts.Find(x => x.Types.Exists(y => y.Name == ContactTypeConst.BILLING && y.IsPrimary));
                }
                catch (NullReferenceException ex)
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

            var jSerializer = new JsonSerializer() { ContractResolver = new CamelCasePropertyNamesContractResolver() };
            var jOrder = JObject.FromObject(model, jSerializer);
            if (account != null)
            {
                JObject accountJson = JObject.FromObject(account, jSerializer);
                accountJson.Add("cards", JArray.FromObject(cards.Items, jSerializer));
                accountJson.Add("credits", JArray.FromObject(credits.Items, jSerializer));
                jOrder.Add("customer", accountJson);
            }

            if (model.FulfillmentInfo != null && model.FulfillmentInfo.FulfillmentContact != null && model.FulfillmentInfo.FulfillmentContact.Address != null)
            {
                if (addedPrimaryShippingContactToOrderJustNow)
                {
                    model = (await _orderWebApiClient.UpdateOrder(id, model)).ReadAsSync();
                }
                var methods = (await _orderWebApiClient.GetAvailableShipmentMethods(id)).ReadAsSync();
                var asm = JArray.FromObject(methods, jSerializer);
                JObject si = (JObject)jOrder["fulfillmentInfo"];
                si.Add("availableShippingMethods", asm);
                //jOrder.Add("AvailableShippingMethods", asm);
                //ViewData["availableShippingMethods"] = _orderWebApiClient.GetAvailableShipmentMethods(id).Result.ReadAsSync();
            }
            else
            {
                var countries = (await GetShippableCountries());
                if (countries.Count > 0)
                {
                    var ac = new JArray(countries.Select(x => new JObject {new JProperty("code", x.Key), new JProperty("name", x.Value)}).ToArray());

                    jOrder.Add("availableCountries", ac);
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
            var locTask = _locationRuntimeWebApiClient.GetDirectShipLocation();
            var orderTask = _orderWebApiClient.GetOrder(orderId);
            await Task.WhenAll(locTask, orderTask);
            var order = orderTask.Result.ReadAsSync();
            if (order == null)
                return Redirect("/cart");



            this.ViewData["mailCheckTo"] = locTask.Result.ReadAsSync();
            return View("confirmation", order);
        }

       
    }
}
