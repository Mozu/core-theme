// -----------------------------------------------------------------------
// <copyright file="ClientCacheHeadersAttribute.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System.Threading.Tasks;
using Microsoft.Net.Http.Headers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Filters;
using Mozu.Core.Configuration;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Microsoft.Extensions.DependencyInjection;
namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    using Microsoft.AspNetCore.Mvc;
    using System;
    using System.Collections.Concurrent;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net.Http;
    using System.Text;

    using System.Web;

    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
    public class AccessAllowOriginFilterAttribute : Attribute, IAsyncActionFilter
    {
        public  Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            context.HttpContext.Response.OnStarting(state =>
            {
                var ctx = (HttpContext) state;
                var finder = ctx.RequestServices.GetService<IRequestUrlFinderOuter>();
                if (finder.IsCdnRequest())
                {
                    ctx.Response.Headers["Access-Control-Allow-Origin"] = "*";
                }
                return Task.CompletedTask;
            }, context.HttpContext);
            return  next();
        }

    }


    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
    public class ClientCacheHeadersAttribute : Attribute, IFilterFactory, IOrderedFilter
    {
        public bool IsReusable
        {
            get { return true; }
        }

        public int Order { get; set; }
        static ConcurrentDictionary<string, ResponseCacheAttribute> _cache = new ConcurrentDictionary<string, ResponseCacheAttribute>();
        IFilterMetadata IFilterFactory.CreateInstance(IServiceProvider serviceProvider)
        {
            ResponseCacheAttribute att;
            var settings = serviceProvider.GetService<ISettings>();
            var lookupKey = ConfigKey + ForceRevalidate;

            if (!_cache.TryGetValue(lookupKey, out att))
            {
                att = new ResponseCacheAttribute();
                
                if (ForceRevalidate)
                {
                    att.Duration = 0;
                    att.NoStore = true;
                    att.Location = ResponseCacheLocation.None;
                }
                else
                {
                    var val = settings.AppSettings("clientCacheHeaderLength:" + ConfigKey) ?? settings.AppSettings("clientCacheHeaderLength:default");
                    var duration = int.Parse(val);
                    att.Duration = duration;
                    att.Location = ResponseCacheLocation.Any;
                }
                
                _cache[lookupKey] = att;
            }
            return att.CreateInstance(serviceProvider);

        }


        public  bool AllowCrossOrigin { get; set; }

        /// <summary>
        /// Gets or sets the cache duration in seconds. The default is 120 seconds.
        /// </summary>
        /// <value>The cache duration in seconds.</value>
        public string ConfigKey
        {
            get;
            set;
        }

        public bool ForceRevalidate
        {
            get;
            set;
        }
       
        public ClientCacheHeadersAttribute()
        {
            ConfigKey = "default";
            ForceRevalidate = false;
            AllowCrossOrigin = true;
        }

        public static void Set404(HttpRequest request )
        {
            request.HttpContext.Items["_mz_is404"] = true;
        }
        public static bool Is404(HttpRequest request)
        {
            return request.HttpContext.Items.TryGetValue("_mz_is404", out var tmp) && (bool)tmp;
        }

      
    }
}
