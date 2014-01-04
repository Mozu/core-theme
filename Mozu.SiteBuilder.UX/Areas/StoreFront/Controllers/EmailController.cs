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
using Mozu.Core.Logging;
using Mozu.Core.Messaging.Contracts.Notification;
using Mozu.Customer.Contracts;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.Mvc.Models.CMS.Admin;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models.StoreFront.CMS;
using Mozu.Tenant.Contracts.Clients;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using DC = Mozu.Content.Contracts;
//using VMOrder = Mozu.SiteBuilder.UX.Models.Checkout.or;
using VM = Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.Customer.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ContextInitialization]
    public class EmailController : CmsPagesController
    {
        private readonly ISitesWebApiClient _sitesWebApiClient;
        private readonly ILogger _logger;
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
                                               ModelType = typeof (Order),
                                               Topic = Topics.OrderEmailTopic
                                           },
                                       new EmailTypeInfo
                                           {
                                               ModelType = typeof (Order),
                                               Topic = Topics.OrderShippedTopic
                                           }
                                   };
        }

        public EmailController(IDocumentListWebApiClient docRepo,
                               IDocumentTypeWebApiClient docTypeRepo,
                               ICmsServiceWrapper cmsService,
                               ICmsTypeHelper cmsTypeHelper,
                               ICustomerAccountWebApiClient customerAccountWebApiClient,
                               HyprViewEngine hyprViewEngine,
                                Mozu.Tenant.Contracts.Clients.ISitesWebApiClient sitesWebApiClient,
                                ILogger logger 

            )
            : base(docRepo, docTypeRepo, cmsService, cmsTypeHelper, customerAccountWebApiClient, hyprViewEngine)
        {
            _sitesWebApiClient = sitesWebApiClient.CloneWithoutUserClaims();
            _logger = logger;
        }

        //
        // GET: /StoreFront/Email/
        [HttpGet]
        public async Task<HttpResponseMessage> Preview(string id)
        {
            VM.PageTypeDefinition emailTempalte = SiteContext.Theme.EmailTemplates.FirstOrDefault(x => string.Equals(x.Id, id, StringComparison.OrdinalIgnoreCase));

            EmailTypeInfo emailTypeInfo = g_emailTypeInfos.FirstOrDefault(x => string.Equals(x.Topic, id, StringComparison.OrdinalIgnoreCase));

            var model = new object();

            if (emailTypeInfo != null  && emailTypeInfo.ModelType == typeof (Order))
            {
                model = JsonConvert.DeserializeObject<Order>(_mockOrder);
            }
            var site = (await _sitesWebApiClient.GetSite(this.SbApiContext.SiteId)).ReadAsSync();
            HttpResponseMessage res = await Page("email", GetCmsPage(emailTempalte));
            if (res.StatusCode == HttpStatusCode.NotFound)
            {
                var reqDoc = new Document
                                 {
                                     DocumentListName = "email",
                                     DocumentType = "email",
                                     Name = GetCmsPage(emailTempalte) 
                                     //Items = emailTempalte.Properties == null ? null : emailTempalte.Properties..Select(_=> _.k)
                                     //Items = new List<VM.Admin.DocumentProperty>()
                                     //{
                                     //    new VM.Admin.DocumentProperty ()
                                     //    {
                                     //        Key = CmsConstants.Widgets.page_type_definition,
                                     //        Value = "subject"
                                     //    }
                                     //}
                                 };

                Task<ServiceClientResponse<DC.Document>> task = _cmsService.Create2(reqDoc);
                await task;

                //_cmsService.Create ( )
                //CreatePage("home page", "home", "home");

                res = await Page("email", GetCmsPage(emailTempalte));
            }

            PageContext.PageType = "email";
            var vr = ((ObjectContent) res.Content).Value as ViewResult;
            vr.ViewName = emailTempalte.Template;
            ViewData["content"] = vr.Model;
            ViewData["domainName"] = site.Domains.Where(x => x.IsPrimary).Select(x => x.DomainName).FirstOrDefault();



            return Request.CreateResponse(HttpStatusCode.OK, View(emailTempalte.Template, model));
        }

        private static string _mockOrder = @"{""orderNumber"":409,""version"":""5"",""originalCartId"":""03c791ce4fdce02cd0c0cd2e00001775"",""availableActions"":[""SetOrderAsProcessing""],""customerAccountId"":1200,""isTaxExempt"":false,""email"":""travis_johnson@volusion.com"",""status"":""Accepted"",""paymentStatus"":""Pending"",""returnStatus"":""None"",""isEligibleForReturns"":false,""totalCollected"":0,""attributes"":[],""shippingDiscounts"":[],""handlingAmount"":0,""handlingTotal"":0,""fulfillmentStatus"":""NotFulfilled"",""submittedDate"":""2014-01-03T23:26:49.374Z"",""acceptedDate"":""2014-01-03T23:26:49.436Z"",""notes"":[],""items"":[{""id"":""b47e17af48eb41758893a2a8011f66d0"",""originalCartItemId"":""8fef0900324d46a188faa2a8011f61a8"",""fulfillmentLocationCode"":""homebase"",""fulfillmentMethod"":""Ship"",""product"":{""name"":""Chair for Sitting"",""description"":""A chair is a piece of furniture with a raised surface used to sit on, commonly for use by one person. Chairs are most often supported by four legs and have a back;[1][2] however, a chair can have thr"",""imageUrl"":""/files/6005/1/3cd92c5b-7ebc-49fe-8004-45cfa37fb7b9"",""productCode"":""Chair"",""options"":[],""properties"":[],""categories"":[{""id"":5,""parent"":{""id"":6,""parent"":{""id"":10}}},{""id"":6,""parent"":{""id"":10}},{""id"":7},{""id"":8,""parent"":{""id"":7}},{""id"":9},{""id"":10},{""id"":11,""parent"":{""id"":10}},{""id"":26},{""id"":27},{""id"":28},{""id"":29,""parent"":{""id"":31}},{""id"":30,""parent"":{""id"":8,""parent"":{""id"":7}}},{""id"":31},{""id"":32,""parent"":{""id"":31}},{""id"":69,""parent"":{""id"":7}}],""price"":{""price"":45.55,""salePrice"":40.1},""measurements"":{""height"":{""unit"":""in"",""value"":1},""width"":{""unit"":""in"",""value"":5},""length"":{""unit"":""in"",""value"":10},""weight"":{""unit"":""lbs"",""value"":15}},""isTaxable"":true,""isPackagedStandAlone"":false,""productReservationId"":15,""productUsage"":""Standard"",""bundledProducts"":[]},""quantity"":1,""subtotal"":45.55,""extendedTotal"":40.1,""taxableTotal"":0,""discountTotal"":5.45,""discountedTotal"":40.1,""itemTaxTotal"":0,""shippingTaxTotal"":0,""feeTotal"":0,""total"":40.1,""unitPrice"":{""baseAmount"":45.55,""extendedAmount"":40.1,""listAmount"":45.55,""saleAmount"":40.1,""discountAmount"":5.45,""discountedAmount"":40.1},""productDiscounts"":[],""shippingDiscounts"":[],""auditInfo"":{}}],""validationResults"":[],""billingInfo"":{""paymentType"":""Check"",""billingContact"":{""id"":-1,""email"":""travis_johnson@volusion.com"",""firstName"":""Jonny"",""lastNameOrSurname"":""Appleseed"",""phoneNumbers"":{""home"":""123-456-7890""},""address"":{""address1"":""204 Kramer Lane"",""address2"":"""",""cityOrTown"":""Austin"",""stateOrProvince"":""TX"",""postalOrZipCode"":""78749"",""countryCode"":""US"",""addressType"":""None"",""isValidated"":false}},""isSameBillingShippingAddress"":true,""card"":{""isUsedRecurring"":false,""isCardInfoSaved"":false,""expireMonth"":0,""expireYear"":0},""auditInfo"":{""updateDate"":""2014-01-03T23:26:46.612Z"",""createDate"":""2014-01-03T23:26:46.612Z"",""updateBy"":""f35c0360e3ce45c2b73beb97f11fc3fa"",""createBy"":""f35c0360e3ce45c2b73beb97f11fc3fa""}},""payments"":[{""id"":""15cfc1f42c26455bbb50a2a8011f8181"",""availableActions"":[""CapturePayment"",""DeclinePayment"",""VoidPayment""],""orderId"":""03c7a51e4fdce02cd0c0cd3f00001775"",""paymentType"":""Check"",""billingInfo"":{""paymentType"":""Check"",""billingContact"":{""id"":-1,""email"":""travis_johnson@volusion.com"",""firstName"":""Jonny"",""lastNameOrSurname"":""Appleseed"",""phoneNumbers"":{""home"":""123-456-7890""},""address"":{""address1"":""204 Kramer Lane"",""address2"":"""",""cityOrTown"":""Austin"",""stateOrProvince"":""TX"",""postalOrZipCode"":""78749"",""countryCode"":""US"",""addressType"":""None"",""isValidated"":false}},""isSameBillingShippingAddress"":true,""card"":{""isUsedRecurring"":false,""isCardInfoSaved"":false,""expireMonth"":0,""expireYear"":0},""auditInfo"":{""updateDate"":""2014-01-03T23:26:46.612Z"",""createDate"":""2014-01-03T23:26:46.612Z"",""updateBy"":""f35c0360e3ce45c2b73beb97f11fc3fa"",""createBy"":""f35c0360e3ce45c2b73beb97f11fc3fa""}},""status"":""Pending"",""interactions"":[{""id"":""3df798f4119a44bb9169a2a8011f84d0"",""paymentId"":""15cfc1f42c26455bbb50a2a8011f8181"",""orderId"":""03c7a51e4fdce02cd0c0cd3f00001775"",""currencyCode"":""USD"",""interactionType"":""RequestCheck"",""status"":""CheckRequested"",""paymentEntryStatus"":""New"",""isRecurring"":false,""isManual"":false,""amount"":99,""interactionDate"":""2014-01-03T23:26:49.436Z"",""auditInfo"":{""updateDate"":""2014-01-03T23:26:49.436Z"",""createDate"":""2014-01-03T23:26:49.436Z"",""updateBy"":""f35c0360e3ce45c2b73beb97f11fc3fa"",""createBy"":""f35c0360e3ce45c2b73beb97f11fc3fa""}}],""isRecurring"":false,""amountCollected"":0,""amountCredited"":0,""amountRequested"":99,""auditInfo"":{""updateDate"":""2014-01-03T23:26:46.612Z"",""createDate"":""2014-01-03T23:26:46.612Z"",""updateBy"":""f35c0360e3ce45c2b73beb97f11fc3fa"",""createBy"":""f35c0360e3ce45c2b73beb97f11fc3fa""}}],""packages"":[],""pickups"":[],""shipments"":[],""isDraft"":false,""hasDraft"":false,""isImport"":false,""couponCodes"":[],""amountAvailableForRefund"":0,""amountRemainingForPayment"":0,""id"":""03c7a51e4fdce02cd0c0cd3f00001775"",""tenantId"":6005,""siteId"":7332,""channelCode"":""store"",""currencyCode"":""usd"",""customerInteractionType"":""Unknown"",""fulfillmentInfo"":{""fulfillmentContact"":{""id"":1121,""email"":""travis_johnson@volusion.com"",""firstName"":""Jonny"",""lastNameOrSurname"":""Appleseed"",""phoneNumbers"":{""home"":""123-456-7890""},""address"":{""address1"":""204 Kramer Lane"",""address2"":"""",""cityOrTown"":""Austin"",""stateOrProvince"":""TX"",""postalOrZipCode"":""78749"",""countryCode"":""US"",""addressType"":""None"",""isValidated"":false}},""isDestinationCommercial"":false,""shippingMethodCode"":""6b8fff4f3f0a4ca0ac13a27c00e65747"",""shippingMethodName"":""oboe Xpress III"",""auditInfo"":{""updateDate"":""2014-01-03T23:26:32.774Z"",""createDate"":""2014-01-03T23:26:23.851Z"",""updateBy"":""f35c0360e3ce45c2b73beb97f11fc3fa"",""createBy"":""f35c0360e3ce45c2b73beb97f11fc3fa""}},""orderDiscounts"":[{""impact"":40.1,""discount"":{""id"":2,""name"":""Blah"",""itemIds"":[]},""excluded"":false}],""subtotal"":45.55,""discountedSubtotal"":40.1,""discountTotal"":45.55,""discountedTotal"":0,""shippingTotal"":99,""shippingSubTotal"":99,""shippingTaxTotal"":0,""handlingTaxTotal"":0,""itemTaxTotal"":0,""taxTotal"":0,""feeTotal"":0,""total"":99,""lastValidationDate"":""2014-01-03T23:26:34.849Z"",""changeMessages"":[{""id"":""6fd1b19f0bb84bbdb7b4a2a8011f66d5"",""subjectType"":""Order"",""identifier"":""03c7a51e4fdce02cd0c0cd3f00001775"",""subject"":""Shipment Info Updated"",""verb"":""Updated"",""message"":""Shipment information was updated."",""createDate"":""2014-01-03T23:26:23.851Z""},{""id"":""c47bb064ea85407e83d4a2a8011f6e74"",""subjectType"":""Order"",""identifier"":""03c7a51e4fdce02cd0c0cd3f00001775"",""subject"":""Shipment Info Updated"",""verb"":""Updated"",""message"":""Shipment information was updated."",""createDate"":""2014-01-03T23:26:30.356Z""},{""id"":""b092f272d89f4b37a9bba2a8011f714a"",""subjectType"":""Order"",""identifier"":""03c7a51e4fdce02cd0c0cd3f00001775"",""subject"":""Shipment Info Updated"",""verb"":""Updated"",""message"":""Shipment information was updated."",""createDate"":""2014-01-03T23:26:32.774Z""}],""auditInfo"":{""updateDate"":""2014-01-03T23:26:49.514Z"",""createDate"":""2014-01-03T23:26:23.975Z"",""updateBy"":""f35c0360e3ce45c2b73beb97f11fc3fa"",""createBy"":""f35c0360e3ce45c2b73beb97f11fc3fa""}}";

        [HttpPost]
        public async Task<HttpResponseMessage> Render(EmailNotification notification)
        {
            string topic;
            string innerPayload;
            int? customerAccountId;
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
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "no templates defined for  topic " + notification.Topic);
            }

            var site = (await _sitesWebApiClient.GetSite(this.SbApiContext.SiteId)).ReadAsSync();
            HttpResponseMessage v = await Page("email", GetCmsPage(emailTempalte));
            object cmdContent = null;
            var vr = ((ObjectContent) v.Content).Value as ViewResult;
            if (vr != null)
            {
                ViewData["content"] = vr.Model;
                cmdContent = vr.Model;
            }


            //vr.ViewName = "email/" + emailTypeInfo.Template;


            _logger.Info(string.Format("raw payload for topic:{0} messageId:{1}", notification.MessageId, notification.Topic), notification.Payload);


            object model = Convert(notification.Payload, emailTypeInfo);

            try
            {
                var txt = JsonConvert.SerializeObject(model);
                _logger.Info(string.Format("de-serialized payload for topic:{0} messageId:{1}", notification.MessageId, notification.Topic),txt);
            }
            catch (Exception ex)
            {
                _logger.Error(ex);
            }

        var viewEngine = Request.Resolve<HyprViewEngine>();
            var view = viewEngine.FindPageView(emailTempalte.Template);
            var vdd = new ViewDataDictionary();
            vdd["model"] = model;
            vdd["content"] = cmdContent;
            vdd["User"] = user;
            ViewData["domainName"] = site.Domains.Where(x => x.IsPrimary).Select(x => x.DomainName).FirstOrDefault();

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
            return def.Id.Replace(".", "~");
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