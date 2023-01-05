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
using Kibo.Fulfillment.Contracts.Api;
using Fulfillment = Kibo.Fulfillment.Contracts.Model;
using Quote = Mozu.CommerceRuntime.Contracts.Quotes.Quote;
using System.Globalization;
using Mozu.CommerceRuntime.Contracts.Subscriptions;

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

        public List<Fulfillment.EntityModelOfShipment> OmsShipments { get; set; }

        public bool IsCurbside { get; set; }

        public bool hasPOSEItems { get; set; }

        public bool hasPickupItems { get; set; }
    }

    public class GatewayGiftCardEmail  : EmailGatewayGiftCard
    {
        public Order Order { get; set; } 
        public Fulfillment.EntityModelOfShipment Shipment { get; set; }
    }

    public class QuoteEmail : Quote
    {
        public Customer.Contracts.CustomerAccount B2BAccount { get; set; }
        public Customer.Contracts.B2BUserCollection B2BUsers { get; set; }
        public bool isShippable { get; set; }
        public bool IsSeller { get; set; }
    }

    public class PasswordResetEmail
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string ValidationToken { get; set; }
        public string UserId { get; set; }
        public bool IsPasswordSetEmail { get; set; }
    }

    public class NewUserEmail
    {
        public string UserEmailAddress { get; set; }
        public bool IsB2BAccount { get; set; }
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
        private readonly IShipmentControllerApiClient _shipmentControllerApiClient;
        private readonly ITenantsWebApiClient _tenantsWebApiClient;
        private readonly IB2BAccountWebApiClient _b2bAccountWebApiClient;

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
                                               ModelType = typeof (Order),
                                               Topic = Topics.OrderCancelFailed
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
                                               ModelType = typeof (OrderEmail),
                                               Topic = Topics.OrderCancellation
                                           },
                                       new EmailTypeInfo
                                           {
                                               ModelType = typeof (OrderEmail),
                                               Topic = Topics.OrderCancellationPOSE
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
                                           },
                                        new EmailTypeInfo
                                           {
                                               ModelType = typeof (ShipmentEmail),
                                               Topic = Topics.CustomerAtCurbside
                                           },
                                        new EmailTypeInfo
                                           {
                                               ModelType = typeof (ShipmentEmail),
                                               Topic = Topics.CustomerIntransit
                                           },
                                        new EmailTypeInfo
                                           {
                                               ModelType = typeof (QuoteEmail),
                                               Topic = Topics.QuoteSummary
                                           },
                                        new EmailTypeInfo
                                           {
                                               ModelType = typeof (PasswordResetEmail),
                                               Topic = Topics.PasswordReset
                                           },
                                        new EmailTypeInfo
                                           {
                                               ModelType = typeof (NewUserEmail),
                                               Topic = Topics.NewUserCreated
                                           },
                                        new EmailTypeInfo
                                           {
                                               ModelType = typeof (Customer.Contracts.CustomerAccount),
                                               Topic = Topics.B2BAccountCreated
                                           },
                                        new EmailTypeInfo
                                           {
                                               ModelType = typeof (Customer.Contracts.CustomerAccount),
                                               Topic = Topics.B2BAccountDenied
                                           },
                                        new EmailTypeInfo
                                           {
                                               ModelType = typeof (Customer.Contracts.CustomerAccount),
                                               Topic = Topics.B2BAccountInactive
                                           },
                                        new EmailTypeInfo
                                           {
                                               ModelType = typeof (QuoteEmail),
                                               Topic = Topics.QuoteInReview
                                           },
                                        new EmailTypeInfo
                                           {
                                               ModelType = typeof (QuoteEmail),
                                               Topic = Topics.QuoteReadyForCheckout
                                           },
                                        new EmailTypeInfo
                                           {
                                               ModelType = typeof (QuoteEmail),
                                               Topic = Topics.QuoteExpired
                                           },
                                        new EmailTypeInfo
                                           {
                                               ModelType = typeof (ShipmentEmail),
                                               Topic = Topics.DeliveryDateUpdated
                                           },
                                        new EmailTypeInfo
                                           {
                                               ModelType = typeof (ShipmentEmail),
                                               Topic = Topics.ReadyForDelivery
                                           },
                                        // subscription
                                        new EmailTypeInfo
                                           {
                                               ModelType = typeof (Subscription),
                                               Topic = Topics.SubscriptionActivated
                                           },
                                         new EmailTypeInfo
                                           {
                                               ModelType = typeof (Subscription),
                                               Topic = Topics.SubscriptionCancelled
                                           },
                                          new EmailTypeInfo
                                           {
                                               ModelType = typeof (Subscription),
                                               Topic = Topics.SubscriptionErrored
                                           },
                                           new EmailTypeInfo
                                           {
                                               ModelType = typeof (Subscription),
                                               Topic = Topics.SubscriptionPaused
                                           },
                                            new EmailTypeInfo
                                           {
                                               ModelType = typeof (Subscription),
                                               Topic = Topics.SubscriptionSkipped
                                           },
                                             new EmailTypeInfo
                                           {
                                               ModelType = typeof (Subscription),
                                               Topic = Topics.SubscriptionFrequencyChanged
                                           },
                                              new EmailTypeInfo
                                           {
                                               ModelType = typeof (Subscription),
                                               Topic = Topics.SubscriptionFulfillmentInfoUpdated
                                           },
                                               new EmailTypeInfo
                                           {
                                               ModelType = typeof (Subscription),
                                               Topic = Topics.SubscriptionPaymentUpdated
                                           },
                                                  new EmailTypeInfo
                                           {
                                               ModelType = typeof (Subscription),
                                               Topic = Topics.SubscriptionNextOrderDateChanged
                                           },
                                                 new EmailTypeInfo
                                           {
                                               ModelType = typeof (Subscription),
                                               Topic = Topics.SubscriptionItemAdded
                                           },
                                               new EmailTypeInfo
                                           {
                                               ModelType = typeof (Subscription),
                                               Topic = Topics.SubscriptionItemRemoved
                                           },
                                                   new EmailTypeInfo
                                           {
                                               ModelType = typeof (Subscription),
                                               Topic = Topics.SubscriptionItemQuantityUpdated
                                           },
                                                   new EmailTypeInfo
                                           {
                                               ModelType = typeof (Subscription),
                                               Topic = Topics.SubscriptionOrderReminder
                                           },
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
            IShipmentControllerApiClient shipmentControllerApiClient,
            ITenantsWebApiClient tenantsWebApiClient,
            Lazy<UrlHelper> urlhelper,
            Lazy<ExpressionEvaluatorVisitor<CmsPageRuleContext>> pageRuleVisitor,
            Lazy<IExpressionEvaluator> pageRuleEvaluator,
            IB2BAccountWebApiClient b2bAccountWebApiClient
            ) //why does this extend CMSPageController??  Ugh...
            : base(customRouteHandler, urlhelper, pageRuleVisitor, pageRuleEvaluator)
        {
            _sitesWebApiClient = sitesWebApiClient.CloneWithoutUserClaims();
            _logger = logger;
            _customerAccountWebApiClient = customerAccountWebApiClient;
            _locationRuntimeWebApiClient = locationRuntimeWebApiClient.CloneWithoutUserClaims();
            _orderWebApiClient = orderWebApiClient.CloneWithoutUserClaims();
            _shipmentControllerApiClient = shipmentControllerApiClient.CloneWithoutUserClaims();
            _locationAdminWebApi = locationAdminWebApi.CloneWithoutUserClaims();
            _returnSettingsWebApiClient = returnSettingsWebApiClient.CloneWithoutUserClaims();
            _tenantsWebApiClient = tenantsWebApiClient.CloneWithoutUserClaims();
            _b2bAccountWebApiClient = b2bAccountWebApiClient.CloneWithoutUserClaims();
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
                    if (emailTypeInfo?.ModelType == typeof(ReturnEmail))
                    {
                        var locationModel = JsonConvert.DeserializeObject<ReturnEmail>(JsonConvert.SerializeObject(model, emailTypeInfo?.ModelType, CaseInsensitiveJsonSerializerSettings.Default));
                        locationCode = locationModel.LocationCode;
                    }
                }
            }

            var tenant = (await _tenantsWebApiClient.GetTenantInternal(SbApiContext.TenantId)).ReadAsSync();
            var site = tenant.Sites.FirstOrDefault(x => x.Id == SbApiContext.SiteId);
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
            ViewData["adminDomainName"] = tenant.Domain.DomainName;
            ViewData["rmaLocation"] = locationCode.IsNullOrEmpty() ? await GetDefaultReturnLocation() : await GetStorageLocation(locationCode);

            ViewData["storefrontOrderAttributes"] = await GetShopperOrderAttributes();
            ViewData["smsEnabled"] = IsSmsEnabled(tenant);

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

            var tenant = (await _tenantsWebApiClient.GetTenantInternal(SbApiContext.TenantId)).ReadAsSync();
            var site = tenant.Sites.FirstOrDefault(x => x.Id == SbApiContext.SiteId);
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

            ViewData["smsEnabled"] = IsSmsEnabled(tenant);
            ViewData["adminDomainName"] = tenant.Domain.DomainName;
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

            Location.Contracts.Location storeLocation = null;
            if (model is ReturnEmail returnEmail)
                storeLocation = returnEmail.StoreLocation;
            else if (model is ShipmentEmail shipmentEmail)
                storeLocation = shipmentEmail.StoreLocation;

            ViewData.Model = model;
            ViewData["content"] = cmdContent;
            ViewData["User"] = user;
            ViewData["rmaLocation"] = storeLocation == null ? await GetDefaultReturnLocation() : storeLocation;
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

        private async Task<OrderCollection> DelayedGetOrdersByParentCheckoutId(CheckoutEmail checkoutEmail)
        {
            return (await _orderWebApiClient.GetOrders(filter: $"parentCheckoutId eq {checkoutEmail.Id}")).ReadAsSync();
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
                    returnEmail.StoreLocation = await GetStorageLocation(locationCode);
                }

            }

            if (obj is CheckoutEmail checkoutEmail)
            {
                var checkoutOrderSearch = (await _orderWebApiClient.GetOrders(filter: $"parentCheckoutId eq {checkoutEmail.Id}")).ReadAsSync();
                for (int delayAttemptCounter = 0; delayAttemptCounter < 3; delayAttemptCounter++)
                {
                    if (checkoutOrderSearch.Items.Count == 0)
                    {
                        checkoutOrderSearch = (await Task.Delay(2000).ContinueWith(_ => DelayedGetOrdersByParentCheckoutId(checkoutEmail))).Result;
                    }
                    else
                    {
                        break;
                    }
                }

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

                shipmentEmail.StoreLocation = await GetStorageLocation(shipmentEmail.FulfillmentLocationCode);
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

                var SHIPMENT_FILTER = "orderId==" + orderEmail.Id + ";shipmentStatus!=REASSIGNED;shipmentType!=Transfer";
                var omsShipmentsEmbedded = (await _shipmentControllerApiClient.GetShipmentsUsingGET(filter: SHIPMENT_FILTER)).ReadAsSync();
                var omsShipments = omsShipmentsEmbedded.Embedded.NotIsNullOrEmpty() ? (omsShipmentsEmbedded.Embedded.Values.NotIsNullOrEmpty() ? 
                    omsShipmentsEmbedded.Embedded.Values.SelectMany(x => x).ToList() : new List<Fulfillment.EntityModelOfShipment>()): new List<Fulfillment.EntityModelOfShipment>(); //We must determine whether or not any shipments came back from the call

                var omsShipmentsItemCount = 0;
                foreach (Fulfillment.EntityModelOfShipment shipment in omsShipments)
                {
                    omsShipmentsItemCount += shipment.CanceledItems.Count;
                }
                var orderItemCountWithBundleItems = orderEmail.Items.Count;
                foreach (OrderItem item in orderEmail.Items)
                {
                    if (item.Product.BundledProducts.Count > 1)
                    {
                        orderItemCountWithBundleItems += (item.Product.BundledProducts.Count - 1); //We have already added an item count for the parent product, so we subtract one here
                    }
                }
                bool hasPOSEItems = (omsShipmentsItemCount > orderItemCountWithBundleItems);
                orderEmail.hasPOSEItems = hasPOSEItems;
                orderEmail.OmsShipments = omsShipments;
                orderEmail.hasPickupItems = orderEmail.Items.Any(item => item.FulfillmentMethod.Equals(CommerceRuntime.Contracts.Commerce.FulfillmentMethodConst.PICKUP) || item.FulfillmentMethod.Equals(CommerceRuntime.Contracts.Commerce.FulfillmentMethodConst.CURBSIDE));
            }
            if (obj is GatewayGiftCardEmail giftCardEmail)
            {
                var giftCardOrder = (await _orderWebApiClient.GetOrder(giftCardEmail.OrderId)).ReadAsSync();

                giftCardEmail.Order = giftCardOrder;
            }

            if (obj is QuoteEmail quoteEmail)
            {
                var b2bAccount = (await _customerAccountWebApiClient.CloneWithoutUserClaims().GetAccount(quoteEmail.CustomerAccountId)).ReadAsSync();
                var b2bUsers = (await _b2bAccountWebApiClient.CloneWithoutUserClaims().GetUsers(quoteEmail.CustomerAccountId)).ReadAsSync();
                quoteEmail.B2BAccount = b2bAccount;
                quoteEmail.B2BUsers = b2bUsers;
                quoteEmail.isShippable = quoteEmail.Items.Any(a => a.FulfillmentMethod == "Ship");
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
            var result = await _locationRuntimeWebApiClient.GetLocation(locationCode);
            if (!result.HasException && result.ResponseMessage.IsSuccessStatusCode)
            {   
                var resultLocation = result.ReadAsSync();
                FormatRegularHours(resultLocation);
                return resultLocation;                   
            }
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

        private bool IsSmsEnabled(Tenant.Contracts.Tenant tenant)
        {
            var smsEnabled = System.Convert.ToBoolean(tenant?.Attributes?.FirstOrDefault(x => x.Name.EqualsIgnoreCase("SmsEnabled"))?.Value);
            return smsEnabled;
        }

        public class Topics
        {
            public const string PasswordReset = "user.passwordreset";
            public const string NewUserCreated = "user.created";
            public const string OrderEmailTopic = "order.changed";
            public const string CheckoutEmailTopic = "checkout.changed";
            public const string OrderShippedTopic = "order.shipped";
            public const string OrderCancelFailed = "order.cancelfailed";
            public const string ReturnChanged = "return.changed";
            public const string ReturnCreated = "return.created";
            public const string ReturnAuthorized = "return.authorized";
            public const string ReturnRejected = "return.rejected";
            public const string ReturnClosed = "return.closed";
            public const string RefundCreated = "refund.created";
            public const string InStockNotification = "product.instock";
            public const string GiftCardCreated = "giftcard.created";
            public const string OrderCancellation = "order.cancelled";
            public const string OrderCancellationPOSE = "order.cancelled.POSE";
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
            public const string CustomerIntransit = "shipment.customerintransit";
            public const string CustomerAtCurbside = "shipment.customeratcurbside";
            public const string QuoteSummary = "quote.summary";
            public const string B2BAccountCreated = "b2baccount.created";
            public const string B2BAccountInactive = "b2baccount.accountinactive";
            public const string B2BAccountDenied = "b2baccount.accountdenied";
            public const string QuoteInReview = "quote.inreview";
            public const string QuoteReadyForCheckout = "quote.readyforcheckout";
            public const string QuoteExpired = "quote.expired";
            public const string DeliveryDateUpdated = "shipment.deliverydateupdated";
            public const string ReadyForDelivery = "shipment.readyfordelivery";
            
            // Subscription
            public const string SubscriptionActivated = "subscription.activated";
            public const string SubscriptionCancelled = "subscription.cancelled";
            public const string SubscriptionErrored = "subscription.errored";
            public const string SubscriptionPaused = "subscription.paused";
            public const string SubscriptionSkipped = "subscription.skipped";
            public const string SubscriptionFrequencyChanged = "subscription.frequencychanged";
            public const string SubscriptionFulfillmentInfoUpdated = "subscription.fulfillmentinfoupdated";
            public const string SubscriptionPaymentUpdated = "subscription.paymentupdated";
            public const string SubscriptionItemAdded = "subscription.itemadded";
            public const string SubscriptionNextOrderDateChanged = "subscription.nextorderdatechanged";
            public const string SubscriptionItemRemoved = "subscription.itemremoved";
            public const string SubscriptionItemQuantityUpdated = "subscription.itemquantityupdated";
            public const string SubscriptionOrderReminder = "subscription.orderreminder";
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
