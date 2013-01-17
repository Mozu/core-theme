using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Mozu.SiteBuilder.Mvc;
using System.Web.Routing;
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
        //protected override ViewResult View(IView view, object model)
        //{
        //    return base.View(view, model);
        //}

        //protected override ViewResult View(IView view, object model)
        //{
        //    if (model != null)
        //    {
        //        base.ViewData.Model = model;
        //    }
        //    ViewResult result = new ViewResult();
        //    result.View = view;
        //    result.ViewData = base.ViewData;
        //    result.TempData = base.TempData;
        //    return result;
        //}

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
