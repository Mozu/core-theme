using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models.Navigation;
using System.Collections.Specialized;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.Core.Extensions;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Context;
using Mozu.Core.Caching;
using Mozu.Core.Logging;

namespace Mozu.SiteBuilder.Mvc.MessageHandler
{
    //public class RedisHelthCheckMessageHandler : DelegatingHandler
    //{
    //    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    //    {
    //        if (string.Equals(request.RequestUri.LocalPath, "/mozdef/ping", StringComparison.OrdinalIgnoreCase) &&
    //            Mozu.Core.Settings.MozuConfigurationManager.Settings.AppSettings("redis_health_check") == "true")
    //        {
    //            try
    //            {
    //                var cacheProvider = request.Resolve<ICacheProvider>();
    //                var cache = cacheProvider.GetCache(SitebuilderContextCacheRepository.CacheName, new Core.ApiContext() { TenantId = 1 });
    //                var key = $"HealthCheck-{Environment.MachineName}";
    //                var data = DateTime.Now.ToString() + "-" + new Random().NextDouble();
    //                await cache.PutAsync<string>(
    //                    data,
    //                    key,
    //                    new List<string>() { "a" },
    //                    new Core.Caching.CachePolicy() { AbsoluteExpiration = new DateTimeOffset(DateTime.Now.AddMinutes(15)) })
    //                    .ConfigureAwait(false);
    //                var gotit = (await cache.GetAsync<string>(key).ConfigureAwait(false))?.Item;
    //                if (data == gotit)
    //                {
    //                    return new HttpResponseMessage(HttpStatusCode.OK)
    //                    {
    //                        Content = new StringContent("ok")
    //                    };
    //                }
    //                return new HttpResponseMessage(HttpStatusCode.NotFound)
    //                {
    //                    Content = new StringContent($"got weird response {data}!={gotit}")
    //                };
    //            }
    //            catch(Exception ex)
    //            {
    //                Core.Logging.LoggingService.LoggerFor<RedisHelthCheckMessageHandler>().Error(ex);
    //                var err = new HttpResponseMessage(HttpStatusCode.InternalServerError);
    //                err.Content = new StringContent(ex.ToString());
    //                return err;
    //            }
    //        }
    //        return await base.SendAsync(request, cancellationToken).ConfigureAwait(false);
    //    }
    //}

    //public class SiteContextInitializationHandler : DelegatingHandler
    //{
    //    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    //    {

    //        var apiContext = request.Resolve<ISiteBuilderApiContext>();
    //        if (apiContext.SiteId.HasValue == false)
    //        {
    //            return base.SendAsync(request, cancellationToken);
    //        }

    //        var siteContext = request.Resolve<ISiteContext>();
    //        var tt = siteContext.Init().ContinueWith(_ =>
    //        {
    //            return base.SendAsync(request, cancellationToken);
    //        });
    //        var t = tt.Unwrap();
    //        return t;
               
    //    }
    //}
    public class SeoDelegatingHandler : DelegatingHandler
    {
        private IRedirectHandler _redirecter = RedirectHandler.Instance;
        public const string IsSeoRewrite = "IsSeoRewrite";
        public const string OriginalUri = "OriginalUri";
        public const string MzPreCleanedUri = "MzPreCleanedUri";
        // look in the source code for HttpRoute.cs in asp.net for this.  it's internal there, so we can't just use it.
        internal const string MS_HTTP_RoutingContextKey = "MS_RoutingContext";


        public IRedirectHandler Redirecter
        {
            get { return _redirecter; }
            set { _redirecter = value; }
        }



        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {

            var apiContext = request.Resolve<ISiteBuilderApiContext>();
            if (apiContext.SiteId.HasValue == false)
            {
                return base.SendAsync(request, cancellationToken);
            }

            var siteContext = request.Resolve<ISiteContext>();

            var pageContext = request.Resolve<PageContext>();
            Uri requestUri;
            object temp;
            if (request.Properties.TryGetValue(OriginalUri, out temp))
            {
                requestUri = (Uri)temp;
            }
            else
            {
                requestUri = request.RequestUri;
            }
            // try redirects
            var redirect = Redirecter.GetRedirectForRequestUri(request.Resolve<IRedirectRepository>(), requestUri);
            if (redirect != null)
            {
                // we short-circuit the rewrite if this request has already been rewritten this go around.
                if (redirect.IsRewrite.GetValueOrDefault(false) && request.Properties.ContainsKey(IsSeoRewrite))
                {

                }
                else if (redirect.IsRewrite.GetValueOrDefault(false))
                {
                    var rewritten = RewriteCurrentRequest(request, redirect.Destination);
                    request.Resolve<IRouteConfig>().RouteIncomingSystemRouteRequest(rewritten);
                    return SendAsync(rewritten, cancellationToken);
                }
                else if (!apiContext.IsEditMode)
                {
                    return Task.FromResult(
                        RedirectTo(
                            redirect.Destination,
                            redirect.IsTemporary.GetValueOrDefault(false),
                            siteContext?.GeneralSettings?.EnforceSitewideSSL.GetValueOrDefault(false) == true,
                            pageContext.IsSecure,
                            pageContext.SecureHost,
                            request
                        )
                    );
                }
            }

            var settings = request.Resolve<ISettings>();
            // try any custom routes
            if (request.GetRouteData().Route is NonSystemRoute)
            {
                var rerouted = PerformCustomRouting(request);
                return HandleReroutedRequest(rerouted, pageContext, siteContext, cancellationToken, () => base.SendAsync(request, cancellationToken), settings.CoreSettings.IsSSLValidationEnabled);
            }

            return base.SendAsync(request, cancellationToken);
        }

        private Task<HttpResponseMessage> HandleReroutedRequest(HttpRequestMessage rerouted, IPageContext pageContext, ISiteContext siteContext, CancellationToken cancellationToken, Func<Task<HttpResponseMessage>> continuation, bool sslValidationEnabled)
        {

            if (rerouted.Method != HttpMethod.Get ||
                pageContext.IsEditMode ||
                !pageContext.HandledByProxy ||
                !sslValidationEnabled)
            {
                return continuation();
            }

            var customRoute = rerouted.GetRouteData().Route as CustomRoute;
            var currentUrl = new Uri(pageContext.Url);


            if (customRoute?.UrlScheme.HasValue == true)
            {
                if (customRoute.UrlScheme.Value.ToStringQuickly().EqualsIgnoreCase(currentUrl.Scheme))
                {
                    return continuation();
                }
            }
            else if (!siteContext.GeneralSettings.EnforceSitewideSSL.GetValueOrDefault(false))
            {
                return continuation();
            }
            else if (currentUrl.Scheme.EqualsIgnoreCase("https"))
            {
                return continuation();
            }

            var scheme = customRoute?.UrlScheme.HasValue == true ? customRoute.UrlScheme.Value.ToStringQuickly() : "https";

            var builder = new UriBuilder(scheme, currentUrl.Host);
            builder.Path = currentUrl.AbsolutePath;
            builder.Query = currentUrl.Query?.TrimStart(new char[] { '?' });
            return Task.FromResult(
                RedirectTo(
                    builder.Uri.ToString(),
                    isTemporary: false,
                    enforceSsl: false,
                    isSecureRequest: pageContext.IsSecure,
                    secureHost: pageContext.SecureHost,
                    request: rerouted
                )
           );
        }

        private static HttpRequestMessage PerformCustomRouting(HttpRequestMessage request)
        {
            var routeHandler = request.Resolve<ICustomRouteHandler>();
            if (routeHandler == null) return request;

            var found = routeHandler.RouteIncomingRequest();
            if (!found)
            {
                request.Resolve<IRouteConfig>().RouteIncomingDefaultRouteRequest(request);
            }
            return request;
        }

        private static HttpResponseMessage RedirectTo(string location, bool isTemporary, bool enforceSsl, bool isSecureRequest, string secureHost, HttpRequestMessage request)
        {
            HttpResponseMessage resp = request.CreateResponse(isTemporary ? HttpStatusCode.Redirect : HttpStatusCode.MovedPermanently);
            var redirectUri = new Uri(location, UriKind.RelativeOrAbsolute);
            if (!redirectUri.IsAbsoluteUri)
            {
                if (!location.StartsWith("/"))
                {
                    location = "/" + location;
                    redirectUri = new Uri(location, UriKind.RelativeOrAbsolute);
                }

                if (enforceSsl && !isSecureRequest)
                {
                    redirectUri = new Uri(secureHost + location);
                }
            }

            resp.Headers.Location = redirectUri;
            return resp;
        }

        /// <summary>
        /// rewriting the request just means hard-setting the URI to the new location, and then magically erasing some state that webapi stuffs into the request context for routing purposes.
        /// </summary>
        static HttpRequestMessage RewriteCurrentRequest(HttpRequestMessage request, string destination)
        {
            request.Properties[IsSeoRewrite] = true;
            var uri = new Uri("http://localhost/" + destination);

            // set new uri and clear out the old request context, which was built off of that old uri
            request.RequestUri = uri;
            request.Properties[MS_HTTP_RoutingContextKey] = null;
            return request;
        }
    }


    public class MzUnderscoreRequestCleaner : DelegatingHandler
    {
        static readonly Regex _reMxClean = new Regex("_mz_[^&]+&*", RegexOptions.IgnoreCase);


        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            CleanMzQuery(request);
            return base.SendAsync(request, cancellationToken);
        }
        static void CleanMzQuery(HttpRequestMessage message)
        {
            if (message.RequestUri != null && message.RequestUri.PathAndQuery.IndexOf("_mz_", StringComparison.OrdinalIgnoreCase) > -1)
            {
                message.Properties[SeoDelegatingHandler.MzPreCleanedUri] = message.RequestUri;
                UriBuilder ub = new UriBuilder(message.RequestUri);
                if (ub.Query.Length > 1)
                {
                    ub.Query = _reMxClean.Replace(ub.Query.Substring(1), string.Empty);
                    message.RequestUri = ub.Uri;
                }
            }
        }
    }

    public class HomePageTransferHandler : DelegatingHandler
    {

        protected async override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            if (request.RequestUri.GetComponents(UriComponents.Path, UriFormat.Unescaped) == "")
            {
                var apiContext = request.Resolve<ISiteBuilderApiContext>();
                if (apiContext.SiteId.HasValue)
                {
                    var navContext = request.Resolve<NavigationContext>();
                    var tree = navContext.Tree;
                    if (tree != null)
                    {
                        var homeLink = tree.FirstOrDefault(x => x.IsHomePage);
                        if (homeLink != null && homeLink.Url.Length > 1)
                        {
                            var origUri = request.RequestUri;
                            var newUri = new Uri(homeLink.Url, UriKind.RelativeOrAbsolute);
                            if (!newUri.IsAbsoluteUri)
                            {
                                newUri = new Uri(request.RequestUri, newUri);
                            }
                            var originalUri = request.RequestUri;
                            request.RequestUri = newUri;
                            request.Properties[SeoDelegatingHandler.OriginalUri] = originalUri;
                        }
                    }
                }
            }
            return await base.SendAsync(request, cancellationToken);
        }



    }

    
}
