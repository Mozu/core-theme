using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Mozu.Content.Contracts;
using Mozu.Core;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc;
using System.Web.Routing;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Tags;
using Autofac;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.UX.Models.Checkout;

namespace Mozu.SiteBuilder.UX.Controllers
{
    public abstract class BaseController : Controller
    {
        private ILifetimeScope _lifetimeScope;

        public BaseController() //( IComponentContext container)
        {
            LifetimeScope = DependencyResolver.Current.GetService<ILifetimeScope>();
           
        }

        //tbd move to an action filter
        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {

            if (!filterContext.IsChildAction && (this.ApiContext.TenantId < 0 || !this.ApiContext.SiteId.HasValue))
            {
                var settings = LifetimeScope.Resolve<ISettings>();
                var redirUrl = settings.AppSettings("missingContextRedirect") ?? "/admin";
                filterContext.Result = new RedirectResult(redirUrl);
               

            }
            base.OnActionExecuting(filterContext);
        }

        public ILifetimeScope LifetimeScope
        {
            get { return _lifetimeScope; }
            set { _lifetimeScope = value; }
        }
        
    //public IComponentContext ServiceLocator
        //{
        //    get;
        //    set;
        //}


     

        public async Task<bool> AsyncInitData()
        {
            
            CmsHelper helper = new CmsHelper(this.CmsService);
            var ret =await helper.InitCmsPageContext(SiteContext.PageContext.CmsContext);
            return ret;

        }


        protected override IAsyncResult BeginExecute(RequestContext requestContext, AsyncCallback callback, object state)
        {
            bool isEditModeFlg;

            if (requestContext.HttpContext != null &&
                bool.TryParse(requestContext.HttpContext.Request["isEditMode"] as string, out isEditModeFlg) && isEditModeFlg)
            {
                this.SiteContext.IsEditMode = isEditModeFlg;
            }
            return base.BeginExecute(requestContext, callback, state);
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
                    _sc = LifetimeScope.Resolve<ISiteBuilderContext>();
                }
                return _sc;
            }
            set
            {
                _sc = value;
            }
        }

        private IApiContext _apiContext;

        public IApiContext ApiContext
        {
            get
            {
                if (_apiContext == null)
                {
                    _apiContext = LifetimeScope.Resolve<IApiContext>();
                }
                return _apiContext;
            }
            set { _apiContext = value; }
        }

        private ICmsServiceWrapper _cmsService;
        public ICmsServiceWrapper CmsService
        {
            get
            {
                if (_cmsService == null)
                {
                    _cmsService = LifetimeScope.Resolve<ICmsServiceWrapper>();
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
            if (this.SiteContext.PageContext != null && this.SiteContext.PageContext.CmsContext != null && !this.SiteContext.PageContext.CmsContext.Initialized)
            {
             //   var task = this.AsyncInitData();
              //  task.Wait();
            }
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
