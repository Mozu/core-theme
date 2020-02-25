using System;
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
        private readonly ISettings _settings;
        private readonly PageContext _pc;

        public SslOnlyActionFilter(ISettings settings, PageContext pageContext)
        {
            _settings = settings;
            _pc = pageContext;
        }

        public bool AllowMultiple => false;

        public override void OnActionExecuting(ActionExecutingContext actionContext)
        {
            // pass if we're not doing ssl in this env
            if (!_settings.CoreSettings.IsSSLValidationEnabled) return;

            // pass if the request already was SSL
            var pageContext = _pc;
            if (pageContext.Url.IsNullOrEmpty() || pageContext.IsSecure || pageContext.IsEditMode) return;

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
        private readonly PageContext _pc;
        private readonly ISiteContext _sc;

        public NoSslActionFilter(PageContext pageContext, ISiteContext sc)
        {
            _pc = pageContext;
            _sc = sc;
        }
        public bool AllowMultiple => false;

        public override void OnActionExecuting(ActionExecutingContext actionContext)
        {
            var pageContext = _pc;
            // only GETS get redirected
            if (!actionContext.HttpContext.Request.Method.Equals("get", StringComparison.InvariantCultureIgnoreCase)) return;
            // edit mode pages get a pass
            if (pageContext.Url.IsNullOrEmpty() || !pageContext.IsSecure || pageContext.IsEditMode || pageContext.IsAdminMode) return;

            // if we're on a custom route and the route specifies a scheme, then let it pass
            var customRoute = actionContext.GetRouteData().Route as CustomRoute;
            if (customRoute?.UrlScheme != null)
            {
                return;
            }

            if (_sc?.GeneralSettings?.EnforceSitewideSSL == true)
            {
                return;
            }

            // else redirect to insecure
            var builder = new UriBuilder(pageContext.Url) {Scheme = "http", Port = 80};
            actionContext.Result = new RedirectResult(builder.Uri.ToString(), true);
        }
    }
}