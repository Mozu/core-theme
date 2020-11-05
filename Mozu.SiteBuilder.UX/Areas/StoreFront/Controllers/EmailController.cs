using Mozu.CommerceRuntime.Contracts.Checkouts;
using Mozu.CommerceRuntime.Contracts.Clients;
using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Primitives;
using Mozu.CommerceRuntime.Contracts.Fulfillment;
using Mozu.CommerceRuntime.Contracts.Orders;
using Mozu.CommerceRuntime.Contracts.Returns;
using Mozu.Content.Contracts.Clients;
using Mozu.Core.Api.Client;
using Mozu.Core.Extensions;
using Mozu.Core.Logging;
using Mozu.Core.Messaging.Contracts.Notification;
using Mozu.Customer.Contracts.Clients;
using Mozu.Location.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Helpers;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.Mvc.TestData;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Filters;
using Mozu.SiteBuilder.UX.Hypr.Tags;
using Mozu.SiteBuilder.UX.Models.Admin.Email;
using Mozu.SiteBuilder.UX.Models.Customers;
using Mozu.SiteSettings.Order.Contracts.Clients;
using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using DC = Mozu.Content.Contracts;
using VM = Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.Core.Expressions;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.Core.Configuration;
using Fulfillment = Kibo.Fulfillment.Contracts.Model;
using System.Globalization;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    public class ReturnEmail : Return
    {
        public bool IsMock { get; set; }
        public Order Order { get; set; }
        public Location.Contracts.Location StoreLocation { get; set; }
    }

    public class CheckoutEmail : Checkout
    {
        public List<Order> Orders { get; set; }
        public List<Location.Contracts.Location> Locations { get; set; }
    }

    public class ShipmentEmail : Fulfillment.EntityModelOfShipment
    {
        public Order Order { get; set; }
        public Location.Contracts.Location StoreLocation { get; set; }
        public bool IsShopperCanceled { get; set; }
    }
    
    public class OrderEmail : Order {
        public List<Location.Contracts.Location> Locations { get; set; }
        public bool IsCurbside { get; set; }
    }
    
    public class GatewayGiftCardEmail  : EmailGatewayGiftCard
    {
        public Order Order { get; set; }
    }

    [ContextInitialization]
    [IgnoreDataViewMode]
    public class EmailController : CmsPagesController
    {
        private readonly ISitesWebApiClient _sitesWebApiClient;
        private readonly ILogger _logger;
        private readonly ILocationRuntimeWebApiClient _locationRuntimeWebApiClient;
        private readonly ICustomerAccountWebApiClient _customerAccountWebApiClient;
        private readonly ILocationAdminWebApiClient _locationAdminWebApi;
        private static readonly List<EmailTypeInfo> g_emailTypeInfos;
        private readonly IReturnSettingsWebApiClient _returnSettingsWebApiClient;
        private readonly IOrderWebApiClient _orderWebApiClient;

        static EmailController()
        {
            g_emailTypeInfos = new List<EmailTypeInfo>
                                   {
                                       new EmailTypeInfo
                                           {
                                               ModelType = typeof (ReturnEmail),
                                               Topic = Topics.ReturnCreated
                                           },
                                       new EmailTypeInfo
                                           {
                                               ModelType = typeof (ReturnEmail),
                                               Topic = Topics.ReturnAuthorized
                                           },
                                       new EmailTypeInfo
                                           {
                                               ModelType = typeof (ReturnEmail),
                                               Topic = Topics.ReturnRejected
                                           },
                                       new EmailTypeInfo
                                           {
                                               ModelType = typeof (ReturnEmail),
                                               Topic = Topics.ReturnClosed
                                           },
                                       new EmailTypeInfo
                                           {
                                               ModelType = typeof (ReturnEmail),
                                               Topic = Topics.ReturnChanged
                                           },
                                       new EmailTypeInfo
                                           {
                                               ModelType = typeof (Order),
                                               Topic = Topics.RefundCreated
                                           },
                                       new EmailTypeInfo
                                       {
                                           ModelType = typeof (CheckoutEmail),
                                           Topic = Topics.CheckoutEmailTopic
                                       },
                                       new EmailTypeInfo
                                           {
                                               ModelType = typeof (OrderEmail),
                                               Topic = Topics.OrderEmailTopic
                                           },
                                       new EmailTypeInfo
                                           {
                                               ModelType = typeof (Order),
                                               Topic = Topics.OrderShippedTopic
                                           },
                                       new EmailTypeInfo
                                           {
                                               ModelType = typeof (Mozu.ProductRuntime.Contracts.Product),
                                               Topic = Topics.InStockNotification
                                           },
                                       new EmailTypeInfo
                                           {
                                               ModelType = typeof (GiftCardEmailOrderCredit),
                                               Topic = Topics.GiftCardCreated
                                           },

                                       new EmailTypeInfo
                                           {
                                               ModelType = typeof (Order),
                                               Topic = Topics.OrderCancellation
                                           },
                                       new EmailTypeInfo
                                           {
                                               ModelType = typeof (ShipmentEmail),
                                               Topic = Topics.Backorder
                                           },
                                       //new EmailTypeInfo
                                       //    {
                                       //        ModelType = typeof (ShipmentEmail),
                                       //        Topic = Topics.BackorderUpdate
                                       //    },
                                       new EmailTypeInfo
                                           {
                                               ModelType = typeof (ShipmentEmail),
                                               Topic = Topics.ShipmentConfirmation
                                           },
                                       new EmailTypeInfo
                                           {
                                               ModelType = typeof (ShipmentEmail),
                                               Topic = Topics.OrderPickupReady
                                           },
                                       new EmailTypeInfo
                                           {
                                               ModelType = typeof (ShipmentEmail),
                                               Topic = Topics.OrderPickupReminder
                                           },
                                       /*new EmailTypeInfo
                                           {
                                               ModelType = typeof (Shipment),
                                               Topic = Topics.ShipmentItemBackordered
                                           },*/
                                       new EmailTypeInfo
                                           {
                                               ModelType = typeof (ShipmentEmail),
                                               Topic = Topics.ShipmentBackorderDateChanged
                                           },
                                        new EmailTypeInfo
                                           {
                                               ModelType = typeof (ShipmentEmail),
                                               Topic = Topics.TransferShipmentCreated
                                           },
                                        new EmailTypeInfo
                                           {
                                               ModelType = typeof (ShipmentEmail),
                                               Topic = Topics.TransferShipmentShipped
                                           },
                                         new EmailTypeInfo
                                           {
                                               ModelType = typeof (ShipmentEmail),
                                               Topic = Topics.ShipmentItemCanceled
                                           },
                                        new EmailTypeInfo
                                           {
                                               ModelType = typeof (ShipmentEmail),
                                               Topic = Topics.ShipmentAssigned
                                           },
                                        new EmailTypeInfo
                                           {
                                               ModelType = typeof (ShipmentEmail),
                                               Topic = Topics.PartialPickupReady
                                           },
                                        new EmailTypeInfo
                                           {
                                               ModelType = typeof (ShipmentEmail),
                                               Topic = Topics.TransferShipmentCreatedByFulfiller 
                                           },
                                        new EmailTypeInfo
                                           {
                                               ModelType = typeof (ShipmentEmail),
                                               Topic = Topics.IntransitConfirmation
                                           },
                                        new EmailTypeInfo
                                           {
                                               ModelType = typeof (ShipmentEmail),
                                               Topic = Topics.CurbsideReady
                                           },
                                        new EmailTypeInfo
                                           {
                                               ModelType = typeof (ShipmentEmail),
                                               Topic = Topics.PartialCurbsideReady
                                           },
                                        new EmailTypeInfo
                                           {
                                               ModelType = typeof (GatewayGiftCardEmail),
                                               Topic = Topics.GatewayGiftCardCreated
                                           }

                };
        }

        public EmailController(
            ICustomerAccountWebApiClient customerAccountWebApiClient,
            ISitesWebApiClient sitesWebApiClient,
            ILogger<EmailController> logger,
            ILocationRuntimeWebApiClient locationRuntimeWebApiClient,
            ICustomRouteHandler customRouteHandler,
            IOrderWebApiClient orderWebApiClient,
            ILocationAdminWebApiClient locationAdminWebApi,
            IReturnSettingsWebApiClient returnSettingsWebApiClient,
            Lazy<UrlHelper> urlhelper,
            Lazy<ExpressionEvaluatorVisitor<CmsPageRuleContext>> pageRuleVisitor,
            Lazy<IExpressionEvaluator> pageRuleEvaluator
            ) //why does this extend CMSPageController??  Ugh...
            : base(customRouteHandler, urlhelper, pageRuleVisitor, pageRuleEvaluator)
        {
            _sitesWebApiClient = sitesWebApiClient.CloneWithoutUserClaims();
            _logger = logger;
            _customerAccountWebApiClient = customerAccountWebApiClient;
            _locationRuntimeWebApiClient = locationRuntimeWebApiClient.CloneWithoutUserClaims();
            _orderWebApiClient = orderWebApiClient.CloneWithoutUserClaims();
            _locationAdminWebApi = locationAdminWebApi.CloneWithoutUserClaims();
            _returnSettingsWebApiClient = returnSettingsWebApiClient.CloneWithoutUserClaims();
        }

        //
        // GET: /StoreFront/Email/
        [HttpGet]
        public async Task<IActionResult> Preview(string id)
        {
            var locationCode = string.Empty;

            var emailTemplate = SiteContext.Theme.EmailTemplates.FirstOrDefault(x => x.Id.EqualsIgnoreCase(id));
            var queryStringParams = Request.Query;
            if (emailTemplate == null)
            {
                return NotFound("could not find an email template for the current Theme.");
            }

            var model = TestDataBroker.GetFileContents(id).FirstOrDefault() ?? new object();
            if (model != null)
            {
                var emailTypeInfo = g_emailTypeInfos.FirstOrDefault(x => string.Equals(x.Topic, id, StringComparison.OrdinalIgnoreCase));
                if (emailTypeInfo != null && emailTypeInfo.ModelType == typeof(Order))
                {
                    var str = JsonConvert.SerializeObject(MergeEmailParams(queryStringParams, model), CaseInsensitiveJsonSerializerSettings.Default);
                    model = await Convert(str, emailTypeInfo);
                    locationCode = (model is OrderEmail orderEmail) ? orderEmail.LocationCode : string.Empty;
                }

                else
                {
                    model = MergeEmailParams(queryStringParams, model);
                    var locationModel = JsonConvert.DeserializeObject(JsonConvert.SerializeObject(model, emailTypeInfo.ModelType, CaseInsensitiveJsonSerializerSettings.Default), emailTypeInfo.ModelType, CaseInsensitiveJsonSerializerSettings.Default);
                    locationCode = (locationModel is ReturnEmail returnEmail) ? returnEmail.LocationCode : string.Empty;
                }
            }

            var site = (await _sitesWebApiClient.GetSite(SbApiContext.SiteId)).ReadAsSync();
            var res = await Page("emailTemplateContent@mozu", GetCmsPage(emailTemplate));

            PageContext.CmsContext.Page.DocumentTypeFQN = "emailTemplateContent@mozu";
            PageContext.PageType = "email";

            Mvc.ActionResults.ViewResult vr = null;
            if (res is OkObjectResult objRes)
            {
                vr = objRes.Value as Mvc.ActionResults.ViewResult;
                if (vr == null)
                {
                    return Conflict("could not fetch template content page.");
                }

                vr.ViewName = emailTemplate.Template;
                var doc = (DC.Document)vr.ViewData.Model;
                if (doc != null)
                {
                    doc.Set("page_type_definition", id);
                }

                ViewData["content"] = vr.ViewData.Model;
            }

            ViewData["domainName"] = site.Domains.Where(x => x.IsPrimary).Select(x => x.DomainName).FirstOrDefault();
            ViewData["rmaLocation"] = locationCode.IsNullOrEmpty() ? await GetDefaultReturnLocation() : await GetStorageLocation(locationCode);

            ViewData["storefrontOrderAttributes"] = await GetShopperOrderAttributes();

            return Ok(View(emailTemplate.Template, model));
        }

        [HttpPost]
        public async Task<IActionResult> Render([FromBody]EmailNotification notification)
        {
            User user = null;
            var emailTypeInfo = g_emailTypeInfos.FirstOrDefault(x => string.Equals(x.Topic, notification.Topic, StringComparison.OrdinalIgnoreCase));
            var emailTemplate = SiteContext.Theme.EmailTemplates.FirstOrDefault(x => x.Id.EqualsIgnoreCase(notification.Topic));

            if (emailTemplate == null)
            {
                var warnMessage = "no templates defined for topic " + notification.Topic;
                _logger.Warn(warnMessage);
                return StatusCode((int)HttpStatusCode.Gone, warnMessage);
            }

            if (notification.MessagePublishingContext != null && !string.IsNullOrEmpty(notification.MessagePublishingContext.CustomerId))
            {
                user = await TryGetUser(notification);
                PageContext.User = user;
            }

            var site = (await _sitesWebApiClient.GetSite(SbApiContext.SiteId)).ReadAsSync();
            var res = await Page("emailTemplateContent@mozu", GetCmsPage(emailTemplate));
            if (PageContext != null)
            {
                PageContext.PageType = "email";
            }
            object cmdContent = null;

            Mvc.ActionResults.ViewResult vr = null;
            if (res is OkObjectResult objRes)
            {
                vr = objRes.Value as Mvc.ActionResults.ViewResult;
                if (vr != null)
                {
                    ViewData["content"] = vr.ViewData.Model;
                    cmdContent = vr.ViewData.Model;
                }
            }
                _logger.Info($"raw payload for topic:{notification.MessageId} messageId:{notification.Topic}", notification);

            var model = await Convert(notification.Payload, emailTypeInfo);

            try
            {
                _logger.Info($"de-serialized payload for topic:{notification.MessageId} messageId:{notification.Topic}", model);
            }
            catch (Exception ex)
            {
                _logger.Error(ex);
            }

            var renderedTemplate = await GetRenderedTemplate(notification, emailTemplate, model, cmdContent, user, site);
            if (renderedTemplate.IsNullOrEmpty())
            {
                return null;
            }

            var mozuDocument = (cmdContent != null) ? (Mozu.Content.Contracts.Document)cmdContent : null;
            var subjectFromVrModel = (mozuDocument != null) ? (string)mozuDocument.Properties["subject"] : "";

            var response = new EmailResponse
            {
                Subject = !string.IsNullOrWhiteSpace(subjectFromVrModel) ? subjectFromVrModel : (emailTemplate.Title ?? notification.Topic),
                Body = renderedTemplate
            };

            return Ok(response);
        }

        private async Task<User> TryGetUser(EmailNotification notification)
        {
            try
            {
                var dcUser =
                    (await _customerAccountWebApiClient.CloneWithoutUserClaims().GetAccount(int.Parse(notification.MessagePublishingContext.CustomerId)))
                    .ReadAsSync();

                return new User
                {
                    Email = dcUser.EmailAddress,
                    FirstName = dcUser.FirstName,
                    LastName = dcUser.LastName,
                    UserId = dcUser.UserId,
                    IsAnonymous = dcUser.IsAnonymous,
                    AccountId = dcUser.Id
                };
            }
            catch (Core.Api.Client.Exceptions.ApiWebClientException)
            {
                return null;
            }
        }

        private async Task<string> GetRenderedTemplate(EmailNotification notification, VM.PageTypeDefinition emailTemplate, object model, object cmdContent, User user, Site site)
        {
            var viewEngine = Request.HttpContext.RequestServices.Resolve<HyprViewEngine>();
            var view = viewEngine.FindPageView(emailTemplate.Template);

            if (view == null)
            {
                var errMesage = $"no template found for view:{emailTemplate.Template} topic{notification.Topic}";
                _logger.Warn(errMesage);
                return string.Empty;
            }

            var locationCode = (model is ReturnEmail returnEmail) ? returnEmail.LocationCode : string.Empty;

            ViewData.Model = model;
            ViewData["content"] = cmdContent;
            ViewData["User"] = user;
            ViewData["rmaLocation"] = locationCode.IsNullOrEmpty() ? await GetDefaultReturnLocation() : await GetStorageLocation(locationCode);
            ViewData["domainName"] = site.Domains.Where(x => x.IsPrimary).Select(x => x.DomainName).FirstOrDefault();
            ViewData["storefrontOrderAttributes"] = await GetShopperOrderAttributes();

            var context = new HyprViewContext(Request.HttpContext, ViewData);
            return await Render(view, context);
        }

        //private async Task<Location.Contracts.Location> GetDirectShipLocationOrDefault()
        //{
        //    var locations = await _locationRuntimeWebApiClient.GetDirectShipLocation();
        //    return locations.ResponseMessage.IsSuccessStatusCode ? locations.ReadAsSync() : null;
        //}

        private async Task<Location.Contracts.Location> GetDefaultReturnLocation()
        {
            var returnSettings = await _returnSettingsWebApiClient.GetReturnSettings();
            var locationCode = returnSettings.ResponseMessage.IsSuccessStatusCode ? (returnSettings.ReadAsSync())?.DefaultShippingLocation : null;
            if (!string.IsNullOrEmpty(locationCode))
            {
                var shippingLocation = await _locationAdminWebApi.GetLocation(locationCode);
                return shippingLocation.ResponseMessage.IsSuccessStatusCode ? shippingLocation.ReadAsSync() : null;
            }

            return null;
        }

        private static async Task<string> Render(HyprView view, HyprViewContext context)
        {
            var stringWriter = new StringWriter();
            await view.AsyncRender(context, stringWriter);
            await stringWriter.FlushAsync();
            return stringWriter.ToString();
        }

        private async Task<object> Convert(string json, EmailTypeInfo eti)
        {
            if (eti == null || eti.ModelType == null)
            {
                return JsonConvert.DeserializeObject(json, CaseInsensitiveJsonSerializerSettings.Default);
            }
            var obj = JsonConvert.DeserializeObject(json, eti.ModelType, CaseInsensitiveJsonSerializerSettings.Default);
            var order = obj as Order;
            if (order?.Items != null && order.Packages != null && order.Packages.Count > 0)
            {
                var ht = new Hashtable(StringComparer.OrdinalIgnoreCase);

                foreach (var x in (order.Items).Where(x => x != null))
                {
                    if (!string.IsNullOrEmpty(x.Product.VariationProductCode))
                    {
                        ht[$"{x.Product.VariationProductCode}.{x.LineId}"] = x.Product;
                    }
                    ht[$"{x.Product.ProductCode}.{x.LineId}"] = x.Product;

                    foreach (var productBundledProduct in x.Product.BundledProducts)
                    {
                        ht[$"{productBundledProduct.ProductCode}.{x.LineId}"] = productBundledProduct;
                    }
                }

                foreach (var p in order.Packages.Where(x => x.Items != null))
                {
                    for (var i = 0; i < p.Items.Count; i++)
                    {
                        var packageItem = p.Items[i];
                        p.Items[i] = new MyPackageItem()
                        {
                            FulfillmentItemType = packageItem.FulfillmentItemType,
                            Product = ht[$"{packageItem.ProductCode}.{packageItem.LineId}"],
                            ProductCode = packageItem.ProductCode,
                            Quantity = packageItem.Quantity
                        };
                    }
                }
            }

            if (obj is ReturnEmail returnEmail)
            {
                if (returnEmail.IsMock)
                {
                    returnEmail.Order = TestDataBroker.GetFileContents<Order>("order.changed").First();
                }
                else
                {
                    returnEmail.Order = (await _orderWebApiClient.GetOrder(returnEmail.OriginalOrderId)).ReadAsSync();
                    var locationCode = returnEmail.LocationCode;
                    if (!locationCode.IsNullOrEmpty())
                    {
                        var location = (await _locationRuntimeWebApiClient.GetLocation(locationCode)).ReadAsSync();
                        FormatRegularHours(location);
                        returnEmail.StoreLocation = location;
                    }
                }

            }

            if (obj is CheckoutEmail checkoutEmail)
            {
                var checkoutOrderSearch = (await _orderWebApiClient.GetOrders(filter: $"parentCheckoutId eq {checkoutEmail.Id}")).ReadAsSync();
                checkoutEmail.Orders = checkoutOrderSearch.Items;

                var locations = checkoutEmail.Items.Where(x => !string.IsNullOrEmpty(x.FulfillmentLocationCode) && x.FulfillmentMethod == CommerceRuntime.Contracts.Commerce.FulfillmentMethodConst.PICKUP).Select(x => $"code eq {x.FulfillmentLocationCode}");
                if (locations.SafeAny())
                {
                    var filter = locations.Aggregate((x, y) => x + " or " + y);
                    checkoutEmail.Locations = (await _locationAdminWebApi.GetLocations(filter: filter)).ReadAsSync().Items;
                }
            }

            if (obj is ShipmentEmail shipmentEmail)
            {
                //get order by shipment orderId
                var shipmentOrder = (await _orderWebApiClient.GetOrder(shipmentEmail.OrderId)).ReadAsSync();
                shipmentEmail.Order = shipmentOrder;
                if (shipmentOrder.Shipments.SafeAny())
                {
                    shipmentOrder.Shipments = shipmentOrder.Shipments.Where(x => x.Number == shipmentEmail.ShipmentNumber).ToList();
                }

                if(!shipmentEmail.CanceledItems.IsNullOrEmpty())
                {
                    shipmentEmail.IsShopperCanceled = shipmentEmail.CanceledItems.Any(a => string.Equals(a.CanceledReason.ReasonCode, "PurchaseNeverPickedUp", StringComparison.OrdinalIgnoreCase));
                }

                var locationCode = shipmentEmail.FulfillmentLocationCode;
                if (!locationCode.IsNullOrEmpty()) {
                    var location = (await _locationRuntimeWebApiClient.GetLocation(locationCode)).ReadAsSync();
                    FormatRegularHours(location);
                    shipmentEmail.StoreLocation = location;
                }
            }
               
            if (obj is OrderEmail orderEmail)
            {
                orderEmail.IsCurbside = orderEmail.Items.Where(x => !string.IsNullOrEmpty(x.FulfillmentLocationCode)).All(a => string.Equals(a.FulfillmentMethod, CommerceRuntime.Contracts.Commerce.FulfillmentMethodConst.CURBSIDE, StringComparison.OrdinalIgnoreCase));
                var locations = orderEmail.Items.Where(x => !string.IsNullOrEmpty(x.FulfillmentLocationCode) && x.FulfillmentMethod.In(CommerceRuntime.Contracts.Commerce.FulfillmentMethodConst.PICKUP, CommerceRuntime.Contracts.Commerce.FulfillmentMethodConst.CURBSIDE)).Select(x => $"code eq {x.FulfillmentLocationCode}");
                if (locations.SafeAny())
                {
                    var filter = locations.Aggregate((x, y) => x + " or " + y);
                    var allLocations  = (await _locationAdminWebApi.GetLocations(filter: filter)).ReadAsSync().Items;
                    foreach (Location.Contracts.Location item in allLocations)
                    {
                        FormatRegularHours(item);
                    }
                    orderEmail.Locations = allLocations;
                }
            }
            if (obj is GatewayGiftCardEmail giftCardEmail)
            {
                var giftCardOrder = (await _orderWebApiClient.GetOrder(giftCardEmail.OrderId)).ReadAsSync();

                giftCardEmail.Order = giftCardOrder;
            }

            return obj;
        }

        private JObject MergeEmailParams(IQueryCollection query, object model)
        {
            var add = query.TryGetValue("queryParams", out var vals);
            // .FirstOrDefault<string,StringValues>(pair => pair.Key.EqualsIgnoreCase(), new KeyValuePair<string, string>("", ""));

            var emailParams = JsonConvert.DeserializeObject<JObject>(add ? vals.ToString() : "", CaseInsensitiveJsonSerializerSettings.Default);

            var returnObj = model is JObject jObject ? jObject : JObject.FromObject(model);
            returnObj.Merge(emailParams);
            return returnObj;
        }

        private async Task<Location.Contracts.Location> GetStorageLocation(string locationCode)
        {
            if (!locationCode.IsNullOrEmpty())
            {
                var location = (await _locationRuntimeWebApiClient.GetLocation(locationCode)).ReadAsSync();
                FormatRegularHours(location);
                return location;
            }
            return null;
        }

        public class MyPackageItem : PackageItem
        {
            public object Product { get; set; }
        }

        private static string GetCmsPage(VM.PageTypeDefinition def)
        {
            return def.Id;
        }

        private void FormatRegularHours(Location.Contracts.Location location)
        {
            if (location.RegularHours == null || string.IsNullOrEmpty(location.RegularHours.TimeZone))
                return;

            void FormatHours(Location.Contracts.Hours hours)
            {
                //both openTime and close time always have hours, if isClosed is false.
                if (string.IsNullOrEmpty(hours.OpenTime) && string.IsNullOrEmpty(hours.CloseTime))
                    return;
                
                DateTime.TryParse(hours.OpenTime, out DateTime openTime);
                DateTime.TryParse(hours.CloseTime, out DateTime closeTime);
                hours.OpenTime = openTime.ToString("h:mm tt", CultureInfo.InvariantCulture);
                hours.CloseTime = closeTime.ToString("h:mm tt", CultureInfo.InvariantCulture);
            }

            FormatHours(location.RegularHours.Sunday);
            FormatHours(location.RegularHours.Monday);
            FormatHours(location.RegularHours.Tuesday);
            FormatHours(location.RegularHours.Wednesday);
            FormatHours(location.RegularHours.Thursday);
            FormatHours(location.RegularHours.Friday);
            FormatHours(location.RegularHours.Saturday);
        }

        public class Topics
        {
            public const string PasswordReset = "user.passwordreset";
            public const string NewUserCreated = "user.created";
            public const string OrderEmailTopic = "order.changed";
            public const string CheckoutEmailTopic = "checkout.changed";
            public const string OrderShippedTopic = "order.shipped";
            public const string ReturnChanged = "return.changed";
            public const string ReturnCreated = "return.created";
            public const string ReturnAuthorized = "return.authorized";
            public const string ReturnRejected = "return.rejected";
            public const string ReturnClosed = "return.closed";
            public const string RefundCreated = "refund.created";
            public const string InStockNotification = "product.instock";
            public const string GiftCardCreated = "giftcard.created";
            public const string OrderCancellation = "order.cancelled";
            public const string Backorder = "shipment.backordered";
            //public const string BackorderUpdate = "shipment.backorderdatechanged";
            public const string ShipmentConfirmation = "shipment.fulfilled";
            public const string OrderPickupReady = "shipment.pickupready";
            public const string OrderPickupReminder = "shipment.pickupreminder";
            //  public const string ShipmentItemBackordered = "shipment.itemBackordered";
            public const string ShipmentBackorderDateChanged = "shipment.backorderdatechanged";
			public const string ShipmentItemCanceled = "shipment.itemscanceled";
            public const string ShipmentAssigned = "shipment.assigned"; 
            public const string TransferShipmentCreatedByFulfiller = "shipment.transfercreatedbyfulfiller";
            public const string TransferShipmentCreated = "shipment.transfercreated";
            public const string TransferShipmentShipped = "shipment.transfershipped";
            public const string PartialPickupReady = "shipment.partialpickupready";
            public const string IntransitConfirmation = "shipment.intransitconfirmation";
            public const string CurbsideReady = "shipment.curbsideready"; 
            public const string PartialCurbsideReady = "shipment.partialcurbsideready";
            public const string GatewayGiftCardCreated = "gatewaygiftcard.created";
        }
    }

   
    public class EmailResponse
    {
        public string Subject { get; set; }
        public string Body { get; set; }
    }

    public class EmailTypeInfo
    {
        public string Topic { get; set; }

        public Type ModelType { get; set; }


        // public Type MappingType { get; set; }
    }
}
