using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.UX.Admin.MessageHandlers
{
    public class SslRedirectMessageHandler : DelegatingHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {

            var pc = request.Resolve<PageContext>();
            if (pc.HandledByProxy && !pc.IsSecure)
            {
                var uriBuilder = new UriBuilder(pc.Url);
                uriBuilder.Port = 443;
                uriBuilder.Scheme = "https";
                var message = new HttpResponseMessage(HttpStatusCode.Redirect);
                message.Headers.Location = uriBuilder.Uri;
                return Task<HttpResponseMessage>.FromResult(message);

            }
            return base.SendAsync(request, cancellationToken);
        }
    }
    public class AuthRedirectMessageHandler : DelegatingHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            if (!request.Headers.Accept.Contains(new MediaTypeWithQualityHeaderValue("text/html")))
            {
                return base.SendAsync(request, cancellationToken);
            }
            return base.SendAsync(request, cancellationToken).ContinueWith((x) =>
                {
                    if (x.Result.StatusCode == HttpStatusCode.Unauthorized)
                    {
                        var res = new HttpResponseMessage(HttpStatusCode.Redirect);
                        var settings = request.Resolve<ISettings>();
                        string returnUrl = "";
                        string redir = settings.LoginPath + "/to?scopeType=Tenant&redirectUrl=" + HttpUtility.UrlEncode(request.RequestUri.PathAndQuery);
                        if (settings.AppSettings("useTenantDomainNames") != "true")
                        {
                            redir += "&postbackUrl=http://" + request.Headers.GetValues("host").First() + "/admin/auth/pants";
                        }

                        var message = new HttpResponseMessage(HttpStatusCode.Redirect);
                        message.Headers.Location = new Uri(redir);
                        return message;

                        res.Headers.Location = new Uri("/admin/FedLogin", UriKind.Relative);
                        return res;
                    }
                    {
                        return x.Result;
                    }
                });
        }
    }
}