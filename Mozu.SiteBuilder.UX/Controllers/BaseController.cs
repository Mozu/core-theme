using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Mozu.Content.Contracts;
using Mozu.Core.Api.Contracts.Client;
using Mozu.SiteBuilder.Mvc;
using System.Web.Routing;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Tags;
using Autofac;
using Mozu.SiteBuilder.UX.Models.Checkout;

namespace Mozu.SiteBuilder.UX.Controllers
{
    public abstract class BaseController : Controller
    {
        public BaseController()//( IComponentContext container)
        {
            
            //SiteContext = container.Resolve<ISiteBuilderContext>();
        }


        //public IComponentContext ServiceLocator
        //{
        //    get;
        //    set;
        //}


        public async Task<bool> AsyncInitWidgetData()
        {
            var wctx = SiteContext.PageContext.WidgetContext;
            if (wctx == null)
            {
                return false;
            }
            Task<ServiceClientResponse<Mozu.Content.Contracts.Document>> pageTask = null;
            Task<ServiceClientResponse<Mozu.Content.Contracts.Document>> templateTask = null;
            Task<ServiceClientResponse<Mozu.Content.Contracts.Document>> siteTemplateTask = null;
            List<Task<ServiceClientResponse<Mozu.Content.Contracts.Document>>> tasks = new List<Task<ServiceClientResponse<Document>>>();
            if (wctx.PageId != null && wctx.Page == null)
            {
                pageTask = CmsService.Get("pages", wctx.PageId);
                tasks.Add(pageTask);
            }
            if (wctx.TemplateId != null && wctx.Template == null)
            {
                templateTask = CmsService.Get("templates", wctx.PageId);
                tasks.Add(templateTask);
            }
            if (wctx.SiteTemplateId != null && wctx.SiteTemplate == null)
            {
                siteTemplateTask = CmsService.Get("templates", wctx.PageId);
                tasks.Add(siteTemplateTask);
            }
            if (wctx.PageName  != null && wctx.Page == null)
            {
                pageTask = CmsService.GetByPath("pages", wctx.PageName);
                tasks.Add(pageTask);
            }
            if (wctx.TemplateName != null && wctx.Template == null)
            {
                templateTask = CmsService.Get("templates", wctx.TemplateName);
                tasks.Add(templateTask);
            }
            if (wctx.SiteTemplateName != null && wctx.SiteTemplate == null)
            {
                siteTemplateTask = CmsService.Get("templates", wctx.SiteTemplateName);
                tasks.Add(siteTemplateTask);
            }

           
            await Task.WhenAll(tasks.ToArray());
            if (pageTask != null && pageTask.Result.ResponseMessage.IsSuccessStatusCode)
            {
                wctx.Page = pageTask.Result.ReadAsSync();
            }
            if (templateTask != null && templateTask.Result.ResponseMessage.IsSuccessStatusCode)
            {
                wctx.Template  = templateTask.Result.ReadAsSync();
            }
            if (siteTemplateTask != null && siteTemplateTask.Result.ResponseMessage.IsSuccessStatusCode)
            {
                wctx.SiteTemplate = siteTemplateTask.Result.ReadAsSync();
            }
            

            wctx.Initialized = true;
            return true;


        }


       
        protected override void Execute(RequestContext requestContext)
        {
           // var isEditMode = ;
            bool isEditModeFlg;
            
            if ( requestContext.HttpContext!= null  &&
                bool.TryParse(requestContext.HttpContext.Request ["isEditMode"] as string, out isEditModeFlg) && isEditModeFlg)
            {
                this.SiteContext.IsEditMode = isEditModeFlg;
            }
            base.Execute(requestContext);
        }
        ISiteBuilderContext _sc;
        public ISiteBuilderContext SiteContext
        {
            get
            {
                if (_sc == null)
                {
                    _sc = DependencyResolver.Current.GetService<ISiteBuilderContext>();
                }
                return _sc;
            }
            set
            {
                _sc = value;
            }
        }

        private ICmsServiceWrapper _cmsService;
        public ICmsServiceWrapper CmsService
        {
            get
            {
                if (_cmsService == null)
                {
                    _cmsService = DependencyResolver.Current.GetService<ICmsServiceWrapper>();
                }
                return _cmsService;
            }
            set
            {
                _cmsService = value;
            } 
        }
   

        public RouteValueDictionary DjangoTemplateTagArguments
        {
            get
            {
                if (ControllerContext == null)
                    return null;

                object obj;
                if (this.ControllerContext.RequestContext.RouteData.Values.TryGetValue(ArgumentCollection.ArgumentDictionaryKey, out  obj))
                {
                    return (RouteValueDictionary)obj;
                }
                return null;
            }
        }

        protected override ViewResult View(string viewName, string masterName, object model)
        {
            var args = this.DjangoTemplateTagArguments;

            if ( args != null )
            {
                object overrideViewName;
                if ( args.TryGetValue ( "viewName", out overrideViewName )&& overrideViewName is string )
                {
                    viewName  = (string)overrideViewName;
                }
            }
            return base.View(viewName, masterName, model);
        }

        protected override void OnResultExecuting(ResultExecutingContext filterContext)
        {

            var od = this.DjangoTemplateTagArguments;
            if (od != null)
            {
                foreach (var kvp in od)
                {
                    if (!this.ViewData.ContainsKey(kvp.Key))
                    {
                        this.ViewData[kvp.Key] = kvp.Value;
                    }
                }
            }
            base.OnResultExecuting(filterContext);
        }
    }
}
