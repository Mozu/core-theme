using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.CommerceRuntime.Contracts.Fulfillment;
using Mozu.CommerceRuntime.Contracts.Orders;

using Mozu.Content.Contracts.Clients;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Extensions;
using Mozu.Core.Logging;
using Mozu.Core.Messaging.Contracts.Notification;
using Mozu.Customer.Contracts.Clients;
using Mozu.Location.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.TestData;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models.Admin.Email;
using Mozu.SiteBuilder.UX.Models.Customers;
using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;
using Newtonsoft.Json;
using DC = Mozu.Content.Contracts;
using VM = Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.SEO;
using Newtonsoft.Json.Serialization;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ContextInitialization]
    public class EmailController : CmsPagesController
    {
        private readonly ISitesWebApiClient _sitesWebApiClient;
        private readonly ILogger _logger;
        private readonly ILocationRuntimeWebApiClient _locationRuntimeWebApiClient;
        private readonly ICustomerAccountWebApiClient _customerAccountWebApiClient;
        private static readonly List<EmailTypeInfo> g_emailTypeInfos;

        static EmailController()
        {
            g_emailTypeInfos = new List<EmailTypeInfo>
                                   {
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
                                           },
                                           new EmailTypeInfo
                                           {
                                                ModelType = typeof(Mozu.Customer.Contracts.CustomerAccount),
                                                Topic = Topics.NewUserCreated
                                           },
                                           new EmailTypeInfo
                                           {
                                                ModelType = typeof(Mozu.Customer.Contracts.CustomerAccount),
                                                Topic = Topics.PasswordReset
                                           }
                                   };
        }

        public EmailController(
            IDocumentListWebApiClient docRepo,
            IDocumentTypeWebApiClient docTypeRepo,
            ICmsServiceWrapper cmsService,
            ICustomerAccountWebApiClient customerAccountWebApiClient,
            HyprViewEngine hyprViewEngine,
            IServiceClientBase<ISitesWebApiClient> sitesWebApiClient,
            ILogger logger,
            IServiceClientBase<ILocationRuntimeWebApiClient> locationRuntimeWebApiClient,
            ISiteRouteHandler siteRouteHandler
            )
            : base(docRepo, docTypeRepo, cmsService,
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
            var emailTemplate = SiteContext.Theme.EmailTemplates.FirstOrDefault(x => x.Id.EqualsIgnoreCase(id));
            if (emailTemplate == null)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, "could not find an email template for the current Theme.");
            }

            var model = TestDataBroker.GetFileContents(id).FirstOrDefault() ?? new object();
            if (model != null)
            {
                var emailTypeInfo = g_emailTypeInfos.FirstOrDefault(x => string.Equals(x.Topic , id, StringComparison.OrdinalIgnoreCase));
                if (emailTypeInfo.ModelType == typeof (Order))
                {
                    var ser = new JsonSerializerSettings();
                    ser.ContractResolver = new CamelCasePropertyNamesContractResolver();
                    var str = JsonConvert.SerializeObject(model, ser);
                    model = Convert(str, emailTypeInfo);    
                }
                
            }
            var site = (await _sitesWebApiClient.GetSite(SbApiContext.SiteId)).ReadAsSync();
            var res = await Page("emailTemplateContent@mozu", GetCmsPage(emailTemplate));

            PageContext.CmsContext.Page.DocumentTypeFQN = "emailTemplateContent@mozu";
            PageContext.PageType = "email";

            if (res.IsSuccessStatusCode)
            {
                var vr = ((ObjectContent) res.Content).Value as ViewResult;
                if (vr == null)
                {
                    return Request.CreateErrorResponse(HttpStatusCode.Conflict, "could not fetch template content page.");
                }

                vr.ViewName = emailTemplate.Template;
                var doc = (DC.Document) vr.Model;
                if (doc != null)
                {
                    doc.Set("page_type_definition", id);
                }

                ViewData["content"] = vr.Model;
            }

            ViewData["domainName"] = site.Domains.Where(x => x.IsPrimary).Select(x => x.DomainName).FirstOrDefault();
            ViewData["rmaLocation"] = await GetDirectShipLocationOrDefault();

            return Request.CreateResponse(HttpStatusCode.OK, View(emailTemplate.Template, model));
        }

        [HttpPost]
        public async Task<HttpResponseMessage> Render(EmailNotification notification)
        {
            User user = null;
            var emailTypeInfo = g_emailTypeInfos.FirstOrDefault(x => string.Equals(x.Topic, notification.Topic, StringComparison.OrdinalIgnoreCase));
            var emailTemplate = SiteContext.Theme.EmailTemplates.FirstOrDefault(x => x.Id.EqualsIgnoreCase(notification.Topic));

            if (emailTemplate == null)
            {
                var warnMessage = "no templates defined for topic " + notification.Topic;
                _logger.Warn(warnMessage);
                return Request.CreateErrorResponse(HttpStatusCode.Gone, warnMessage);
            }

            if (notification.MessagePublishingContext != null && !string.IsNullOrEmpty(notification.MessagePublishingContext.CustomerId))
            {
                user = await TryGetUser(notification);
            }


            var site = (await _sitesWebApiClient.GetSite(SbApiContext.SiteId)).ReadAsSync();
            var v = await Page("emailTemplateContent@mozu", GetCmsPage(emailTemplate));
            object cmdContent = null;
            var vr = ((ObjectContent) v.Content).Value as ViewResult;
            if (vr != null)
            {
                ViewData["content"] = vr.Model;
                cmdContent = vr.Model;
            }

            _logger.Info(string.Format("raw payload for topic:{0} messageId:{1}", notification.MessageId, notification.Topic), notification);

            var model = Convert(notification.Payload, emailTypeInfo);
            
            try
            {
                _logger.Info(string.Format("de-serialized payload for topic:{0} messageId:{1}", notification.MessageId, notification.Topic), model);
            }
            catch (Exception ex)
            {
                _logger.Error(ex);
            }
            
            var renderedTemplate = await GetRenderedTemplate(notification, emailTemplate, model, cmdContent, user, site);
            if (renderedTemplate.IsNullOrEmpty()) return null;

            var response = new EmailResponse
            {
                Subject = emailTemplate.Title ?? notification.Topic,
                Body = renderedTemplate
            };

            return Request.CreateResponse(HttpStatusCode.OK, response);
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
            var viewEngine = Request.Resolve<HyprViewEngine>();
            var view = viewEngine.FindPageView(emailTemplate.Template);

            if (view == null)
            {
                var errMesage = string.Format("no template found for view:{0} topic{1}", emailTemplate.Template,
                    notification.Topic);
                _logger.Warn(errMesage);
                return String.Empty;
            }

            

            var vdd = new ViewDataDictionary();
            vdd["model"] = model;
            vdd["content"] = cmdContent;
            vdd["User"] = user;
            vdd["rmaLocation"] = await GetDirectShipLocationOrDefault();
            vdd["domainName"] = site.Domains.Where(x => x.IsPrimary).Select(x => x.DomainName).FirstOrDefault();

            var context = new HyprViewContext(Request, vdd);
            return await Render(view, context);
        }

        private async Task<Mozu.Location.Contracts.Location> GetDirectShipLocationOrDefault()
        {
            var locations = await _locationRuntimeWebApiClient.GetDirectShipLocation();
            return locations.ResponseMessage.IsSuccessStatusCode ? locations.ReadAsSync() : null;
        }

        private static async Task<string> Render(HyprView view, HyprViewContext context)
        {
            var stringWriter = new StringWriter();
            await view.AsyncRender(context, stringWriter);
            await stringWriter.FlushAsync();
            return stringWriter.ToString();
        }

        private static object Convert(string json, EmailTypeInfo eti)
        {
            if (eti == null || eti.ModelType == null)
            {
                return JsonConvert.DeserializeObject(json);
            }
            var obj = JsonConvert.DeserializeObject(json, eti.ModelType);
            var order = obj as Order;
            if (order != null)
            {
                if (order.Items != null && order.Packages != null && order.Packages.Count > 0)
                {
                    Hashtable ht = new Hashtable(StringComparer.OrdinalIgnoreCase);


                    foreach (var x in (order.Items).SelectMany(x => (x.Product.BundledProducts)).Where(x=> x != null))
                    
                    {
                        ht[x.ProductCode] = x;
                    }

                    foreach (var x in (order.Items).Select(x => x.Product).Where(x => x != null))
                    {
                        if ( !string.IsNullOrEmpty(x.VariationProductCode) )
                        {
                            ht[x.VariationProductCode] = x;
                        }
                        ht[x.ProductCode] = x;
                    }
                    foreach (Package p in order.Packages.Where(x => x.Items != null))
                    {
                        for (int i = 0; i < p.Items.Count; i++)
                        {
                            var packageItem = p.Items[i];
                            p.Items[i] = new MyPackageItem()
                                         {
                                             FulfillmentItemType = packageItem.FulfillmentItemType,
                                             Product = ht[packageItem.ProductCode],
                                             ProductCode = packageItem.ProductCode,
                                             Quantity = packageItem.Quantity
                                         };
                        }
                    }
              
                  
                }
            }
          
            return obj;

        }

        public class MyPackageItem : PackageItem
        {
            public object Product { get; set; }
        }
        private static string GetCmsPage(VM.PageTypeDefinition def)
        {
            return def.Id;
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