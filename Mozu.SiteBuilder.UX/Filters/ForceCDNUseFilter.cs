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
using System.Web.Http.Controllers;
using System.Web.Http.Filters;

namespace Mozu.SiteBuilder.UX.Filters
{
    public  class NoCdnForce : Attribute
    { }

    public class ForceCDNUseFilter : ActionFilterAttribute
    {
        public override bool AllowMultiple
        {
            get { return false; }
        }

        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            var requestURLGetter = actionContext.Request.Resolve<IRequestUrlFinderOuter> ();
            var settings = actionContext.Request.Resolve<ISettings>();
            var cdnHost = settings.AppSettings("CdnHost");
            var cdnOriginHost = settings.AppSettings("CdnOriginHost") ?? "";
            var disableCdn = settings.AppSettingsAsNullableBool("disableCdn").GetValueOrDefault(false);
            var sbapi = actionContext.Request.Resolve<ISiteBuilderApiContext>();
            var noForce = actionContext.ActionDescriptor.GetCustomAttributes<NoCdnForce>().Any() || sbapi.DebugFlags.HasFlag(DebugModeFlagValues.DisableCdn);

       


            var hasAkamiOriginHop = actionContext.Request.Headers.Any(x => string.Equals(x.Key, "Akamai-Origin-Hop", StringComparison.OrdinalIgnoreCase));
            if (ShouldRedirectToCdn(actionContext.Request.RequestUri, cdnHost, cdnOriginHost, hasAkamiOriginHop, disableCdn, noForce , requestURLGetter))
            {
               
                actionContext.Response = RedirectToCDN(cdnHost, new Uri(requestURLGetter.GetRequestUrl()), sbapi.TenantId, sbapi.SiteId);
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