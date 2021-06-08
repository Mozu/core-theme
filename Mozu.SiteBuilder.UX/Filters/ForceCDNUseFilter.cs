using Mozu.Core;
using Mozu.Core.Extensions;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using Mozu.Core.Configuration;
using Mozu.SiteBuilder.Mvc.Extensions;

namespace Mozu.SiteBuilder.UX.Filters
{
    public class NoCookieFilter : ActionFilterAttribute
    {
        public override void OnActionExecuted(ActionExecutedContext actionExecutedContext)
        {
            actionExecutedContext.HttpContext.Response.OnStarting(state =>
            {
                var ctx = (HttpContext) state;
                ctx.Response?.Headers.Remove("Set-Cookie");
                return Task.CompletedTask;
            }, actionExecutedContext.HttpContext);
        }
    }

    public  class NoCdnForce : Attribute
    { }


    public class ForceCDNUseFilter : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext actionContext)
        {
            var services = actionContext.HttpContext.RequestServices;
            var requestURLGetter = services.Resolve<IRequestUrlFinderOuter> ();
            var settings = services.Resolve<ISettings>();
            var cdnHost = settings.AppSettings("CdnHost");
            var cdnOriginHost = settings.AppSettings("CdnOriginHost") ?? "";
            var disableCdn = settings.AppSettingsAsNullableBool("disableCdn").GetValueOrDefault(false);
            var sbapi = services.Resolve<ISiteBuilderApiContext>();
            var noForce = (actionContext.ActionDescriptor as ControllerActionDescriptor).HasAttribute<NoCdnForce>() || sbapi.DebugFlags.HasFlag(DebugModeFlagValues.DisableCdn);

            var hasAkamiOriginHop = actionContext.HttpContext.Request.Headers.Any(x => string.Equals(x.Key, "Akamai-Origin-Hop", StringComparison.OrdinalIgnoreCase));
            if (ShouldRedirectToCdn(actionContext.HttpContext.GetRequestUri(), cdnHost, cdnOriginHost, hasAkamiOriginHop, disableCdn, noForce , requestURLGetter))
            {
               
                actionContext.Result = RedirectToCDN(cdnHost, new Uri(requestURLGetter.GetRequestUrl()), sbapi.TenantId, sbapi.SiteId);
                return;
            }
            base.OnActionExecuting(actionContext);
        }

        static bool ShouldRedirectToCdn(Uri requestUri, string cdnHost, string orginCdnHost , bool hasAkamiOriginHop, bool disableCdn, bool noForce, IRequestUrlFinderOuter requestURLGetter)
        {
            var isReciever = requestUri.PathAndQuery.IndexOf("/receiver", StringComparison.OrdinalIgnoreCase) > -1;
            var uri = new Uri(requestURLGetter.GetRequestUrl());

            return !disableCdn && !isReciever && !requestURLGetter.IsCdnRequest() && !noForce;
        }

        static IActionResult RedirectToCDN(string cdnHost, Uri originalUrl, int tenantId, int? siteId)
        {
            var builder = new UriBuilder(originalUrl);
            builder.Path = $"{tenantId}-{siteId}/{builder.Path}";
            builder.Host = cdnHost;
            var response = new RedirectResult(builder.Uri.ToString());
            //todo:cole cache-control
            //response.Headers.CacheControl = new CacheControlHeaderValue { MaxAge = TimeSpan.FromDays(10000), Public = true };
            return response;
        }

    }
}