using System;
using System.CodeDom.Compiler;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Mime;
using System.Text;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.Routing;
using System.Web.Razor;
using System.Web.Routing;
using System.Web.WebPages;
using Autofac;
using Autofac.Core.Lifetime;
using Microsoft.CSharp;
using System.Linq;
using Mozu.SiteBuilder.Mvc.ViewEngine;


namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    public class ViewDataDictionary : Dictionary<string, object>
    {
        public object Model
        {
            get
            {
                object model = null;
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

        public HyprViewContext(HttpRequestMessage   requestMessage  , ViewDataDictionary viewData, HyprViewContext parentActionViewContext = null)
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
                if (_lifetimeScope == null)
                {
                    HyprViewContext ctx = this;
                    while (ctx != null && _lifetimeScope == null)
                    {
                        if (ctx.ParentActionViewContext != null && ctx.ParentActionViewContext.LifetimeScope != null)
                        {
                            _lifetimeScope = ctx.ParentActionViewContext.LifetimeScope;
                        }
                        if (ctx.RequestMessage  != null)
                        {
                            _lifetimeScope = ctx.RequestMessage.LifetimeScope();
                            
                        }

                        ctx = ctx.ParentActionViewContext;
                    }
                }
                return _lifetimeScope;
            }
            set { _lifetimeScope = value; }
        }


        public virtual HttpContextBase HttpContext
        {
            get
            {
                if (_httpContext == null)
                {
                    _httpContext = LifetimeScope.Resolve<HttpContextBase>();
                }
                return _httpContext;
            }
            set { _httpContext = value; }
        }
    }
}