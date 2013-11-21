using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using Autofac;
using Mozu.Core.Messaging.Contracts.Notification;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.Models.CMS.Admin;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Controllers;
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
using System.Linq;
using AutoMapper;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
 
    public class EmailController : CmsPagesController
    {
      
       
        private static List<EmailTypeInfo> g_emailTypeInfos;
        public class Topics
        {
            public const string PasswordReset = "user.passwordreset";
            public const string NewUserCreated = "user.created";
        public const string OrderEmailTopic = "order.changed";
            public const string OrderShippedTopic = "order.shipped";
        }

        static EmailController ()
        {
            g_emailTypeInfos = new List<EmailTypeInfo>()
                                   {
                                       new EmailTypeInfo()
                                           {
                                               ModelType = typeof (ResetPasswordEmailMessage),
                                          
                                              Topic =  Topics.PasswordReset 
                                           },
                                       new EmailTypeInfo()
                                           {
                                               ModelType =  typeof (NewUserEmailMessage),
                                               Topic = Topics.NewUserCreated
                                           },
                                    
                                       new EmailTypeInfo()
                                           {
                                               ModelType = typeof (Mozu.CommerceRuntime.Contracts.Orders.Order ),
                                              
                                               Topic = Topics.OrderEmailTopic
                                           },
                                            new EmailTypeInfo()
                                           {
                                               ModelType = typeof (Mozu.CommerceRuntime.Contracts.Orders.Order ),
                                          
                                               Topic = Topics.OrderShippedTopic 
                                           }

                                   };
            

        }
        public EmailController(IDocumentListWebApiClient docRepo,
            IDocumentTypeWebApiClient docTypeRepo,
            
            ICmsServiceWrapper cmsService,
          
            ICmsTypeHelper cmsTypeHelper,

            HyprViewEngine hyprViewEngine)
            : base(docRepo, docTypeRepo,  cmsService, cmsTypeHelper, hyprViewEngine)
        {
            
        }

        //
        // GET: /StoreFront/Email/
          [System.Web.Http.HttpGet]
        public async  Task<HttpResponseMessage> Preview(string id)
        {
            
           var emailTempalte=    this.SiteContext.Theme.EmailTemplates.FirstOrDefault(x => string.Equals(x.Id, id, StringComparison.OrdinalIgnoreCase));


           var res = await Page("email", GetCmsPage(emailTempalte));
            if (res.StatusCode == HttpStatusCode.NotFound  )
            {
                var reqDoc = new Mvc.Models.CMS.Admin.Document(){
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

                var task = _cmsService.Create2(reqDoc);
                await task;
                
                //_cmsService.Create ( )
                //CreatePage("home page", "home", "home");

                res = await Page("email", emailTempalte.Template  );
            }

            ViewResult vr = ((ObjectContent )res.Content).Value   as ViewResult;
              vr.ViewName = emailTempalte.Template;
            this.ViewData["content"] = vr.Model;
            
            return this.Request.CreateResponse(HttpStatusCode.OK, View(emailTempalte.Template, new List<int>()));

        }

        [HttpPost]
        public  async Task<HttpResponseMessage >  Render()
        {
        	string topic;
        	string innerPayload;
        	var request = HttpRequestBase;
        	request.InputStream.Position = 0;

        	using (var reader = new StreamReader(request.InputStream))
        	{
        		JToken token = JObject.Parse(reader.ReadToEnd());
        		topic = (string) token.SelectToken("Topic").First();
        		innerPayload = (string) token.SelectToken("Payload").SelectToken("InnerPayload");
        	}

            if (topic.StartsWith(EmailNotification.PrimaryTopic))
            {
                topic = topic.Substring(EmailNotification.PrimaryTopic.Length +1 );
            }

        	var emailTypeInfo = g_emailTypeInfos.FirstOrDefault(x => string.Equals(x.Topic, topic, StringComparison.OrdinalIgnoreCase));

            var emailTempalte = this.SiteContext.Theme.EmailTemplates.FirstOrDefault(x => string.Equals(x.Id, topic, StringComparison.OrdinalIgnoreCase));

        	if (emailTypeInfo == null)
        	{
        		return this.Request.CreateErrorResponse( HttpStatusCode.BadRequest ,"unknown topic " + topic);
        	}


            var v = await Page("email", GetCmsPage(emailTempalte));
            object cmdContent = null;
        	var vr = ((ObjectContent) v.Content).Value as ViewResult  ;
			if (vr !=null)
			{
				ViewData["content"] = vr.Model;
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
            return this.Request.CreateResponse(HttpStatusCode.OK, new EmailRenderActionResult(emailTypeInfo, emailTempalte.Template , model, cmdContent));


        }
        class EmailRenderActionResult : ActionResult 
        {
            private readonly EmailTypeInfo _emailInfo;
            private readonly string _viewName;
            private readonly object _model;
            private readonly object _cmsDoc;
          

            public EmailRenderActionResult(EmailTypeInfo emailInfo, string viewName, object model, object cmsDoc)
            {
                _emailInfo = emailInfo;
                _viewName = viewName;
                _model = model;
                _cmsDoc = cmsDoc;
            }

            public override void ExecuteResult(HttpRequestMessage requestMessage)
            {
               throw new NotImplementedException();
                //todo:hyper reimplemnt email.
                // var viewString = RenderViewToString(_emailInfo.Template , _model, _cmsDoc, context );
                //var response = new EmailResponse
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

        private static object Convert(string json, EmailTypeInfo eti)
        {
            if (eti == null || eti.ModelType == null)
            {
                return JsonConvert.DeserializeObject(json);
            }
            var jobj = JsonConvert.DeserializeObject(json, eti.ModelType);
            //if (eti.MappingType != null)
            //{
            //    jobj = AutoMapper.Mapper.Map(jobj, eti.ModelType, eti.MappingType);
            //}
            return jobj;
        }

        string GetCmsPage(PageTypeDefinition def)
        {
            return def.Id.Replace(".", "~");
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
