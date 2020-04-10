using System;
using System.Collections;
using System.Collections.Generic;
using System.Net.Http;
using System.Web;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Mozu.Core.Configuration;


namespace Mozu.SiteBuilder.Mvc.ViewEngine
{
    public static class HttpControllerContextExtensions
    {
        public static HttpContext HttpContext(this ControllerContext context)
        {
            return context.Resolve<HttpContext>();
        }

        public static T Resolve<T>(this ControllerContext context)
        {
            return context.HttpContext.RequestServices.Resolve<T>();
        }

        public static IServiceProvider LifetimeScope(this HttpRequestMessage request)
        {
            return request.HttpContext().RequestServices;
        }

        public static T Resolve<T>(this HttpRequestMessage request)
        {
            return request.LifetimeScope().Resolve<T>();
        }

        public static HttpContext HttpContext(this HttpRequestMessage request)
        {
            return request.Resolve<HttpContext>();
        }
    }

    public class HyprViewContext
    {
        private HttpContext _httpContext;
        private IServiceProvider _lifetimeScope;

        public HyprViewContext(HttpContext context, ViewDataDictionary viewData, HyprViewContext parentActionViewContext = null)
        {
            _httpContext = context;
            ViewData = viewData;
            ParentActionViewContext = parentActionViewContext;
        }
        public ViewDataDictionary ViewData { get; set; }
        public HyprViewContext ParentActionViewContext { get; set; }

        public IServiceProvider LifetimeScope
        {
            get
            {
                if (_lifetimeScope != null) return _lifetimeScope;
                _lifetimeScope = GetRootLifeTimeScope(this);
                return _lifetimeScope;
            }
            set => _lifetimeScope = value;
        }

        private static IServiceProvider GetRootLifeTimeScope(HyprViewContext ctx)
        {
            IServiceProvider scope = null;
            if (ctx.ParentActionViewContext?.LifetimeScope != null)
            {
                scope = GetRootLifeTimeScope(ctx.ParentActionViewContext);
            }
            else if (ctx._httpContext != null)
            {
                scope = ctx._httpContext.RequestServices;
            }
            return scope;
        }

        public virtual HttpContext HttpContext
        {
            get => _httpContext;
            set => _httpContext = value;
        }
    }
}