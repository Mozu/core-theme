using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using Mozu.CommerceRuntime.Contracts.Orders;
using Mozu.Content.Contracts.Clients;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Behaviors;
using Mozu.Core.Logging;
using Mozu.Core.Messaging.Contracts.Notification;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Models.CMS.Admin;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models.Admin.Email;
using Mozu.SiteBuilder.UX.Models.StoreFront.CMS;
using Mozu.SiteBuilder.UX.TestData;
using Mozu.Tenant.Contracts.Clients;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using DC = Mozu.Content.Contracts;
//using VMOrder = Mozu.SiteBuilder.UX.Models.Checkout.or;
using VM = Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.SEO;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ContextInitialization]
    public class EmailController : CmsPagesController
    {
        private readonly ISitesWebApiClient _sitesWebApiClient;
        private readonly ILogger _logger;
        private readonly Mozu.Location.Contracts.Clients.ILocationRuntimeWebApiClient _locationRuntimeWebApiClient;
        protected ICustomerAccountWebApiClient _customerAccountWebApiClient;
        private static readonly List<EmailTypeInfo> g_emailTypeInfos;

        static EmailController()
        {
            g_emailTypeInfos = new List<EmailTypeInfo>
                                   {
                                       //new EmailTypeInfo
                                       //    {
                                       //        ModelType = typeof (ResetPasswordEmailMessage),
                                       //        Topic = Topics.PasswordReset
                                       //    },
                                       //new EmailTypeInfo
                                       //    {
                                       //        ModelType = typeof (NewUserEmailMessage),
                                       //        Topic = Topics.NewUserCreated
                                       //    },
                                       new EmailTypeInfo
                                           {
                                               ModelType = typeof (Mozu.CommerceRuntime.Contracts.Returns.Return),
                                               Topic = Topics.ReturnCreated
                                           },
                                       new EmailTypeInfo
                                           {
                                               ModelType = typeof (Mozu.CommerceRuntime.Contracts.Returns.Return),
                                               Topic = Topics.ReturnAuthorized
                                           },
                                       new EmailTypeInfo
                                           {
                                               ModelType = typeof (Mozu.CommerceRuntime.Contracts.Returns.Return),
                                               Topic = Topics.ReturnRejected
                                           },
                                       new EmailTypeInfo
                                           {
                                               ModelType = typeof (Mozu.CommerceRuntime.Contracts.Returns.Return),
                                               Topic = Topics.ReturnClosed
                                           },
                                       new EmailTypeInfo
                                           {
                                               ModelType = typeof (Mozu.CommerceRuntime.Contracts.Returns.Return),
                                               Topic = Topics.ReturnChanged
                                           },
                                       new EmailTypeInfo
                                           {
                                               ModelType = typeof (Order),
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
                                           }
                                   };
        }

        public EmailController(IDocumentListWebApiClient docRepo,
                               IDocumentTypeWebApiClient docTypeRepo,
                               ICmsServiceWrapper cmsService,
                               //ICmsTypeHelper cmsTypeHelper,
                               ICustomerAccountWebApiClient customerAccountWebApiClient,
                               HyprViewEngine hyprViewEngine,
                                Mozu.Tenant.Contracts.Clients.ISitesWebApiClient sitesWebApiClient,
                                ILogger logger,
                                Mozu.Location.Contracts.Clients.ILocationRuntimeWebApiClient locationRuntimeWebApiClient,
            ISiteRouteHandler siteRouteHandler

            )
            : base(docRepo, docTypeRepo, cmsService, 
            //cmsTypeHelper, 
            customerAccountWebApiClient, hyprViewEngine, siteRouteHandler)
        {
            _sitesWebApiClient = sitesWebApiClient.CloneWithoutUserClaims();
            _logger = logger;
            _customerAccountWebApiClient = customerAccountWebApiClient;
            _locationRuntimeWebApiClient = locationRuntimeWebApiClient.CloneWithoutUserClaims();
        }

        //
        // GET: /StoreFront/Email/
        [HttpGet]
        public async Task<HttpResponseMessage> Preview(string id)
        {
            VM.PageTypeDefinition emailTempalte = SiteContext.Theme.EmailTemplates.FirstOrDefault(x => string.Equals(x.Id, id, StringComparison.OrdinalIgnoreCase));

            EmailTypeInfo emailTypeInfo = g_emailTypeInfos.FirstOrDefault(x => string.Equals(x.Topic, id, StringComparison.OrdinalIgnoreCase));

           // var model = new object();

            var model = TestDataBroker.Default.GetFileContents(id).FirstOrDefault() ?? new object();

           
            var site = (await _sitesWebApiClient.GetSite(this.SbApiContext.SiteId)).ReadAsSync();
            HttpResponseMessage res = await Page("emailTemplateContent@mozu", GetCmsPage(emailTempalte));

            this.PageContext.CmsContext.Page.DocumentTypeFQN = "emailTemplateContent@mozu";

            //if (res.StatusCode == HttpStatusCode.NotFound)
            //{
                
            //    var reqDoc = new DC.Document
            //                     {
            //                         ListFQN = "emailTemplateContent@mozu",
            //                         DocumentTypeFQN = "emailTemplateContent@mozu",
            //                         Name = GetCmsPage(emailTempalte),
            //                         Properties= emailTempalte.Properties 
            //                     };
                
                
            //    Task<ServiceClientResponse<DC.Document>> task = _docRepo.CreateDocument(reqDoc.ListFQN, reqDoc);
            //    await task;

            //    //_cmsService.Create ( )
            //    //CreatePage("home page", "home", "home");
            //    ResetContextInitilaztionTasks();
            //    res = await Page("emailTemplateContent@mozu", GetCmsPage(emailTempalte));
            //}

            PageContext.PageType = "email";
            ViewResult vr = null;
            if (res.IsSuccessStatusCode)
            {
               
          
                vr = ((ObjectContent) res.Content).Value as ViewResult;
                vr.ViewName = emailTempalte.Template;
                var doc = (DC.Document)vr.Model;
                if (doc != null)
                {
                    doc.Set("page_type_definition", id);
                }

                ViewData["content"] = vr.Model;
            }
          
            
            ViewData["domainName"] = site.Domains.Where(x => x.IsPrimary).Select(x => x.DomainName).FirstOrDefault();
            ViewData["rmaLocation"] = _locationRuntimeWebApiClient.GetDirectShipLocation().Result.ReadAsSync();

            //Conte
            return Request.CreateResponse(HttpStatusCode.OK, View(emailTempalte.Template, model));
        }

        [HttpPost]
        public async Task<HttpResponseMessage> Render(EmailNotification notification)
        {
            UX.Models.Customers.User user = null;
            HttpRequestBase request = HttpRequestBase;

            if (notification.MessagePublishingContext != null && !string.IsNullOrEmpty(notification.MessagePublishingContext.CustomerId))
            {
                try
                {
                    var dcUser = (await _customerAccountWebApiClient.GetAccount(int.Parse(notification.MessagePublishingContext.CustomerId))).ReadAsSync();

                    user = new UX.Models.Customers.User
                           {
                               Email = dcUser.EmailAddress,
                               FirstName = dcUser.FirstName,
                               LastName = dcUser.LastName,
                               UserId = dcUser.UserId,
                               AccountId = dcUser.Id
                           };
                }
                catch (Mozu.Core.Api.Client.Exceptions.ApiWebClientException)
                {
                }
            }

            //if (topic.StartsWith(EmailNotification.PrimaryTopic))
            //{
            //    topic = topic.Substring(EmailNotification.PrimaryTopic.Length + 1);
            //}

            EmailTypeInfo emailTypeInfo = g_emailTypeInfos.FirstOrDefault(x => string.Equals(x.Topic, notification.Topic, StringComparison.OrdinalIgnoreCase));

            VM.PageTypeDefinition emailTempalte = SiteContext.Theme.EmailTemplates.FirstOrDefault(x => string.Equals(x.Id, notification.Topic, StringComparison.OrdinalIgnoreCase));

            if (emailTempalte == null)
            {
                var errMesage = "no templates defined for  topic " + notification.Topic;
                _logger.Error(errMesage);
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, errMesage );
            }

            var site = (await _sitesWebApiClient.GetSite(this.SbApiContext.SiteId)).ReadAsSync();
            HttpResponseMessage v = await Page("emailTemplateContent@mozu", GetCmsPage(emailTempalte));
            object cmdContent = null;
            var vr = ((ObjectContent) v.Content).Value as ViewResult;
            if (vr != null)
            {
                ViewData["content"] = vr.Model;
                cmdContent = vr.Model;
            }

            _logger.Info(string.Format("raw payload for topic:{0} messageId:{1}", notification.MessageId, notification.Topic), notification);

            object model = Convert(notification.Payload, emailTypeInfo);

 
            try
            {
                _logger.Info(string.Format("de-serialized payload for topic:{0} messageId:{1}", notification.MessageId, notification.Topic), model);
            }
            catch (Exception ex)
            {
                _logger.Error(ex);
            }

            var viewEngine = Request.Resolve<HyprViewEngine>();
            var view = viewEngine.FindPageView(emailTempalte.Template);

            if (view == null)
            {
                var errMesage = string.Format("no template found for view:{0} topic{1}", emailTempalte.Template, notification.Topic);
                _logger.Error(errMesage);
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, errMesage);

            }
            var vdd = new ViewDataDictionary();
            vdd["model"] = model;
            vdd["content"] = cmdContent;
            vdd["User"] = user;
            vdd["rmaLocation"] = _locationRuntimeWebApiClient.GetDirectShipLocation().Result.ReadAsSync();
            vdd["domainName"] = site.Domains.Where(x => x.IsPrimary).Select(x => x.DomainName).FirstOrDefault();

            var hvc = new HyprViewContext(this.Request , vdd, null);
            var stringWriter = new StringWriter();
           
            view.Render(hvc, stringWriter);

            //var viewString = RenderViewToString(emailTypeInfo.Template , model, cmdContent);
            var response = new EmailResponse
                               {
                                   Subject =  !string.IsNullOrEmpty(emailTempalte.Title) ? emailTempalte.Title :  notification.Topic,
                                   Body = stringWriter.GetStringBuilder() .ToString( )
                               };

            return Request.CreateResponse(HttpStatusCode.OK, response);
        }

        private static object Convert(string json, EmailTypeInfo eti)
        {
            if (eti == null || eti.ModelType == null)
            {
                return JsonConvert.DeserializeObject(json);
            }
            object jobj = JsonConvert.DeserializeObject(json, eti.ModelType);
            //if (eti.MappingType != null)
            //{
            //    jobj = AutoMapper.Mapper.Map(jobj, eti.ModelType, eti.MappingType);
            //}
            return jobj;
        }

        private string GetCmsPage(VM.PageTypeDefinition def)
        {
            return def.Id;
            //todo:dataconversion
            //return def.Id.Replace(".", "~");
        }

        private class EmailRenderActionResult : ActionResult
        {
            private readonly object _cmsDoc;
            private readonly EmailTypeInfo _emailInfo;
            private readonly object _model;
            private readonly string _viewName;


            public EmailRenderActionResult(EmailTypeInfo emailInfo, string viewName, object model, object cmsDoc)
            {
                _emailInfo = emailInfo;
                _viewName = viewName;
                _model = model;
                _cmsDoc = cmsDoc;
            }

            public override void ExecuteResult(HttpRequestMessage requestMessage)
            {
                var viewEngine = requestMessage.Resolve<HyprViewEngine>();
                var view = viewEngine.FindPageView(_viewName);
                var vdd = new ViewDataDictionary();
                vdd["model"] = _model;
                vdd["content"] = _cmsDoc;

                var hvc = new HyprViewContext(requestMessage, vdd, null);
                var stringWriter = new StringWriter();
                view.Render(hvc, stringWriter);



               
      
                //               {
                //                   Subject = "TEST SUBJECT " + _emailInfo.Topic ,
                //                   Body = viewString
                //               };
                //this.Data = response;
                //base.ExecuteResult(context);
            }

            //private string RenderViewToString(string viewName, object model, object cmsDoc, ControllerContext context)
            //{

            //    using (var sw = new StringWriter())
            //    {
            //        var viewResult = _viewEngine.FindView(context, viewName, null, true);
            //        var viewContext = new ViewContext(context, viewResult.View, new ViewDataDictionary(model), new TempDataDictionary(), sw);
            //        viewContext.ViewData["content"] = cmsDoc;
            //        viewResult.View.Render(viewContext, sw);
            //        viewResult.ViewEngine.ReleaseView(context, viewResult.View);
            //        return sw.GetStringBuilder().ToString();
            //    }
            //}
        }

        public class Topics
        {
            public const string PasswordReset = "user.passwordreset";
            public const string NewUserCreated = "user.created";
            public const string OrderEmailTopic = "order.changed";
            public const string OrderShippedTopic = "order.shipped";
            public const string ReturnChanged = "return.changed";
            public const string ReturnCreated = "return.created";
            public const string ReturnAuthorized = "return.authorized";
            public const string ReturnRejected = "return.rejected";
            public const string ReturnClosed = "return.closed";
            public const string InStockNotification = "product.instock";
            public const string GiftCardCreated = "giftcard.created";
        }

        # region Mock Orders
        private static string _mockRma = @"{
            ""auditInfo"": {
                ""createBy"": ""79a2be2e3abb413fb7cadb54956a5cce"",
                ""createDate"": ""2014-02-14T20:36:51.904Z"",
                ""updateBy"": ""79a2be2e3abb413fb7cadb54956a5cce"",
                ""updateDate"": ""2014-02-14T20:36:52.403Z""
            },
            ""availableActions"": [
                ""Await"",
                ""Refund"",
                ""Cancel""
            ],
            ""channelCode"": ""BNM"",
            ""currencyCode"": ""usd"",
            ""customerAccountId"": 1001,
            ""customerInteractionType"": ""Unknown"",
            ""id"": ""03fedc644fdce00e4cfddb690000256d"",
            ""items"": [
                {
                    ""bundledProducts"": [],
                    ""notes"": [],
                    ""orderItemId"": ""21269410d2da42faaf4da29a01433e37"",
                    ""product"": {
                        ""bundledProducts"": [],
                        ""categories"": [
                            {
                                ""id"": 9,
                                ""parent"": {
                                    ""id"": 6,
                                    ""parent"": {
                                        ""id"": 3
                                    }
                                }
                            }
                        ],
                        ""description"": ""Rfcetn"",
                        ""isPackagedStandAlone"": false,
                        ""isTaxable"": true,
                        ""measurements"": {
                            ""weight"": {
                                ""unit"": ""lbs"",
                                ""value"": 50.0
                            }
                        },
                        ""name"": ""odNxLb"",
                        ""options"": [],
                        ""price"": {
                            ""price"": 500.0,
                            ""salePrice"": 450.0
                        },
                        ""productCode"": ""lIQWn"",
                        ""productUsage"": ""Standard"",
                        ""properties"": [
                            {
                                ""attributeFQN"": ""tenant~Size_IjGCc"",
                                ""dataType"": ""String"",
                                ""isMultiValue"": true,
                                ""name"": ""YUvYO"",
                                ""values"": [
                                    {
                                        ""stringValue"": ""zeFUy"",
                                        ""value"": ""fOwuWD""
                                    },
                                    {
                                        ""stringValue"": ""LRaMt"",
                                        ""value"": ""vHRJtn""
                                    }
                                ]
                            },
                            {
                                ""attributeFQN"": ""tenant~Fabric_KuXWw"",
                                ""dataType"": ""String"",
                                ""isMultiValue"": true,
                                ""name"": ""zQWKH"",
                                ""values"": [
                                    {
                                        ""stringValue"": ""kLkET"",
                                        ""value"": ""uQqnLC""
                                    },
                                    {
                                        ""stringValue"": ""rMJSV"",
                                        ""value"": ""ValDcu""
                                    }
                                ]
                            },
                            {
                                ""attributeFQN"": ""tenant~Material_XMPxl"",
                                ""dataType"": ""String"",
                                ""isMultiValue"": true,
                                ""name"": ""cKIQl"",
                                ""values"": [
                                    {
                                        ""stringValue"": ""nXpVI"",
                                        ""value"": ""wNqPeJ""
                                    },
                                    {
                                        ""stringValue"": ""OQZjp"",
                                        ""value"": ""tTYTRM""
                                    }
                                ]
                            },
                            {
                                ""attributeFQN"": ""tenant~availability"",
                                ""dataType"": ""String"",
                                ""isMultiValue"": false,
                                ""name"": ""Availability"",
                                ""values"": [
                                    {
                                        ""stringValue"": ""Usually Ships in 24 Hours"",
                                        ""value"": ""24hrs""
                                    }
                                ]
                            },
                            {
                                ""attributeFQN"": ""tenant~product-crosssell"",
                                ""dataType"": ""String"",
                                ""isMultiValue"": true,
                                ""name"": ""Product Cross-Sells"",
                                ""values"": []
                            },
                            {
                                ""attributeFQN"": ""tenant~product-upsell"",
                                ""dataType"": ""String"",
                                ""isMultiValue"": true,
                                ""name"": ""Product Upsells"",
                                ""values"": []
                            }
                        ]
                    },
                    ""productLossAmount"": 450.0,
                    ""quantityReceived"": 0,
                    ""quantityRestockable"": 0,
                    ""quantityShipped"": 0,
                    ""reasons"": [
                        {
                            ""quantity"": 1,
                            ""reason"": ""MissingParts""
                        }
                    ]
                }
            ],
            ""locationCode"": ""online store_1"",
            ""lossTotal"": 450.0,
            ""notes"": [],
            ""originalOrderId"": ""03b54eb54fdce0fa782d06c60000256d"",
            ""packages"": [],
            ""payments"": [],
            ""productLossTotal"": 450.0,
            ""refundAmount"": 0.0,
            ""returnNumber"": 1,
            ""returnType"": ""Replace"",
            ""rmaDeadline"": ""2015-02-05T00:00:00.000Z"",
            ""shippingLossTaxTotal"": 0.0,
            ""shippingLossTotal"": 0.0,
            ""siteId"": 13587,
            ""status"": ""Authorized"",
            ""tenantId"": 9581,
            ""userId"": ""80beb8559ad94dc0a3f92c870aac9325""
        }";

        private static string _mockOrder = @"{
    ""acceptedDate"": ""2014-01-22T20:53:34.334Z"",
    ""amountAvailableForRefund"": 111.0,
    ""amountRemainingForPayment"": 0.0,
    ""attributes"": [],
    ""auditInfo"": {
        ""createBy"": ""0dd7ddb60a2941f38886e8e7c6482c64"",
        ""createDate"": ""2014-01-22T20:53:01.292Z"",
        ""updateBy"": ""af906ad3e35d441e88fed93cb303f63b"",
        ""updateDate"": ""2014-01-22T20:54:10.247Z""
    },
    ""availableActions"": [
        ""ValidateOrder""
    ],
    ""billingInfo"": {
        ""auditInfo"": {
            ""createBy"": ""f35c0360e3ce45c2b73beb97f11fc3fa"",
            ""createDate"": ""2014-01-03T23:26:46.612Z"",
            ""updateBy"": ""f35c0360e3ce45c2b73beb97f11fc3fa"",
            ""updateDate"": ""2014-01-03T23:26:46.612Z""
        },
        ""billingContact"": {
            ""address"": {
                ""address1"": ""204 Kramer Lane"",
                ""address2"": """",
                ""addressType"": ""None"",
                ""cityOrTown"": ""Austin"",
                ""countryCode"": ""US"",
                ""isValidated"": false,
                ""postalOrZipCode"": ""78749"",
                ""stateOrProvince"": ""TX""
            },
            ""email"": ""travis_johnson@volusion.com"",
            ""firstName"": ""Jonny"",
            ""id"": -1,
            ""lastNameOrSurname"": ""Appleseed"",
            ""phoneNumbers"": {
                ""home"": ""123-456-7890""
            }
        },
        ""card"": {
            ""expireMonth"": 0,
            ""expireYear"": 0,
            ""isCardInfoSaved"": false,
            ""isUsedRecurring"": false
        },
        ""isSameBillingShippingAddress"": true,
        ""paymentType"": ""Check""
    },
    ""changeMessages"": [
        {
            ""createDate"": ""2014-01-22T20:53:01.151Z"",
            ""id"": ""f45b8bc806f94a73b05aa2bb00f5466b"",
            ""identifier"": ""03e08dad17f36524580f187b000003b2"",
            ""message"": ""Shipment information was updated."",
            ""subject"": ""Shipment Info Updated"",
            ""subjectType"": ""Order"",
            ""verb"": ""Updated""
        },
        {
            ""createDate"": ""2014-01-22T20:53:12.368Z"",
            ""id"": ""1f4fe9701f3542118a5fa2bb00f55390"",
            ""identifier"": ""03e08dad17f36524580f187b000003b2"",
            ""message"": ""Shipment information was updated."",
            ""subject"": ""Shipment Info Updated"",
            ""subjectType"": ""Order"",
            ""verb"": ""Updated""
        },
        {
            ""createDate"": ""2014-01-22T20:53:19.248Z"",
            ""id"": ""861e1b4b1a8f4368acf7a2bb00f55ba0"",
            ""identifier"": ""03e08dad17f36524580f187b000003b2"",
            ""message"": ""Shipment information was updated."",
            ""subject"": ""Shipment Info Updated"",
            ""subjectType"": ""Order"",
            ""verb"": ""Updated""
        },
        {
            ""createDate"": ""2014-01-22T20:54:02.805Z"",
            ""id"": ""93e13a0d8e9f48baa733a2bb00f58eab"",
            ""identifier"": ""03e08dad17f36524580f187b000003b2"",
            ""message"": ""Package with ID: 210f6550e74b4abe83daa2bb00f58eab was added."",
            ""subject"": ""Package Added"",
            ""subjectType"": ""Order"",
            ""verb"": ""Added""
        },
        {
            ""createDate"": ""2014-01-22T20:54:10.247Z"",
            ""id"": ""9185c74584764f648676a2bb00f59763"",
            ""identifier"": ""03e08dad17f36524580f187b000003b2"",
            ""message"": ""Package with ID: 7ca424a360f044339619a2bb00f59763 was added."",
            ""subject"": ""Package Added"",
            ""subjectType"": ""Order"",
            ""verb"": ""Added""
        }
    ],
    ""channelCode"": ""SA-Online"",
    ""couponCodes"": [],
    ""currencyCode"": ""usd"",
    ""customerAccountId"": 45977,
    ""customerInteractionType"": ""Unknown"",
    ""discountTotal"": 20.960000000000001,
    ""discountedSubtotal"": 93.0,
    ""discountedTotal"": 93.0,
    ""feeTotal"": 0.0,
    ""fulfillmentInfo"": {
        ""auditInfo"": {
            ""createBy"": ""f35c0360e3ce45c2b73beb97f11fc3fa"",
            ""createDate"": ""2014-01-03T23:26:23.851Z"",
            ""updateBy"": ""f35c0360e3ce45c2b73beb97f11fc3fa"",
            ""updateDate"": ""2014-01-03T23:26:32.774Z""
        },
        ""fulfillmentContact"": {
            ""address"": {
                ""address1"": ""204 Kramer Lane"",
                ""address2"": """",
                ""addressType"": ""None"",
                ""cityOrTown"": ""Austin"",
                ""countryCode"": ""US"",
                ""isValidated"": false,
                ""postalOrZipCode"": ""78749"",
                ""stateOrProvince"": ""TX""
            },
            ""email"": ""travis_johnson@volusion.com"",
            ""firstName"": ""Jonny"",
            ""id"": 1121,
            ""lastNameOrSurname"": ""Appleseed"",
            ""phoneNumbers"": {
                ""home"": ""123-456-7890""
            }
        },
        ""isDestinationCommercial"": false,
        ""shippingMethodCode"": ""6b8fff4f3f0a4ca0ac13a27c00e65747"",
        ""shippingMethodName"": ""oboe Xpress III""
    },
    ""fulfillmentStatus"": ""PartiallyFulfilled"",
    ""handlingAmount"": 0.0,
    ""handlingTaxTotal"": 0.0,
    ""handlingTotal"": 0.0,
    ""hasDraft"": false,
    ""id"": ""03e08dad17f36524580f187b000003b2"",
    ""isDraft"": false,
    ""isEligibleForReturns"": true,
    ""isImport"": false,
    ""isTaxExempt"": false,
    ""itemTaxTotal"": 0.0,
    ""items"": [
        {
            ""auditInfo"": {},
            ""discountTotal"": 7.96,
            ""discountedTotal"": 16.0,
            ""extendedTotal"": 16.0,
            ""feeTotal"": 0.0,
            ""fulfillmentLocationCode"": ""TN-1"",
            ""fulfillmentMethod"": ""Ship"",
            ""id"": ""956aa1c11a8e4a2ba40da2bb00f5466b"",
            ""itemTaxTotal"": 0.0,
            ""originalCartItemId"": ""d5b6227c1c90435d963da2bb00f53c37"",
            ""product"": {
                ""bundledProducts"": [],
                ""categories"": [],
                ""description"": """",
                ""isPackagedStandAlone"": false,
                ""isTaxable"": false,
                ""measurements"": {
                    ""height"": {
                        ""unit"": ""in"",
                        ""value"": 1.0
                    },
                    ""length"": {
                        ""unit"": ""in"",
                        ""value"": 1.0
                    },
                    ""weight"": {
                        ""unit"": ""lbs"",
                        ""value"": 0.029999999999999999
                    },
                    ""width"": {
                        ""unit"": ""in"",
                        ""value"": 1.0
                    }
                },
                ""name"": ""Ottoman"",
                ""options"": [],
                ""price"": {
                    ""price"": 5.9900000000000002,
                    ""salePrice"": 4.0
                },
                ""productCode"": ""AmpBulb"",
                ""productReservationId"": 103,
                ""productUsage"": ""Standard"",
                ""properties"": [
                    {
                        ""attributeFQN"": ""Tenant~Product-Price"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Product Price"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Vendor-Price"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Vendor Price"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Oversized"",
                        ""dataType"": ""Bool"",
                        ""isMultiValue"": false,
                        ""name"": ""Oversized"",
                        ""values"": [
                            {
                                ""value"": false
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Additional-Documents"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Additional Documents"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Reward-Points"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Reward Points"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Ships-By-Itself"",
                        ""dataType"": ""Bool"",
                        ""isMultiValue"": false,
                        ""name"": ""Ships By Itself"",
                        ""values"": [
                            {
                                ""value"": false
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Additional-Handling"",
                        ""dataType"": ""Bool"",
                        ""isMultiValue"": false,
                        ""name"": ""Additional Handling"",
                        ""values"": [
                            {
                                ""value"": false
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Tech-Specs"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Tech Specs"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Crosstalk"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Crosstalk"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Damping-Factor"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Damping Factor"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Depth"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Depth"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Dimensions"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Dimensions"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Frequency-Response"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Frequency Response"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Height"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Height"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Input-Impedance"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Input Impedance"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Input-Sensititvity"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Input Sensititvity"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Operation-Power-Voltage"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Operation Power Voltage"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Protection"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Protection"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Signal-Noise-Ratio"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Signal Noise Ratio"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Slew-Ratio"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Slew Ratio"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~THD-N"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""THD+N"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Weight"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Weight"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Width"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Width"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    }
                ]
            },
            ""productDiscounts"": [],
            ""quantity"": 4,
            ""shippingDiscounts"": [],
            ""shippingTaxTotal"": 0.0,
            ""shippingTotal"": 12.0,
            ""subtotal"": 23.960000000000001,
            ""taxableTotal"": 16.0,
            ""total"": 28.0,
            ""unitPrice"": {
                ""baseAmount"": 5.9900000000000002,
                ""discountAmount"": 1.99,
                ""discountedAmount"": 4.0,
                ""extendedAmount"": 4.0,
                ""listAmount"": 5.9900000000000002,
                ""saleAmount"": 4.0
            }
        },
        {
            ""auditInfo"": {},
            ""discountTotal"": 13.0,
            ""discountedTotal"": 77.0,
            ""extendedTotal"": 77.0,
            ""feeTotal"": 0.0,
            ""fulfillmentLocationCode"": ""TN-1"",
            ""fulfillmentMethod"": ""Ship"",
            ""id"": ""13ffdc9cd72c41a98b10a2bb00f5466b"",
            ""itemTaxTotal"": 0.0,
            ""originalCartItemId"": ""b20018f61856460c883aa2bb00f5440a"",
            ""product"": {
                ""bundledProducts"": [],
                ""categories"": [
                    {
                        ""id"": 69
                    }
                ],
                ""description"": """",
                ""isPackagedStandAlone"": false,
                ""isTaxable"": false,
                ""measurements"": {
                    ""height"": {
                        ""unit"": ""in"",
                        ""value"": 4.5
                    },
                    ""length"": {
                        ""unit"": ""in"",
                        ""value"": 4.5
                    },
                    ""weight"": {
                        ""unit"": ""lbs"",
                        ""value"": 18.600000000000001
                    },
                    ""width"": {
                        ""unit"": ""in"",
                        ""value"": 4.5
                    }
                },
                ""name"": ""Eames Chair"",
                ""options"": [],
                ""price"": {
                    ""price"": 45.0,
                    ""salePrice"": 38.5
                },
                ""productCode"": ""AftershockAmp"",
                ""productReservationId"": 104,
                ""productUsage"": ""Standard"",
                ""properties"": [
                    {
                        ""attributeFQN"": ""Tenant~Product-Price"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Product Price"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Vendor-Price"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Vendor Price"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Oversized"",
                        ""dataType"": ""Bool"",
                        ""isMultiValue"": false,
                        ""name"": ""Oversized"",
                        ""values"": [
                            {
                                ""value"": false
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Additional-Documents"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Additional Documents"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Reward-Points"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Reward Points"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Ships-By-Itself"",
                        ""dataType"": ""Bool"",
                        ""isMultiValue"": false,
                        ""name"": ""Ships By Itself"",
                        ""values"": [
                            {
                                ""value"": false
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Additional-Handling"",
                        ""dataType"": ""Bool"",
                        ""isMultiValue"": false,
                        ""name"": ""Additional Handling"",
                        ""values"": [
                            {
                                ""value"": false
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Tech-Specs"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Tech Specs"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Crosstalk"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Crosstalk"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Damping-Factor"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Damping Factor"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Depth"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Depth"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Dimensions"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Dimensions"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Frequency-Response"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Frequency Response"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Height"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Height"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Input-Impedance"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Input Impedance"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Input-Sensititvity"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Input Sensititvity"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Operation-Power-Voltage"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Operation Power Voltage"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Protection"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Protection"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Signal-Noise-Ratio"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Signal Noise Ratio"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Slew-Ratio"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Slew Ratio"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~THD-N"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""THD+N"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Weight"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Weight"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    },
                    {
                        ""attributeFQN"": ""Tenant~Width"",
                        ""dataType"": ""String"",
                        ""isMultiValue"": false,
                        ""name"": ""Width"",
                        ""values"": [
                            {
                                ""value"": """"
                            }
                        ]
                    }
                ]
            },
            ""productDiscounts"": [],
            ""quantity"": 2,
            ""shippingDiscounts"": [],
            ""shippingTaxTotal"": 0.0,
            ""shippingTotal"": 6.0,
            ""subtotal"": 90.0,
            ""taxableTotal"": 77.0,
            ""total"": 83.0,
            ""unitPrice"": {
                ""baseAmount"": 45.0,
                ""discountAmount"": 6.5,
                ""discountedAmount"": 38.5,
                ""extendedAmount"": 38.5,
                ""listAmount"": 45.0,
                ""saleAmount"": 38.5
            }
        }
    ],
    ""lastValidationDate"": ""2014-01-22T20:53:21.76Z"",
    ""notes"": [],
    ""orderDiscounts"": [],
    ""orderNumber"": 63258,
    ""originalCartId"": ""03e08da51397e7038c11db64000003b2"",
    ""packages"": [
        {
            ""auditInfo"": {
                ""createBy"": ""af906ad3e35d441e88fed93cb303f63b"",
                ""createDate"": ""2014-01-22T20:54:10.247Z"",
                ""updateBy"": ""af906ad3e35d441e88fed93cb303f63b"",
                ""updateDate"": ""2014-01-22T20:54:10.247Z""
            },
            ""availableActions"": [
                ""Ship""
            ],
            ""fulfillmentDate"": ""2014-01-22T20:54:13.2269108Z"",
            ""fulfillmentLocationCode"": ""TN-1"",
            ""id"": ""7ca424a360f044339619a2bb00f59763"",
            ""items"": [
                {
                    ""productCode"": ""AmpBulb"",
                    ""quantity"": 4
                }
            ],
            ""shippingMethodCode"": ""48f0a141cfe34a5996efa29d008825fc"",
            ""status"": ""NotFulfilled"",
            ""trackingNumber"": ""9407 1000 0000 0000 0000 00""
        }
    ],
    ""paymentStatus"": ""Paid"",
    ""payments"": [
        {
            ""amountCollected"": 111.0,
            ""amountCredited"": 0.0,
            ""amountRequested"": 111.0,
            ""auditInfo"": {
                ""createBy"": ""0dd7ddb60a2941f38886e8e7c6482c64"",
                ""createDate"": ""2014-01-22T20:53:31.744Z"",
                ""updateBy"": ""0dd7ddb60a2941f38886e8e7c6482c64"",
                ""updateDate"": ""2014-01-22T20:53:31.744Z""
            },
            ""availableActions"": [
                ""CreditPayment"",
                ""Rollback"",
                ""VoidPayment""
            ],
            ""billingInfo"": {
                ""auditInfo"": {
                    ""createBy"": ""0dd7ddb60a2941f38886e8e7c6482c64"",
                    ""createDate"": ""2014-01-22T20:53:31.744Z"",
                    ""updateBy"": ""0dd7ddb60a2941f38886e8e7c6482c64"",
                    ""updateDate"": ""2014-01-22T20:53:31.744Z""
                },
                ""billingContact"": {
                    ""address"": {
                        ""address1"": ""204 Kramer Lane"",
                        ""address2"": """",
                        ""addressType"": ""None"",
                        ""cityOrTown"": ""Austin"",
                        ""countryCode"": ""US"",
                        ""isValidated"": false,
                        ""postalOrZipCode"": ""78749"",
                        ""stateOrProvince"": ""TX""
                    },
                    ""email"": ""travis_johnson@volusion.com"",
                    ""firstName"": ""Jonny"",
                    ""id"": -1,
                    ""lastNameOrSurname"": ""Appleseed"",
                    ""phoneNumbers"": {
                        ""home"": ""123-456-7890""
                    }
                },
                ""card"": {
                    ""expireMonth"": 0,
                    ""expireYear"": 0,
                    ""isCardInfoSaved"": false,
                    ""isUsedRecurring"": false
                },
                ""isSameBillingShippingAddress"": true,
                ""paymentType"": ""Check""
            },
            ""id"": ""8de25ac6365240aa86dfa2bb00f56a45"",
            ""interactions"": [
                {
                    ""amount"": 111.0,
                    ""auditInfo"": {
                        ""createBy"": ""0dd7ddb60a2941f38886e8e7c6482c64"",
                        ""createDate"": ""2014-01-22T20:53:34.334Z"",
                        ""updateBy"": ""0dd7ddb60a2941f38886e8e7c6482c64"",
                        ""updateDate"": ""2014-01-22T20:53:34.334Z""
                    },
                    ""currencyCode"": ""USD"",
                    ""id"": ""16f644d27def471c858ea2bb00f56d4d"",
                    ""interactionDate"": ""2014-01-22T20:53:34.334Z"",
                    ""interactionType"": ""RequestCheck"",
                    ""isManual"": false,
                    ""isRecurring"": false,
                    ""orderId"": ""03e08dad17f36524580f187b000003b2"",
                    ""paymentEntryStatus"": ""New"",
                    ""paymentId"": ""8de25ac6365240aa86dfa2bb00f56a45"",
                    ""status"": ""CheckRequested""
                },
                {
                    ""amount"": 111.0,
                    ""auditInfo"": {
                        ""createBy"": ""af906ad3e35d441e88fed93cb303f63b"",
                        ""createDate"": ""2014-01-22T20:53:57.672Z"",
                        ""updateBy"": ""af906ad3e35d441e88fed93cb303f63b"",
                        ""updateDate"": ""2014-01-22T20:53:57.672Z""
                    },
                    ""currencyCode"": ""USD"",
                    ""id"": ""a440a52499f844438a23a2bb00f588a7"",
                    ""interactionDate"": ""2014-01-22T20:53:57.672Z"",
                    ""interactionType"": ""Capture"",
                    ""isManual"": true,
                    ""isRecurring"": false,
                    ""orderId"": ""03e08dad17f36524580f187b000003b2"",
                    ""paymentEntryStatus"": ""Pending"",
                    ""paymentId"": ""8de25ac6365240aa86dfa2bb00f56a45"",
                    ""status"": ""Captured""
                }
            ],
            ""isRecurring"": false,
            ""orderId"": ""03e08dad17f36524580f187b000003b2"",
            ""paymentType"": ""Check"",
            ""status"": ""Collected""
        }
    ],
    ""pickups"": [],
    ""returnStatus"": ""None"",
    ""shipments"": [],
    ""shippingDiscounts"": [
        {
            ""discount"": {
                ""discount"": {
                    ""id"": 221,
                    ""itemIds"": [],
                    ""name"": ""asd""
                },
                ""excluded"": false,
                ""impact"": 12.0
            },
            ""methodCode"": ""48f0a141cfe34a5996efa29d008825fc""
        }
    ],
    ""shippingSubTotal"": 30.0,
    ""shippingTaxTotal"": 0.0,
    ""shippingTotal"": 18.0,
    ""siteId"": 2370,
    ""status"": ""Processing"",
    ""submittedDate"": ""2014-01-22T20:53:34.318Z"",
    ""subtotal"": 113.95999999999999,
    ""taxTotal"": 0.0,
    ""tenantId"": 946,
    ""total"": 111.0,
    ""totalCollected"": 111.0,
    ""validationResults"": [],
    ""version"": ""9""
}";

        private static string _mockProduct = "{\"ProductCode\":\"test001\",\"ProductSequence\":1,\"ProductUsage\":\"Standard\",\"BundledProducts\":[],\"Content\":{\"ProductName\":\"Test001\",\"ProductFullDescription\":\"asdfasdfasdf\",\"ProductShortDescription\":\"asdfasdfasdfasdfasdf\",\"MetaTagTitle\":\"\",\"MetaTagDescription\":\"\",\"MetaTagKeywords\":\"\",\"SEOFriendlyUrl\":\"\",\"ProductImages\":[]},\"PurchasableState\":{\"IsPurchasable\":true,\"Messages\":[]},\"IsActive\":true,\"PublishState\":\"Live\",\"Price\":{\"Price\":111.0000,\"SalePrice\":110.0000},\"IsTaxable\":true,\"InventoryInfo\":{\"ManageStock\":true,\"OutOfStockBehavior\":\"DisplayMessage\",\"OnlineStockAvailable\":10,\"OnlineLocationCode\":\"homebase\"},\"CreateDate\":\"2013-09-26T18:52:56.1886\",\"Categories\":[{\"CategoryId\":33,\"Content\":{\"CategoryImages\":[],\"Name\":\"Clearance\",\"Description\":\"Clearance for items we couldn't sell.\",\"PageTitle\":\"Clearance\",\"MetaTagTitle\":\"Clearance\",\"MetaTagDescription\":\"Clearance\",\"MetaTagKeywords\":\"KYUPMYECL\",\"Slug\":\"clearance\"},\"ChildrenCategories\":[],\"Sequence\":16}],\"Measurements\":{\"PackageHeight\":{\"Unit\":\"in\",\"Value\":1.000},\"PackageWidth\":{\"Unit\":\"in\",\"Value\":1.000},\"PackageLength\":{\"Unit\":\"in\",\"Value\":1.000},\"PackageWeight\":{\"Unit\":\"lbs\",\"Value\":3.000}},\"Properties\":[{\"AttributeFQN\":\"tenant~availability\",\"IsHidden\":false,\"IsMultiValue\":false,\"AttributeDetail\":{\"ValueType\":\"Predefined\",\"InputType\":\"List\",\"DataType\":\"String\",\"UsageType\":\"Property\",\"DataTypeSequence\":1,\"Name\":\"Availability\"},\"Values\":[{\"Value\":\"24-48hrs\",\"StringValue\":\"Usually Ships in 24 to 48 Hours\"}]}]}";
        #endregion

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