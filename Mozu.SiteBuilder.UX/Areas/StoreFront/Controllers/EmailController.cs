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
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Messaging.Contracts.Notification;
using Mozu.Customer.Contracts;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.Mvc.Models.CMS.Admin;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models.StoreFront.CMS;

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using DC = Mozu.Content.Contracts;
//using VMOrder = Mozu.SiteBuilder.UX.Models.Checkout.or;
using VM = Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.Customer.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [InitCmsPageContextActionFilter]
    public class EmailController : CmsPagesController
    {
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
                               HyprViewEngine hyprViewEngine)
            : base(docRepo, docTypeRepo, cmsService, cmsTypeHelper, customerAccountWebApiClient, hyprViewEngine)
        {
        }

        //
        // GET: /StoreFront/Email/
        [HttpGet]
        public async Task<HttpResponseMessage> Preview(string id)
        {
            VM.PageTypeDefinition emailTempalte = SiteContext.Theme.EmailTemplates.FirstOrDefault(x => string.Equals(x.Id, id, StringComparison.OrdinalIgnoreCase));


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

            return Request.CreateResponse(HttpStatusCode.OK, View(emailTempalte.Template, new object()));
        }

        [HttpPost]
        public async Task<HttpResponseMessage> Render(EmailNotification notification)
        {
            string topic;
            string innerPayload;
            int? customerAccountId;
            UX.Models.Customers.User user = null;
            HttpRequestBase request = HttpRequestBase;





            if (notification.MessagePublishingContext != null && !string.IsNullOrEmpty(notification.MessagePublishingContext.CustomerId ))
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

            
            

            //if (topic.StartsWith(EmailNotification.PrimaryTopic))
            //{
            //    topic = topic.Substring(EmailNotification.PrimaryTopic.Length + 1);
            //}

            EmailTypeInfo emailTypeInfo = g_emailTypeInfos.FirstOrDefault(x => string.Equals(x.Topic, notification.Topic , StringComparison.OrdinalIgnoreCase));

            VM.PageTypeDefinition emailTempalte = SiteContext.Theme.EmailTemplates.FirstOrDefault(x => string.Equals(x.Id, notification.Topic, StringComparison.OrdinalIgnoreCase));

            if (emailTempalte == null)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "no templates defined for  topic " + notification.Topic);
            }


            HttpResponseMessage v = await Page("email", GetCmsPage(emailTempalte));
            object cmdContent = null;
            var vr = ((ObjectContent) v.Content).Value as ViewResult;
            if (vr != null)
            {
                ViewData["content"] = vr.Model;
                cmdContent = vr.Model;
            }


            //vr.ViewName = "email/" + emailTypeInfo.Template;


            object model = Convert(notification.Payload , emailTypeInfo);




            var viewEngine = Request.Resolve<HyprViewEngine>();
            var view = viewEngine.FindPageView(emailTempalte.Template);
            var vdd = new ViewDataDictionary();
            vdd["model"] = model;
            vdd["content"] = cmdContent;
            vdd["User"] = user;

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