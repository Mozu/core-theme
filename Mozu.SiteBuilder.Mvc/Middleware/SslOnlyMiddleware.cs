using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Mozu.Core;
using Microsoft.Extensions.DependencyInjection;
using Mozu.SiteBuilder.Mvc.Contexts;

namespace Mozu.SiteBuilder.Mvc.Middleware
{
    public class EnforceSiteWideSsLMiddleware : IMiddleware
    {
        public  Task InvokeAsync(HttpContext context, RequestDelegate next)
        {

            TryParse(context, Core.Api.Contracts.Constants.Headers.HANDLED_BY_PROXY,
                out var handledByProxy);
            TryParse(context ,Core.Api.Contracts.Constants.Headers.SSL_HANDLED,
                out var isSSl);

            if (!handledByProxy || isSSl)
            {
                return next(context);
            }

            var rfo = context.RequestServices.GetService<IRequestUrlFinderOuter>();
            if (rfo.IsCdnRequest())
            {
                return next(context);
            }
            
            var apiContext = context.RequestServices.GetService<IApiContext>();
            if (!(apiContext?.SiteId).HasValue)
            {
                return next(context);
            }

            var siteContext = context.RequestServices.GetService<ISiteContext>();
            if (!(siteContext?.GeneralSettings?.EnforceSitewideSSL).GetValueOrDefault(false))
            {
                return next(context);
            }

            var origUrl = rfo.GetRequestUrl();
            var uriBuilder = new UriBuilder(origUrl) {Scheme = "https", Port = 443};
            context.Response.Redirect(uriBuilder.Uri.ToString(), true);
            return Task.CompletedTask;

        }
        
        
        bool TryParse( HttpContext context, string headerName, out bool ret)
        {
            ret = false;
            if (!context.Request.Headers.TryGetValue(headerName, out var values))
            {
                ret = false;
                return ret;
            }

            var val = values.FirstOrDefault();
            if (bool.TryParse(val, out  ret))
            {
                return ret;
            }

            ret = val == "1";
            return ret;
        }
    }
}