// -----------------------------------------------------------------------
// <copyright file="ClientCacheHeadersAttribute.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System.Net.Http.Headers;
using System.Web.Http.Filters;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;

    using System.Web;

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public class ClientCacheHeadersAttribute : ActionFilterAttribute
    {
        /// <summary>
        /// Gets or sets the cache duration in seconds. The default is 120 seconds.
        /// </summary>
        /// <value>The cache duration in seconds.</value>
        public string ConfigKey
        {
            get;
            set;
        }
       
        public ClientCacheHeadersAttribute()
        {
            ConfigKey = "default";
        }

        public override void OnActionExecuted(HttpActionExecutedContext actionExecutedContext)
        {
           
            if (ConfigKey == null)
                return;

            var val = System.Configuration.ConfigurationManager.AppSettings["clientCacheHeaderLength:" + ConfigKey];
            if (val == null)
            {
                val = System.Configuration.ConfigurationManager.AppSettings["clientCacheHeaderLength:default"];
            }
            if (val == null || val == "0")
                return;
            int duration = int.Parse(val);



            var cache = actionExecutedContext.Response.Headers.CacheControl = actionExecutedContext.Response.Headers.CacheControl ?? new CacheControlHeaderValue();
           
            TimeSpan cacheDuration = TimeSpan.FromSeconds(duration);

            cache.MaxAge = cacheDuration;
            cache.Public = true;
           
            //cache.
            //cache.SetCacheability(HttpCacheability.Public);
            //cache.SetExpires(DateTime.Now.Add(cacheDuration));
            //cache.SetMaxAge(cacheDuration);
        }
        //public  void OnActionExecuted(ActionExecutedContext filterContext)
        //{
        //    if ( ConfigKey == null )
        //        return;

        //    var val = System.Configuration.ConfigurationManager.AppSettings["clientCacheHeaderLength:" + ConfigKey];
        //    if (val == null)
        //    {
        //        val = System.Configuration.ConfigurationManager.AppSettings["clientCacheHeaderLength:default"];
        //    }
        //    if (val == null|| val == "0")
        //        return;
        //    int duration = int.Parse(val);

           
        //    HttpCachePolicyBase cache = filterContext.HttpContext.Response.Cache;
        //    TimeSpan cacheDuration = TimeSpan.FromSeconds(duration);

        //    cache.SetCacheability(HttpCacheability.Public);
        //    cache.SetExpires(DateTime.Now.Add(cacheDuration));
        //    cache.SetMaxAge(cacheDuration);
            
        //}
    }
}
