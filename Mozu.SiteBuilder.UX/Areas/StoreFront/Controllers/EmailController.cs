using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Mvc;
using Autofac;
using Mozu.Core.Messaging.Contracts.Notification;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Mozu.Content.Contracts.Clients;
using Mozu.Core.Messaging.Contracts;
using DC = Mozu.Content.Contracts;

using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.Orders;
using Mozu.SiteBuilder.UX.Models.Checkout;
//using VMOrder = Mozu.SiteBuilder.UX.Models.Checkout.or;
using Mozu.SiteBuilder.UX.Models.StoreFront.CMS;
using Mozu.User.Contracts;
using VM = Mozu.SiteBuilder.Mvc.Models.CMS;
using AutoMapper;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ValidateInput(false)]
    public class EmailController : CmsPagesController
    {
        private readonly IOrderService _orderService;
        private readonly IViewEngine _viewEngine;
        private static List<EmailTypeInfo> g_emailTypeInfos;
        public class UserServiceMessageTopics
        {
            public const string PasswordReset = "user.passwordreset";
            public const string NewUserCreated = "user.created";
            public const string AdminUserInvited = "user.admin.invited";
            public const string AdminRoleAdded = "user.admin.roleadded";
        }

        static EmailController ()
        {
            g_emailTypeInfos = new List<EmailTypeInfo>()
                                   {
                                       new EmailTypeInfo()
                                           {
                                               ModelType = typeof (ResetPasswordEmailMessage),
                                               Template = "email/resetpassword",
                                               CmsDoc="resetpassword",
                                               Topic = string.Format("{0}.{1}",EmailNotification.PrimaryTopic, UserServiceMessageTopics.PasswordReset )
                                           },
                                       new EmailTypeInfo()
                                           {
                                               ModelType =  typeof (NewUserEmailMessage),
                                               Template = "email/newuser",
                                               CmsDoc="newuser",
                                               Topic = string.Format("{0}.{1}",EmailNotification.PrimaryTopic, UserServiceMessageTopics.NewUserCreated)
                                           },
                                        new EmailTypeInfo()
                                           {
                                               ModelType = typeof (Invitation),
                                               Template = "email/admininvite",
                                               CmsDoc="userinvited",
                                               Topic = string.Format("{0}.{1}",EmailNotification.PrimaryTopic, UserServiceMessageTopics.AdminUserInvited)
                                           },
                                           new EmailTypeInfo()
                                           {
                                               ModelType = typeof (Invitation),
                                               Template = "email/adminroleadded",
                                               CmsDoc="adminroleadded",
                                               Topic = string.Format("{0}.{1}",EmailNotification.PrimaryTopic, UserServiceMessageTopics.AdminRoleAdded)
                                           },
                                       new EmailTypeInfo()
                                           {
                                               ModelType = typeof (Mozu.CommerceRuntime.Contracts.Orders.Order ),
                                               MappingType = typeof(OrderInformation),
                                               Template = "email/orderstatus",
                                               CmsDoc="orderstatus",
                                               Topic = string.Format("{0}.{1}.{2}",EmailNotification.PrimaryTopic,"fuck", "me")//OrderNotificationTopics.TopicBase ,OrderNotificationTopics.Open ) //todo: fix this one...
                                           },
                                            new EmailTypeInfo()
                                           {
                                               ModelType = typeof (Mozu.CommerceRuntime.Contracts.Orders.Order ),
                                               MappingType = typeof(OrderInformation),
                                               Template = "email/orderstatus",
                                               CmsDoc="orderstatus",
                                               Topic = string.Format("{0}.{1}.{2}",EmailNotification.PrimaryTopic,"fuck", "me")//,OrderNotificationTopics.TopicBase ,OrderNotificationTopics.Cancelled   ) //todo: fix this one...
                                           },
                                            new EmailTypeInfo()
                                           {
                                               ModelType = typeof (Mozu.CommerceRuntime.Contracts.Orders.Order ),
                                               MappingType = typeof(OrderInformation),
                                               Template = "email/orderstatus",
                                               CmsDoc="orderstatus",
                                               Topic = string.Format("{0}.{1}.{2}",EmailNotification.PrimaryTopic,"fuck", "me")// OrderNotificationTopics.TopicBase , OrderNotificationTopics.Shipped   ) //todo: fix this one...
                                           },
                                            new EmailTypeInfo()
                                           {
                                               ModelType = typeof (Mozu.CommerceRuntime.Contracts.Orders.Order ),
                                               MappingType = typeof(OrderInformation),
                                               Template = "email/orderstatus",
                                               CmsDoc="orderstatus",
                                               Topic = string.Format("{0}.{1}.{2}",EmailNotification.PrimaryTopic,"fuck", "me")// OrderNotificationTopics.TopicBase , "fulfilled" ) //todo: fix this one...
                                           },

                                   };
            

        }
        public EmailController(IDocumentWebApiClient docRepo,
            IDocumentTypeWebApiClient docTypeRepo,
            ISiteBuilderContext context,
            ICmsServiceWrapper cmsService,
            IOrderService orderService,
            ICmsTypeHelper cmsTypeHelper,
            IViewEngine viewEngine)
            : base(docRepo, docTypeRepo, context, cmsService, cmsTypeHelper, null, null)
        {
            _orderService = orderService;
            _viewEngine = viewEngine;
        }

        //
        // GET: /StoreFront/Email/

        public async  Task<ActionResult> Preview(string id)
        {
            string emailTempalte = id;
            var res = await Page("email", emailTempalte);
            if (res is HttpNotFoundResult)
            {
                var reqDoc = new Mvc.Models.CMS.Admin.Document(){
                      DocumentListName = "email",
                      DocumentType = "email",
                      Name = emailTempalte ,
                      Items = new List<VM.Admin.DocumentProperty>()
                      {
                          new VM.Admin.DocumentProperty ()
                          {
                              Key = CmsConstants.Widgets.page_type_definition,
                              Value = "email"
                          }
                      }
                };

                var task = _cmsService.Create2(reqDoc);
                await task;
                
                //_cmsService.Create ( )
                //CreatePage("home page", "home", "home");

                res = await Page("email", emailTempalte);
            }
            ViewResult vr = res as ViewResult;
            vr.ViewName = "email/" + emailTempalte;
            this.ViewData["content"] = vr.Model;
            return View("email/" + emailTempalte, new List<int>());

        }

        [HttpPost]
        public  async Task<ActionResult>  Render()
        {
        	string topic;
        	string innerPayload;
        	var request = Request;
        	request.InputStream.Position = 0;

        	using (var reader = new StreamReader(request.InputStream))
        	{
        		JToken token = JObject.Parse(reader.ReadToEnd());
        		topic = (string) token.SelectToken("Topic").First();
        		innerPayload = (string) token.SelectToken("Payload").SelectToken("InnerPayload");
        	}



        	var emailTypeInfo = g_emailTypeInfos.FirstOrDefault(x => string.Equals(x.Topic, topic, StringComparison.OrdinalIgnoreCase));
        	if (emailTypeInfo == null)
        	{
        		return new HttpStatusCodeResult(400,"unknown topic " + topic);
        	}


        	var v = await  Page("email", emailTypeInfo.CmsDoc );
            object cmdContent = null;
        	var vr = v as ViewResult;
			if (vr !=null)
			{
				//ViewData["content"] = vr.Model;
			    cmdContent = vr.Model;
			}




        	//vr.ViewName = "email/" + emailTypeInfo.Template;
            

            object model  = Convert(innerPayload , emailTypeInfo );

            //var viewString = RenderViewToString(emailTypeInfo.Template , model, cmdContent);
            //var response = new EmailResponse
            //                   {
            //                       Subject = "TEST SUBJECT " + emailTypeInfo.Topic ,
            //                       Body = viewString
            //                   };

            return new EmailRenderActionResult(emailTypeInfo, emailTypeInfo.Template, model, cmdContent,_viewEngine );


        }
        class EmailRenderActionResult : JsonResult
        {
            private readonly EmailTypeInfo _emailInfo;
            private readonly string _viewName;
            private readonly object _model;
            private readonly object _cmsDoc;
            private readonly IViewEngine _viewEngine;

            public EmailRenderActionResult(EmailTypeInfo emailInfo, string viewName, object model, object cmsDoc, IViewEngine viewEngine)
            {
                _emailInfo = emailInfo;
                _viewName = viewName;
                _model = model;
                _cmsDoc = cmsDoc;
                _viewEngine = viewEngine;
            }

            public override void ExecuteResult(ControllerContext context)
            {
                 var viewString = RenderViewToString(_emailInfo.Template , _model, _cmsDoc, context );
                var response = new EmailResponse
                               {
                                   Subject = "TEST SUBJECT " + _emailInfo.Topic ,
                                   Body = viewString
                               };
                this.Data = response;
                base.ExecuteResult(context);
            }
            private string RenderViewToString(string viewName, object model, object cmsDoc, ControllerContext context)
            {
              
                using (var sw = new StringWriter())
                {
                    var viewResult = _viewEngine.FindView(context, viewName, null, true);
                    var viewContext = new ViewContext(context, viewResult.View, new ViewDataDictionary(model), new TempDataDictionary(), sw);
                    viewContext.ViewData["content"] = cmsDoc;
                    viewResult.View.Render(viewContext, sw);
                    viewResult.ViewEngine.ReleaseView(context, viewResult.View);
                    return sw.GetStringBuilder().ToString();
                }
            }
        }

        private static object Convert(string json, EmailTypeInfo eti)
        {
            if (eti == null || eti.ModelType == null)
            {
                return JsonConvert.DeserializeObject(json);
            }
            var jobj = JsonConvert.DeserializeObject(json, eti.ModelType);
            if (eti.MappingType != null)
            {
                jobj = AutoMapper.Mapper.Map(jobj, eti.ModelType, eti.MappingType);
            }
            return jobj;
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
        public string Template { get; set; }
        public Type ModelType { get; set; }

        public string CmsDoc { get; set; }

        public Type MappingType { get; set; }
    }
}
