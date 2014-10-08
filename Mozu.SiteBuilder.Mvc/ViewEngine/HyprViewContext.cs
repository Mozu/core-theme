using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Web;
using System.Web.Http.Controllers;
using Autofac;


namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    public class ViewDataDictionary : Dictionary<string, object>
    {
        public ViewDataDictionary() : base(StringComparer.OrdinalIgnoreCase)
        {
            
        }
        public object Model
        {
            get
            {
                object model;
                TryGetValue("Model", out model);
                return model;
            }
            set { this["Model"] = value; }
        }
    }

    public static class HttpControllerContextExtensions
    {
        public static HttpContextBase HttpContext(this HttpControllerContext context)
        {
            return context.Resolve<HttpContextBase>();
        }

        public static T Resolve<T>(this HttpControllerContext context)
        {
            return context.Request.LifetimeScope().Resolve<T>();
        }

        public static ILifetimeScope LifetimeScope(this HttpRequestMessage request)
        {
            return ((ILifetimeScope)request.GetDependencyScope().GetService(typeof(ILifetimeScope)));
        }

        public static T Resolve<T>(this HttpRequestMessage request)
        {
            return request.LifetimeScope().Resolve<T>();
        }

        public static HttpContextBase HttpContext(this HttpRequestMessage request)
        {
            return request.Resolve<HttpContextBase>();
        }
    }

    public class HyprViewContext
    {
        private HttpContextBase _httpContext;
        private ILifetimeScope _lifetimeScope;

        public HyprViewContext(HttpRequestMessage requestMessage, ViewDataDictionary viewData, HyprViewContext parentActionViewContext = null)
        {
            RequestMessage = requestMessage;
            ViewData = viewData;
            ParentActionViewContext = parentActionViewContext;
        }

        public HttpRequestMessage RequestMessage  { get; set; }
        public ViewDataDictionary ViewData { get; set; }
        public HyprViewContext ParentActionViewContext { get; set; }


        public ILifetimeScope LifetimeScope
        {
            get
            {
                if (_lifetimeScope != null) return _lifetimeScope;
                _lifetimeScope = GetRootLifeTimeScope(this);
                return _lifetimeScope;
            }
            set { _lifetimeScope = value; }
        }

        private static ILifetimeScope GetRootLifeTimeScope(HyprViewContext ctx)
        {
            ILifetimeScope scope = null;
            if (ctx.ParentActionViewContext != null && ctx.ParentActionViewContext.LifetimeScope != null)
            {
                scope = GetRootLifeTimeScope(ctx.ParentActionViewContext);
            }
            else if (ctx.RequestMessage != null)
            {
                scope = ctx.RequestMessage.LifetimeScope();
            }
            return scope;
        }

        public virtual HttpContextBase HttpContext
        {
            get { return _httpContext ?? (_httpContext = LifetimeScope.Resolve<HttpContextBase>()); }
            set { _httpContext = value; }
        }
    }
}