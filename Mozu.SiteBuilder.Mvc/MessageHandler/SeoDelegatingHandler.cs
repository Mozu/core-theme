using System;
using System.Collections;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using Autofac;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models.Navigation;

namespace Mozu.SiteBuilder.Mvc.MessageHandler
{
    public class SeoDelegatingHandler : DelegatingHandler
    {
        // look in the source code for HttpRoute.cs in asp.net for this.  it's internal there, so we can't just use it.
        internal const string MS_HTTP_RoutingContextKey = "MS_RoutingContext";

        protected async override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var apiContext = request.Resolve<ISiteBuilderApiContext>();
            if (apiContext.SiteId.HasValue == false)
            {
                return (await base.SendAsync(request, cancellationToken).ConfigureAwait(false));
            }

            // try redirects
            var redirect = await GetRedirectForRequestUri(request.Resolve<IRedirectRepository>(), request.RequestUri).ConfigureAwait(false);
            if (redirect != null)
            {
                if (redirect.IsRewrite.GetValueOrDefault(false))
                {
                    var rewritten = RewriteCurrentRequest(request, redirect.Destination);
                    request.Resolve<IRouteConfig>().RouteIncomingSystemRouteRequest(rewritten);
                    return await SendAsync(rewritten, cancellationToken).ConfigureAwait(false);
                }
                else if (!apiContext.IsEditMode)
                {
                    return RedirectTo(redirect.Destination, request);
                }
            }

            // try any custom routes
            if (request.GetRouteData().Route is NonSystemRoute)
            {
                var rerouted = await PerformCustomRouting(request).ConfigureAwait(false);
                return await base.SendAsync(rerouted, cancellationToken).ConfigureAwait(false);
            }

            return await base.SendAsync(request, cancellationToken).ConfigureAwait(false);
        }

        static async Task<RedirectEntry> GetRedirectForRequestUri(IRedirectRepository repo, Uri requestUri)
        {
            var redirects = await repo.FetchRedirectEntries().ConfigureAwait(false);
            var stem = requestUri.AbsolutePath.TrimStart('/');

            // try any redirects
            RedirectEntry redir;
            if (redirects.TryGetValue(stem, out redir))
            {
                return redir;
            }
            else
            {
                return null;
            }
        }

        private static async Task<HttpRequestMessage> PerformCustomRouting(HttpRequestMessage request)
        {
            var routeHandler = request.Resolve<ICustomRouteHandler>();
            if (routeHandler == null) return request;

            var found = await routeHandler.RouteIncomingRequest().ConfigureAwait(false);
            if (!found)
            {
                request.Resolve<IRouteConfig>().RouteIncomingDefaultRouteRequest(request);
            }
            return request;
        }

        private static HttpResponseMessage RedirectTo(string location, HttpRequestMessage request)
        {
            HttpResponseMessage resp = request.CreateResponse(HttpStatusCode.MovedPermanently);
            var uri = new Uri(location, UriKind.RelativeOrAbsolute);
            if (!uri.IsAbsoluteUri && !string.IsNullOrEmpty(location) && location.StartsWith("/"))
            {
                uri = new Uri("/" + location, UriKind.RelativeOrAbsolute);
            }
            resp.Headers.Location = uri;
            return resp;
        }

        /// <summary>
        /// rewriting the request just means hard-setting the URI to the new location, and then magically erasing some state that webapi stuffs into the request context for routing purposes.
        /// </summary>
        static HttpRequestMessage RewriteCurrentRequest(HttpRequestMessage request, string destination)
        {
            request.Properties["isSeoRewrite"] = true;

            // create new uri
            string url = "~/" + destination;
            var ub = new UriBuilder();
            ub.Host = "localhost";
            ub.Path = destination;

            // set new uri and clear out the old request context, which was built off of that old uri
            request.RequestUri = ub.Uri;
            request.Properties[MS_HTTP_RoutingContextKey] = null;

            return request;
        }
    }
}
