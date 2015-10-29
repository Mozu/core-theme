using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Autofac;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models.Navigation;
using System.Collections.Specialized;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.Core.Extensions;

namespace Mozu.SiteBuilder.Mvc.MessageHandler
{
    public class SeoDelegatingHandler : DelegatingHandler
    {
        private IRedirectHandler _redirecter = RedirectHandler.Instance;
        internal const string IsSeoRewrite = "IsSeoRewrite";
        // look in the source code for HttpRoute.cs in asp.net for this.  it's internal there, so we can't just use it.
        internal const string MS_HTTP_RoutingContextKey = "MS_RoutingContext";


        public IRedirectHandler Redirecter
        {
            get { return _redirecter; }
            set { _redirecter = value; }
        }

        static readonly Regex _reMxClean = new Regex("_mz[^&]+", RegexOptions.IgnoreCase);

        static void CleanMzQuery( HttpRequestMessage message)
        {
            if ( message.RequestUri != null && message.RequestUri.PathAndQuery.IndexOf("_mz", StringComparison.OrdinalIgnoreCase)>-1)
            {
                message.RequestUri = new Uri(_reMxClean.Replace(message.RequestUri.ToString(), string.Empty));
            }
        }


        protected async override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            CleanMzQuery(request);
            var apiContext = request.Resolve<ISiteBuilderApiContext>();
            if (apiContext.SiteId.HasValue == false)
            {
                return (await base.SendAsync(request, cancellationToken).ConfigureAwait(false));
            }

            // try redirects
            var redirect = await Redirecter.GetRedirectForRequestUri(request.Resolve<IRedirectRepository>(), request.RequestUri).ConfigureAwait(false);
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
                    return RedirectTo(redirect.Destination, redirect.IsTemporary.GetValueOrDefault(false), request);
                }
            }

            // try any custom routes
            if (request.GetRouteData().Route is NonSystemRoute)
            {
                var rerouted = await PerformCustomRouting(request).ConfigureAwait(false);
                return await HandleReroutedRequest(rerouted, cancellationToken, () => base.SendAsync(request, cancellationToken));
            }

            return await base.SendAsync(request, cancellationToken).ConfigureAwait(false);
        }

        private async Task<HttpResponseMessage> HandleReroutedRequest(HttpRequestMessage rerouted, CancellationToken cancellationToken, Func<Task<HttpResponseMessage>> continuation)
        {
            var customRoute = rerouted.GetRouteData().Route as CustomRoute;
            if (customRoute == null) return await continuation().ConfigureAwait(false);

            var pageContext = rerouted.Resolve<PageContext>();
            var currentUrl = new Uri(pageContext.Url);
            var currentProtocol = currentUrl.Scheme;
            if(!customRoute.UrlScheme.HasValue || customRoute.UrlScheme.Value.ToStringQuickly().EqualsIgnoreCase(currentUrl.Scheme)) return await continuation().ConfigureAwait(false);

            var builder = new UriBuilder(customRoute.UrlScheme.Value.ToStringQuickly(), currentUrl.Host);
            builder.Path = currentUrl.AbsolutePath;
            builder.Query = currentUrl.Query;
            return RedirectTo(builder.Uri.ToString(), true, rerouted);
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

        private static HttpResponseMessage RedirectTo(string location, bool isTemporary, HttpRequestMessage request)
        {
            HttpResponseMessage resp = request.CreateResponse(isTemporary ? HttpStatusCode.Redirect : HttpStatusCode.MovedPermanently);
            var uri = new Uri(location, UriKind.RelativeOrAbsolute);
            if (!uri.IsAbsoluteUri && !location.StartsWith("/"))
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
            request.Properties[IsSeoRewrite] = true;
            var uri = new Uri("http://localhost/" + destination);

            // set new uri and clear out the old request context, which was built off of that old uri
            request.RequestUri = uri;
            request.Properties[MS_HTTP_RoutingContextKey] = null;
            return request;
        }
    }


    public class MzUnderscoreRequestCleaner: DelegatingHandler
    {
        static readonly Regex _reMxClean = new Regex("_mz[^&]+&*", RegexOptions.IgnoreCase);


        protected  override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            CleanMzQuery(request);
            return base.SendAsync(request, cancellationToken);
        }
        static void CleanMzQuery(HttpRequestMessage message)
        {
            if (message.RequestUri != null && message.RequestUri.PathAndQuery.IndexOf("_mz", StringComparison.OrdinalIgnoreCase) > -1)
            {
                UriBuilder ub = new UriBuilder(message.RequestUri);
                if (ub.Query.Length > 1)
                {
                    ub.Query = _reMxClean.Replace(ub.Query.Substring(1), string.Empty);
                    message.RequestUri = ub.Uri;
                }
            }
        }
    }


    public interface IRedirectHandler
    {
        Task<RedirectEntry> GetRedirectForRequestUri(IRedirectRepository repo, Uri requestUri);
    }

    public class RedirectHandler : IRedirectHandler
    {
        public static readonly IRedirectHandler Instance = new RedirectHandler();
        private RedirectHandler() { }
        public async Task<RedirectEntry> GetRedirectForRequestUri(IRedirectRepository repo, Uri requestUri)
        {
            var redirects = await repo.GetRuntimeRedirectEntries().ConfigureAwait(false);
            if (redirects == null || redirects.Simple == null)
            {
                return null;
            }

            var stem = requestUri.AbsolutePath.TrimStart('/');
            var queryString = requestUri.ParseQueryString();
            var redir = FindRedirectForRequestUri(redirects, stem, queryString);
            if (redir == null)
            {
                return null;
            }
            var destination = ProcessQS(queryString, redir.Destination, redir.CopyQueryString);

            return new RedirectEntry()
            {
                Source = redir.Source,
                Destination = destination,
                IsRewrite = redir.IsRewrite,
                IsTemporary = redir.IsTemporary
            };
        }

        RedirectEntry FindRedirectForRequestUri(RuntimeRedirects redirects, string stem, NameValueCollection queryString)
        {
            RedirectEntry redir;
            if (redirects.Simple.TryGetValue(stem, out redir))
            {
                return redir;
            }

            List<RuntimeRedirectEntry> qsRedirectEntries;
            if (!redirects.QueryString.TryGetValue(stem, out qsRedirectEntries))
            {
                return null;
            }

            var matchingRedirect = 
                qsRedirectEntries
                .FirstOrDefault(redirectEntry => MatchesRequest(redirectEntry.Query, queryString));

            if (matchingRedirect == null) return null;
            return matchingRedirect.Redirect;
        }

        static bool MatchesRequest(NameValueCollection redirectQuery, NameValueCollection incomingQuery)
        {
            // all keys in the redirect must be present in the incoming request
            if (redirectQuery.AllKeys.Any(key => !incomingQuery.AllKeys.Contains(key, StringComparer.OrdinalIgnoreCase))) return false;

            // all non-wildcard values in the redirect QS must have matching values in the incoming request
            var required = redirectQuery.AllKeys.Where(x => !redirectQuery[x].Equals("*", StringComparison.OrdinalIgnoreCase));
            if (required.Any(key => !incomingQuery.GetValues(key).Contains(redirectQuery[key], StringComparer.OrdinalIgnoreCase))) return false;

            return true;
        }

        static readonly Regex RedirectTokenReplacement = new Regex(@"{(?<token>[^}]+)}",
                RegexOptions.ExplicitCapture |
                RegexOptions.Singleline |
                RegexOptions.IgnorePatternWhitespace);


        static string ProcessQS(NameValueCollection queryString, string destinationTemplate, bool? copyQS)
        {
            var expandedTemplate = RedirectTokenReplacement.Replace(destinationTemplate, match =>
            {
                var token = match.Groups["token"].Value;
                var rep = queryString[token];
                if (rep != null)
                {
                    return rep;
                }
                return match.Value;
            });

            var qpos = expandedTemplate.IndexOf('?');
            var stem = qpos > -1 ? expandedTemplate.Substring(0, qpos) : expandedTemplate;
            var query = qpos > -1 ? expandedTemplate.Substring(qpos + 1) : string.Empty;
            var qstring = System.Web.HttpUtility.ParseQueryString(query, System.Text.Encoding.UTF8);

            if (copyQS.GetValueOrDefault(false))
            {
                foreach (string key in queryString.AllKeys.Where(x => queryString[x] != null))
                {
                    qstring[key] = queryString[key];
                }
            }

            string dest = stem;
            if (qstring.Count > 0)
            {
                dest = stem + "?" + qstring.ToString();
            }
            return dest;
        }
    }
}
