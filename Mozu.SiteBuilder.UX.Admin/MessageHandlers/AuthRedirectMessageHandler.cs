using System;
using System.Collections.Generic;
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
using Mozu.SiteBuilder.Mvc.Helpers;
using Mozu.Core;

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
        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            if (!request.Headers.Accept.Contains(new MediaTypeWithQualityHeaderValue("text/html")))
            {
                return await base.SendAsync(request, cancellationToken).ConfigureAwait(false);
            }
            var response = await base.SendAsync(request, cancellationToken).ConfigureAwait(false);
            if (response.StatusCode != HttpStatusCode.Unauthorized) return response;

            // else redirect to the login app!
            var res = new HttpResponseMessage(HttpStatusCode.Redirect);
            var handledByRp = IsHandledByRP(request);
            var tenantId = request.Resolve<IApiContext>().TenantId;

            var loginAppRouter = new LoginAppRouteHelper(request.Resolve<ISettings>().LoginPath);
            var postback = !handledByRp ? "http://" + request.Headers.GetValues("host").First() + "/admin/auth/pants" : "";
            var redirect = HttpUtility.UrlEncode(request.RequestUri.PathAndQuery);

            var loginRequest = loginAppRouter.To(Core.UserScopeType.Tenant, tenantId, redirect, postback, true);

            var message = new HttpResponseMessage(HttpStatusCode.Redirect);
            message.Headers.Location = loginRequest;
            return message;
        }

        static bool IsHandledByRP(HttpRequestMessage request)
        {
            var handledByRp = false;
            IEnumerable<string> values;
            if (request.Headers.TryGetValues(Mozu.Core.Api.Contracts.Constants.Headers.ORIGINAL_URL, out values))
            {
                handledByRp = true;
            }
            return handledByRp;
        }
    }
}