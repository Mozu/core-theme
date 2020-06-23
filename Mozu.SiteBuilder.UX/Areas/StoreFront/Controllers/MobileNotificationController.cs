using Kibo.Fulfillment.Contracts.Model;
using KuttSharp;
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
using Shipment = Mozu.CommerceRuntime.Contracts.Fulfillment.Shipment;
using VM = Mozu.SiteBuilder.Mvc.Models.CMS;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    public class Topics
    {
        public const string ShipmentAssigned = "shipment.assigned";
        public const string ShipmentItemCanceled = "shipment.itemscanceled";
    }

    public class ShipmentNotification : Shipment
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

        private static readonly List<MobileNotificationTypeInfo> _smsMobileNotificationTypeInfo;

        private readonly ISitesWebApiClient _sitesWebApiClient;
        private readonly ILogger _logger;
        private readonly ISettings _settings;

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
                }
            };
        }

        public MobileNotificationController(
            ICustomerAccountWebApiClient customerAccountWebApiClient,
            ISitesWebApiClient sitesWebApiClient,
            ILogger logger,
            ISettings settings,
            ICustomRouteHandler customRouteHandler,
            Lazy<UrlHelper> urlhelper,
            Lazy<ExpressionEvaluatorVisitor<CmsPageRuleContext>> pageRuleVisitor,
            Lazy<IExpressionEvaluator> pageRuleEvaluator)
            : base(customRouteHandler, urlhelper, pageRuleVisitor, pageRuleEvaluator)
        {
            _sitesWebApiClient = sitesWebApiClient.CloneWithoutUserClaims();
            _logger = logger;
            _settings = settings;
        }

        [HttpGet]
        public async Task<HttpResponseMessage> Preview(string id)
        {
            var mobileNotificationTemplate = SiteContext.Theme.MobileNotificationTemplates.FirstOrDefault(x => x.Id.EqualsIgnoreCase(id));
            var queryStringParams = Request.GetQueryNameValuePairs();


            if (mobileNotificationTemplate == null)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Could not find a MobileNotification template for the current Theme.");
            }

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

            var shipment = model as Shipment;

            ShipmentNotification notificationModel = new ShipmentNotification();
            notificationModel.StoreId = shipment.FulfillmentLocationCode;

            var site = (await _sitesWebApiClient.GetSite(SbApiContext.SiteId)).ReadAsSync();
            var kuttServerUrl = "http://" + _settings.AppSettings(KUTTIT_DEFAULT_DOMAIN_CONFIG);
            var kuttApi = new KuttApiV2(_settings.AppSettings(KUTTIT_API_KEY_CONFIG), kuttServerUrl);
            var kuttCustomDomain = _settings.AppSettings(KUTTIT_CUSTOM_DOMAIN_CONFIG);

            if (shipment != null)
            {
                var domainName = site.Domains.Where(x => x.IsPrimary).Select(x => x.DomainName).FirstOrDefault();
                var fulfillerUrl = $"http://{domainName}/{FULFILLER_URL_FRAGMENT}/{shipment.ShipmentType}/{shipment.Number}";
                var shipmentUrl = $"http://{domainName}/{ANNONYMOUS_NOTIFICATION_URL_FRAGMENT}/{SHIPMENT_URL_FRAGMENT}/{shipment.Number}/{shipment.OrderId}";

                var shipmentLink = await kuttApi.CreateLinkAsync(shipmentUrl, reuse: true, domain: kuttCustomDomain);
                var fullfillerLink = await kuttApi.CreateLinkAsync(fulfillerUrl, reuse: true, domain: kuttCustomDomain);

                notificationModel.ShipmentUrl = shipmentLink.Link;
                notificationModel.FulfillerUrl = fullfillerLink.Link;
                notificationModel.ShipmentType = shipment.ShipmentType;
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError);
            }
            return Request.CreateResponse(HttpStatusCode.OK, View(mobileNotificationTemplate.Template, notificationModel));
        }

        [HttpPost]
        public async Task<HttpResponseMessage> Render(StoreSmsNotification notification)
        {
            User user = null;
            var mobileNotificationTypeInfo = _smsMobileNotificationTypeInfo.FirstOrDefault(x => string.Equals(x.Topic, notification.Topic, StringComparison.OrdinalIgnoreCase));
            var mobileNotificationTemplate = SiteContext.Theme.MobileNotificationTemplates.FirstOrDefault(x => x.Id.EqualsIgnoreCase(notification.Topic));

            var shipment = JsonConvert.DeserializeObject<ResourceOfShipment>(notification.Payload);

            if (mobileNotificationTemplate == null)
            {
                var warnMessage = "no templates defined for topic " + notification.Topic;
                _logger.Warn(warnMessage);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, warnMessage);
            }

            var site = (await _sitesWebApiClient.GetSite(SbApiContext.SiteId)).ReadAsSync();

            _logger.Info(string.Format("raw payload for topic:{0} messageId:{1}", notification.MessageId, notification.Topic), notification);          

            try
            {
                _logger.Info(string.Format("de-serialized payload for topic:{0} messageId:{1}", notification.MessageId, notification.Topic), shipment);
            }
            catch (Exception ex)
            {
                _logger.Error(ex);
            }

            ShipmentNotification notificationModel = new ShipmentNotification();
            
            var kuttServerUrl = "http://" + _settings.AppSettings(KUTTIT_DEFAULT_DOMAIN_CONFIG);
            var kuttApi = new KuttApiV2(_settings.AppSettings(KUTTIT_API_KEY_CONFIG), kuttServerUrl);
            var kuttCustomDomain = _settings.AppSettings(KUTTIT_CUSTOM_DOMAIN_CONFIG);
            
            if (shipment != null)
            {
                var domainName = site.Domains.Where(x => x.IsPrimary).Select(x => x.DomainName).FirstOrDefault();
                var fulfillerUrl = $"http://{domainName}/{FULFILLER_URL_FRAGMENT}/{shipment.ShipmentType}/{shipment.ShipmentNumber}";
                var shipmentUrl = $"http://{domainName}/{ANNONYMOUS_NOTIFICATION_URL_FRAGMENT}/{SHIPMENT_URL_FRAGMENT}/{shipment.ShipmentNumber}/{shipment.OrderId}";

                var shipmentLink = await kuttApi.CreateLinkAsync(shipmentUrl, reuse: true, domain: kuttCustomDomain);
                var fullfillerLink = await kuttApi.CreateLinkAsync(fulfillerUrl, reuse: true, domain: kuttCustomDomain);

                notificationModel.ShipmentUrl = shipmentLink.Link;
                notificationModel.FulfillerUrl = fullfillerLink.Link;
                notificationModel.StoreId = shipment.FulfillmentLocationCode;
                notificationModel.ShipmentType = shipment.ShipmentType;
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError);
            }

            var renderedTemplate = await GetRenderedTemplate(notification, mobileNotificationTemplate, notificationModel, user, site);
            if (renderedTemplate.IsNullOrEmpty())
            {
                return null;
            }

            var response = new MobileNotificationResponse
            {
                Subject = (mobileNotificationTemplate.Title ?? notification.Topic),
                Body = renderedTemplate
            };

            return Request.CreateResponse(HttpStatusCode.OK, response);
        }

        private async Task<string> GetRenderedTemplate(StoreSmsNotification notification, VM.PageTypeDefinition mobileNotificationTemplate, object model, User user, Site site)
        {
            var viewEngine = Request.Resolve<HyprViewEngine>();
            var view = viewEngine.FindPageView(mobileNotificationTemplate.Template);

            if (view == null)
            {
                var errMesage = string.Format("no template found for view:{0} topic{1}", mobileNotificationTemplate.Template,
                    notification.Topic);
                _logger.Warn(errMesage);
                return String.Empty;
            }

            var vdd = new ViewDataDictionary
            {
                ["model"] = model,
                ["User"] = user,
                ["domainName"] = site.Domains.Where(x => x.IsPrimary).Select(x => x.DomainName).FirstOrDefault(),
                ["storefrontOrderAttributes"] = await GetShopperOrderAttributes()
            };

            var context = new HyprViewContext(Request, vdd);
            return await Render(view, context);
        }

        private static async Task<string> Render(HyprView view, HyprViewContext context)
        {
            var stringWriter = new StringWriter();
            await view.AsyncRender(context, stringWriter);
            await stringWriter.FlushAsync();
            return stringWriter.ToString();
        }

        private async Task<object> Convert(string str, MobileNotificationTypeInfo mobileNotificationTypeInfo)
        {
            var obj = JsonConvert.DeserializeObject(str, mobileNotificationTypeInfo.ModelType, CaseInsensitiveJsonSerializerSettings.Default);
            return obj;
        }

        private JObject MergeNotificationParams(IEnumerable<KeyValuePair<string, string>> query, object model)
        {
            var z = query.FirstOrDefault(y => y.Key.EqualsIgnoreCase("queryParams"), new KeyValuePair<string, string>("", ""));

            var notificationParams = JsonConvert.DeserializeObject<JObject>(z.Value, CaseInsensitiveJsonSerializerSettings.Default);
            var returnObj = model is JObject ? ((JObject)model) : JObject.FromObject(model);
            returnObj.Merge(notificationParams);
            return returnObj;
        }
    }
}