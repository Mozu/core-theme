using Kibo.Fulfillment.Contracts.Model;
using KuttSharp;
using KuttSharp.Models.V2;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.CommerceRuntime.Contracts.Orders;
using Mozu.Core.Api.Client;
using Mozu.Core.Expressions;
using Mozu.Core.Extensions;
using Mozu.Core.Logging;
using Mozu.Core.Messaging.Contracts.Notification;
using Mozu.Core.Settings;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Helpers;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.Mvc.TestData;
using Microsoft.Extensions.DependencyInjection;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Configuration;
using Mozu.SiteBuilder.UX.Filters;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.UX.Models.Customers;
using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.Extensions.Logging;
using Shipment = Mozu.CommerceRuntime.Contracts.Fulfillment.Shipment;
using VM = Mozu.SiteBuilder.Mvc.Models.CMS;
using Fulfillment = Kibo.Fulfillment.Contracts.Model;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    public class Topics
    {
        public const string ShipmentAssigned = "shipment.assigned";
        public const string ShipmentItemCanceled = "shipment.itemscanceled";
        public const string CustomerIntransit = "shipment.customerintransit";
        public const string CustomerAtCurbside = "shipment.customeratcurbside";
        public const string IntransitConfirmation = "shipment.intransitconfirmation";
        public const string OrderConfirmation = "order.changed";
        public const string ShipmentFulfilled = "shipment.fulfilled";
        public const string CurbsideReady = "shipment.curbsideready";
        public const string PartialCurbsideReady = "shipment.partialcurbsideready";
        public const string StoreItemsCanceled = "shipment.itemscanceled.store";
        public const string OrderPickupReady = "shipment.pickupready";
        public const string OrderPartialPickupReady = "shipment.partialpickupready";
        public const string OrderPickupReminder = "shipment.pickupreminder";
    }

    public class ShipmentNotification : Fulfillment.EntityModelOfShipment
    {
        public string StoreId { get; set; }
        public string ShipmentUrl { get; set; }
        public string FulfillerUrl { get; set; }
        public Order Order { get; set; }
        public Location.Contracts.Location StoreLocation { get; set; }
        public bool IsShopperCanceled { get; set; }
    }

    public class OrderNotification : Order
    {
        public string StoreId { get; set; }
        public string ShipmentUrl { get; set; }
        public string FulfillerUrl { get; set; }
    }

    public class MobileNotificationResponse
    {
        public string Subject { get; set; }
        public string Body { get; set; }
    }

    public class MobileNotificationTypeInfo
    {
        public string Topic { get; set; }
        public Type ModelType { get; set; }
    }

    [ContextInitialization]
    [IgnoreDataViewMode]
    public class MobileNotificationController : CmsPagesController
    {
        public const string KUTTIT_API_KEY_CONFIG = "KuttItApiKey";
        public const string KUTTIT_DEFAULT_DOMAIN_CONFIG = "KuttItDefaultDomain";
        public const string KUTTIT_CUSTOM_DOMAIN_CONFIG = "KuttItCustomDomain";
        public const string FULFILLER_URL_FRAGMENT = "_fulfiller";
        public const string ANNONYMOUS_NOTIFICATION_URL_FRAGMENT = "anonymous-notification";
        public const string SHIPMENT_URL_FRAGMENT = "shipment";
        public const string CURBSIDEARRIVE = "curbsideArrive";
        public const string CURBSIDESHIPMENTREADY = "curbsideShipmentReady";
        public const string PARTIALCURBSIDEREADY = "partialCurbsideReady";
        public const string CURBSIDESURVEY = "curbsideSurvey"; 
        public const string SHIPMENT_PICKUP_READY = "shipmentPickupReady";

        private static readonly List<MobileNotificationTypeInfo> _smsMobileNotificationTypeInfo;

        private readonly ISitesWebApiClient _sitesWebApiClient;
        private readonly ILogger<MobileNotificationController> _logger;
        private readonly ISettings _settings;
        private readonly IOrderWebApiClient _orderWebApiClient;

        static MobileNotificationController()
        {
            _smsMobileNotificationTypeInfo = new List<MobileNotificationTypeInfo>
            {
                new MobileNotificationTypeInfo
                {
                    ModelType = typeof (ShipmentNotification),
                    Topic = Topics.ShipmentAssigned
                },
                new MobileNotificationTypeInfo
                {
                    ModelType = typeof (ShipmentNotification),
                    Topic = Topics.ShipmentItemCanceled
                },
                new MobileNotificationTypeInfo
                {
                    ModelType = typeof (ShipmentNotification),
                    Topic = Topics.CustomerAtCurbside
                },
                new MobileNotificationTypeInfo
                {
                    ModelType = typeof (ShipmentNotification),
                    Topic = Topics.CustomerIntransit
                },
                new MobileNotificationTypeInfo
                {
                    ModelType = typeof (ShipmentNotification),
                    Topic = Topics.IntransitConfirmation
                },
                new MobileNotificationTypeInfo
                {
                    ModelType = typeof (OrderNotification),
                    Topic = Topics.OrderConfirmation
                },
                new MobileNotificationTypeInfo
                {
                    ModelType = typeof (ShipmentNotification),
                    Topic = Topics.CurbsideReady
                },
                new MobileNotificationTypeInfo
                {
                    ModelType = typeof (ShipmentNotification),
                    Topic = Topics.ShipmentFulfilled
                },
                new MobileNotificationTypeInfo
                {
                    ModelType = typeof (ShipmentNotification),
                    Topic = Topics.PartialCurbsideReady
                },
                new MobileNotificationTypeInfo
                {
                    ModelType = typeof (ShipmentNotification),
                    Topic = Topics.StoreItemsCanceled
                },
                new MobileNotificationTypeInfo
                {
                    ModelType = typeof (ShipmentNotification),
                    Topic = Topics.OrderPickupReady
                },
                new MobileNotificationTypeInfo
                {
                    ModelType = typeof (ShipmentNotification),
                    Topic = Topics.OrderPartialPickupReady
                },
                new MobileNotificationTypeInfo
                {
                    ModelType = typeof (ShipmentNotification),
                    Topic = Topics.OrderPickupReminder
                }
            };
        }

        public MobileNotificationController(
            ICustomerAccountWebApiClient customerAccountWebApiClient,
            ISitesWebApiClient sitesWebApiClient,
            ILogger<MobileNotificationController> logger,
            ISettings settings,
            ICustomRouteHandler customRouteHandler,
            Lazy<UrlHelper> urlhelper,
            Lazy<ExpressionEvaluatorVisitor<CmsPageRuleContext>> pageRuleVisitor,
            Lazy<IExpressionEvaluator> pageRuleEvaluator,
            IOrderWebApiClient orderWebApiClient)
            : base(customRouteHandler, urlhelper, pageRuleVisitor, pageRuleEvaluator)
        {
            _sitesWebApiClient = sitesWebApiClient.CloneWithoutUserClaims();
            _logger = logger;
            _settings = settings;
            _orderWebApiClient = orderWebApiClient.CloneWithoutUserClaims();
        }

        [HttpGet]
        public async Task<IActionResult> Preview(string id)
        {
            var mobileNotificationTemplate = SiteContext.Theme.MobileNotificationTemplates.FirstOrDefault(x => x.Id.EqualsIgnoreCase(id));
            var queryStringParams = Request.Query;

            if (mobileNotificationTemplate == null)
            {
                return NotFound("Could not find a MobileNotification template for the current Theme.");
            }
            id = GetIdForTopic(id);
            var model = TestDataBroker.GetFileContents(id).FirstOrDefault() ?? new object();
            if (model != null)
            {
                var mobileNotificationTypeInfo = _smsMobileNotificationTypeInfo.FirstOrDefault(x => string.Equals(x.Topic, id, StringComparison.OrdinalIgnoreCase));
                if (mobileNotificationTypeInfo != null && mobileNotificationTypeInfo.ModelType == typeof(ShipmentNotification))
                {
                    var str = JsonConvert.SerializeObject(MergeNotificationParams(queryStringParams, model), CaseInsensitiveJsonSerializerSettings.Default);
                    model = await Convert(str, mobileNotificationTypeInfo);
                }
                else
                {
                    model = MergeNotificationParams(queryStringParams, model);
                }
            }

            return View(mobileNotificationTemplate.Template, model);
        }

        /// <summary>
        /// same topics are used for email and mobile and we want different testdata,
        /// so we are using test data (json) orderPickupReminder for previewing all other templates.
        /// this is only for preview renderer works as is.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        private string GetIdForTopic(string id)
        {
            switch (id)
            {
                case Topics.OrderPickupReady:
                case Topics.OrderPartialPickupReady:
                case Topics.OrderPickupReminder:
                    id = Topics.OrderPickupReminder;
                    break;
            }
            return id; 
        }

        [HttpPost]
        public async Task<IActionResult> Render([FromBody]SmsNotification notification)
        {
            
            User user = null;
            var mobileNotificationTypeInfo = _smsMobileNotificationTypeInfo.FirstOrDefault(x => string.Equals(x.Topic, notification.Topic, StringComparison.OrdinalIgnoreCase));
            var mobileNotificationTemplate = SiteContext.Theme.MobileNotificationTemplates.FirstOrDefault(x => x.Id.EqualsIgnoreCase(notification.Topic));

            if (mobileNotificationTemplate == null)
            {
                var warnMessage = "no templates defined for topic " + notification.Topic;
                _logger.Warn(warnMessage);
                return NotFound(warnMessage);
            }

            var site = (await _sitesWebApiClient.GetSite(SbApiContext.SiteId)).ReadAsSync();

            _logger.Info(string.Format("raw payload for topic:{0} messageId:{1}", notification.MessageId, notification.Topic), notification);

            var model = await Convert(notification.Payload, mobileNotificationTypeInfo);

            try
            {
                _logger.Info(string.Format("de-serialized payload for topic:{0} messageId:{1}", notification.MessageId, notification.Topic), model);
            }
            catch (Exception ex)
            {
                _logger.Error(ex);
            }

            if (model == null)
            {
                return StatusCode(500);
            }

            var renderedTemplate = await GetRenderedTemplate(notification, mobileNotificationTemplate, model, user, site);
            if (renderedTemplate.IsNullOrEmpty())
            {
                return null;
            }

            var response = new MobileNotificationResponse
            {
                Subject = (mobileNotificationTemplate.Title ?? notification.Topic),
                Body = renderedTemplate.Trim()
            };

            return Ok(response);
        }

        private async Task<string> GetRenderedTemplate(SmsNotification notification, VM.PageTypeDefinition mobileNotificationTemplate, object model, User user, Site site)
        {
            var viewEngine = HttpContext.RequestServices.GetService<HyprViewEngine>();
            var view = viewEngine.FindPageView(mobileNotificationTemplate.Template);

            if (view == null)
            {
                var errMesage = string.Format("no template found for view:{0} topic{1}", mobileNotificationTemplate.Template,
                    notification.Topic);
                _logger.Warn(errMesage);
                return String.Empty;
            }

            ViewData.Model = model;
            ViewData["User"] = user;
            ViewData["domainName"] = site.Domains.Where(x => x.IsPrimary).Select(x => x.DomainName).FirstOrDefault();
           // ViewData["storefrontOrderAttributes"] = await GetShopperOrderAttributes();

            var context = new HyprViewContext(HttpContext, ViewData);
            return await Render(view, context);
        }

        private static async Task<string> Render(HyprView view, HyprViewContext context)
        {
            var stringWriter = new StringWriter();
            await view.AsyncRender(context, stringWriter);
            await stringWriter.FlushAsync();
            return stringWriter.ToString();
        }

        private async Task<object> Convert(string json, MobileNotificationTypeInfo mnti)
        {
            if (mnti == null || mnti.ModelType == null)
            {
                return JsonConvert.DeserializeObject(json, CaseInsensitiveJsonSerializerSettings.Default);
            }
            var obj = JsonConvert.DeserializeObject(json, mnti.ModelType, CaseInsensitiveJsonSerializerSettings.Default);

            if (obj is ShipmentNotification shipmentModel)
            {
                switch (mnti.Topic)
                {
                    case Topics.StoreItemsCanceled:
                    case Topics.ShipmentAssigned:
                        shipmentModel.StoreId = shipmentModel.FulfillmentLocationCode;
                        var shipmentLink = await CreateTinyUrl($"{ANNONYMOUS_NOTIFICATION_URL_FRAGMENT}/{SHIPMENT_URL_FRAGMENT}/{shipmentModel.ShipmentNumber}/{shipmentModel.OrderId}");
                        var fullfillerLink = await CreateTinyUrl($"{FULFILLER_URL_FRAGMENT}/{shipmentModel.ShipmentType}/{shipmentModel.ShipmentNumber}");
                        shipmentModel.ShipmentUrl = shipmentLink.Link;
                        shipmentModel.FulfillerUrl = fullfillerLink.Link;     
                        break;
                    case Topics.IntransitConfirmation:
                        var landingPage = await CreateTinyUrl($"{ANNONYMOUS_NOTIFICATION_URL_FRAGMENT}/{CURBSIDEARRIVE}/{shipmentModel.ShipmentNumber}/{shipmentModel.OrderId}");
                        shipmentModel.ShipmentUrl = landingPage.Link;
                        break;
                    case Topics.CustomerAtCurbside:
                    case Topics.CustomerIntransit:
                        ViewData["customerName"] = $"{shipmentModel.Destination?.DestinationContact?.FirstName} {shipmentModel.Destination?.DestinationContact?.LastNameOrSurname}";
                        break;
                    case Topics.CurbsideReady:
                        var shipmentReadyLink = await CreateTinyUrl($"{ANNONYMOUS_NOTIFICATION_URL_FRAGMENT}/{CURBSIDESHIPMENTREADY}/{shipmentModel.ShipmentNumber}/{shipmentModel.OrderId}");
                        shipmentModel.ShipmentUrl = shipmentReadyLink.Link;
                        break;
                    case Topics.PartialCurbsideReady:
                        var partialReadyLink = await CreateTinyUrl($"{ANNONYMOUS_NOTIFICATION_URL_FRAGMENT}/{PARTIALCURBSIDEREADY}/{shipmentModel.ShipmentNumber}/{shipmentModel.OrderId}");
                        shipmentModel.ShipmentUrl = partialReadyLink.Link;
                        break;
                    case Topics.ShipmentItemCanceled:
                        shipmentModel.IsShopperCanceled = shipmentModel.CanceledItems.Any(a => string.Equals(a.CanceledReason.ReasonCode, "PurchaseNeverPickedUp", StringComparison.OrdinalIgnoreCase));
                        break;
                    case Topics.OrderPickupReady:
                    case Topics.OrderPartialPickupReady:
                    case Topics.OrderPickupReminder:
                        shipmentModel.StoreId = shipmentModel.FulfillmentLocationCode;
                        var shipmentPickupLink = await CreateTinyUrl($"{ANNONYMOUS_NOTIFICATION_URL_FRAGMENT}/{SHIPMENT_PICKUP_READY}/{shipmentModel.ShipmentNumber}/{shipmentModel.OrderId}");
                        shipmentModel.ShipmentUrl = shipmentPickupLink.Link;
                        break;                    
                    case Topics.ShipmentFulfilled:
                        var surveyLink = await CreateTinyUrl($"{ANNONYMOUS_NOTIFICATION_URL_FRAGMENT}/{CURBSIDESURVEY}/{shipmentModel.ShipmentNumber}/{shipmentModel.OrderId}");
                        shipmentModel.ShipmentUrl = surveyLink.Link;
                        break;
                    default:
                        break;
                }
            }

            return obj;
        }

        private JObject MergeNotificationParams(IQueryCollection query, object model)
        {

            var z = query["queryParams"];

            var notificationParams = JsonConvert.DeserializeObject<JObject>(z.ToString(), CaseInsensitiveJsonSerializerSettings.Default);
            var returnObj = model is JObject ? ((JObject)model) : JObject.FromObject(model);
            returnObj.Merge(notificationParams);
            return returnObj;
        }

        private async Task<KuttLink> CreateTinyUrl(string url)
        {
            var site = (await _sitesWebApiClient.GetSite(SbApiContext.SiteId)).ReadAsSync();
            var kuttServerUrl = "http://" + _settings.AppSettings(KUTTIT_DEFAULT_DOMAIN_CONFIG);
            var kuttApi = new KuttApiV2(_settings.AppSettings(KUTTIT_API_KEY_CONFIG), kuttServerUrl);
            var kuttCustomDomain = _settings.AppSettings(KUTTIT_CUSTOM_DOMAIN_CONFIG);
            var domainName = site.Domains.Where(x => x.IsPrimary).Select(x => x.DomainName).FirstOrDefault();

            var longUrl = $"http://{domainName}/{url}";

            return await kuttApi.CreateLinkAsync(longUrl, reuse: true, domain: kuttCustomDomain);
        }
    }
}