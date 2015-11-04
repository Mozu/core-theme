using Mozu.Core;
using Mozu.Core.Extensions;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;

namespace Mozu.SiteBuilder.UX.Filters
{
    public class ForceCDNUseFilter : ActionFilterAttribute
    {
        public override bool AllowMultiple
        {
            get { return false; }
        }

        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            var pageContext = actionContext.Request.Resolve<PageContext>();
            var settings = actionContext.Request.Resolve<ISettings>();
            var cdnHost = settings.AppSettings("CdnHost");
            var disableCdn = settings.AppSettingsAsBool("disableCdn");
            if (ShouldRedirectToCdn(actionContext.Request.RequestUri, cdnHost, disableCdn, pageContext))
            {
                var sbapi = actionContext.Request.Resolve<IApiContext>();
                actionContext.Response = RedirectToCDN(cdnHost, new Uri(pageContext.Url), sbapi.TenantId, sbapi.SiteId);
                return;
            }
            base.OnActionExecuting(actionContext);
        }

        static bool ShouldRedirectToCdn(Uri requestUri, string cdnHost, bool disableCdn, PageContext pageContext)
        {
            var isReciever = requestUri.PathAndQuery.IndexOf("/receiver", StringComparison.OrdinalIgnoreCase) > -1;
            var uri = new Uri(pageContext.Url);
            return !disableCdn && !isReciever && !string.IsNullOrEmpty(cdnHost) && !cdnHost.EqualsIgnoreCase(uri.Host);
        }

        static HttpResponseMessage RedirectToCDN(string cdnHost, Uri originalUrl, int tenantId, int? siteId)
        {
            var builder = new UriBuilder(originalUrl);
            builder.Path = string.Format("{0}-{1}/{2}", tenantId, siteId, builder.Path);
            builder.Host = cdnHost;
            var response = new HttpResponseMessage(HttpStatusCode.MovedPermanently);
            response.Headers.Location = builder.Uri;
            response.Headers.CacheControl = new CacheControlHeaderValue { MaxAge = TimeSpan.FromDays(10000), Public = true };
            return response;
        }

    }
}