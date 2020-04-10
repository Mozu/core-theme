using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.SEO;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class SslOnlyActionFilter : ActionFilterAttribute
    {
        public bool AllowMultiple => false;

        public override void OnActionExecuting(ActionExecutingContext actionContext)
        {
            // pass if we're not doing ssl in this env
            if (!(actionContext.HttpContext.RequestServices.GetService(typeof(ISettings)) as ISettings).CoreSettings.IsSSLValidationEnabled) return;

            // pass if the request already was SSL
            var pageContext = actionContext.HttpContext.RequestServices.GetService(typeof(PageContext)) as PageContext;
            if (pageContext != null && (pageContext.Url.IsNullOrEmpty() || pageContext.IsSecure || pageContext.IsEditMode)) return;

            // else redirect to secure
            var ubilBuilder = new UriBuilder(pageContext.Url) {Scheme = "https", Port = 443};
            actionContext.Result = new RedirectResult(ubilBuilder.Uri.ToString(), true);
        }
    }

    /// <summary>
    /// Enforces HTTP on a call, unless that call is to a custom route that required HTTPS.
    /// </summary>
    public class NoSslActionFilter : ActionFilterAttribute
    {
        public bool AllowMultiple => false;

        public override void OnActionExecuting(ActionExecutingContext actionContext)
        {
            var pageContext = actionContext.HttpContext.RequestServices.GetService(typeof(PageContext)) as PageContext;
            // only GETS get redirected
            if (!actionContext.HttpContext.Request.Method.Equals("get", StringComparison.InvariantCultureIgnoreCase)) return;
            // edit mode pages get a pass
            if (pageContext != null && (pageContext.Url.IsNullOrEmpty() || !pageContext.IsSecure || pageContext.IsEditMode || pageContext.IsAdminMode)) return;

            // if we're on a custom route and the route specifies a scheme, then let it pass
            var customRoute = actionContext.RouteData.Routers.Last() as CustomRoute;
            if (customRoute?.UrlScheme != null)
            {
                return;
            }

            var sc = actionContext.HttpContext.RequestServices.GetService(typeof(ISiteContext)) as ISiteContext;

            if (sc?.GeneralSettings?.EnforceSitewideSSL == true)
            {
                return;
            }

            // else redirect to insecure
            var builder = new UriBuilder(pageContext.Url) {Scheme = "http", Port = 80};
            actionContext.Result = new RedirectResult(builder.Uri.ToString(), true);
        }
    }
}