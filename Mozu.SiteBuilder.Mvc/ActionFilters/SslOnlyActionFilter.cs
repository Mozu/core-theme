using System;
using System.Net;
using System.Net.Http;
using System.Web.Http.Filters;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.SEO;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class SslOnlyActionFilter : ActionFilterAttribute
    {
        public override bool AllowMultiple { get { return false; } }

        public override void OnActionExecuting(System.Web.Http.Controllers.HttpActionContext actionContext)
        {
            // pass if we're not doing ssl in this env
            if (!actionContext.Request.Resolve<ISettings>().CoreSettings.IsSSLValidationEnabled) return;

            // pass if the request already was SSL
            var pageContext = actionContext.Request.Resolve<PageContext>();
            if (pageContext.Url.IsNullOrEmpty() || pageContext.IsSecure || pageContext.IsEditMode) return;

            // else redirect to secure
            var ubilBuilder = new UriBuilder(pageContext.Url);
            ubilBuilder.Scheme = "https";
            ubilBuilder.Port = 443;
            actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.MovedPermanently);
            actionContext.Response.Headers.Location = ubilBuilder.Uri;
        }
    }

    /// <summary>
    /// Enforces HTTP on a call, unless that call is to a custom route that required HTTPS.
    /// </summary>
    public class NoSslActionFilter : ActionFilterAttribute
    {
        public override bool AllowMultiple { get { return false; } }

        public override void OnActionExecuting(System.Web.Http.Controllers.HttpActionContext actionContext)
        {
            var pageContext = actionContext.Request.Resolve<PageContext>();
            // only GETS get redirected
            if (actionContext.Request.Method != HttpMethod.Get) return;
            // edit mode pages get a pass
            if (pageContext.Url.IsNullOrEmpty() || !pageContext.IsSecure || pageContext.IsEditMode) return;

            // if we're on a custom route and the route specifies a scheme, then let it pass
            var customRoute = actionContext.Request.GetRouteData().Route as CustomRoute;
            if (customRoute != null && customRoute.UrlScheme.HasValue) return; 
            
            // else redirect to insecure
            var builder = new UriBuilder(pageContext.Url);
            builder.Scheme = "http";
            builder.Port = 80;
            actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.MovedPermanently);
            actionContext.Response.Headers.Location = builder.Uri;
        }
    }
}