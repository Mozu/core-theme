using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.Modules
{
    public class VersionValidationCacheHeaderModule : System.Web.IHttpModule
    {

        void System.Web.IHttpModule.Dispose()
        {

        }

        void System.Web.IHttpModule.Init(System.Web.HttpApplication context)
        {
            context.PreSendRequestHeaders += context_PreSendRequestHeaders;
        }

        private static string _version;
        public virtual string Version
        {
            get
            {
                if (string.IsNullOrEmpty(_version))
                {
                    var assFile = typeof(Mozu.SiteBuilder.UX.Admin.Api.AccountController).Assembly.Location;
                    _version = System.Diagnostics.FileVersionInfo.GetVersionInfo(assFile).FileVersion;
                }
                return _version;
            }
        }

        public virtual string CdnOriginHost
        {
            get
            {
                return Mozu.Core.Settings.MozuConfigurationManager.AppSettings("CdnOriginHost");
            }
        }

        public void ProcessRequest(HttpContextBase context)
        {
            var ver = context.Request.QueryString["ver"];
            if (!string.IsNullOrEmpty(ver) && !string.Equals(ver, Version, StringComparison.OrdinalIgnoreCase))
            {
                context.Response.Cache.SetMaxAge(new TimeSpan(0));

                var origUrl = context.Request.Headers["x-vol-orig-url"];
                var referer = context.Request.UrlReferrer;
                if (referer != null && !string.IsNullOrEmpty(referer.Host) && !string.IsNullOrEmpty(origUrl))
                {
                    var origUri = new Uri(origUrl);
                    if (string.Equals(origUri.Host, CdnOriginHost, StringComparison.OrdinalIgnoreCase))
                    {
                        var uriToRedirTo = new Uri(context.Request.UrlReferrer, context.Request.Url.GetComponents(UriComponents.PathAndQuery, UriFormat.Unescaped));
                        context.Response.Redirect(uriToRedirTo.ToString());
                    }
                }


            }
        }

        void context_PreSendRequestHeaders(object sender, System.EventArgs e)
        {
            HttpContext context = ((HttpApplication)sender).Context;
            
            ProcessRequest(new HttpContextWrapper(context));

        }
    }
}