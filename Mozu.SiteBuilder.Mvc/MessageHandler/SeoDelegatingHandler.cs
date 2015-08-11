using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.RegularExpressions;
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
        internal const string IsSeoRewrite = "IsSeoRewrite";
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
                    return RedirectTo(redirect.Destination, redirect.IsTemporary.GetValueOrDefault(false) , request);
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
            var redirects = await repo.GetRuntimeRedirectEntries().ConfigureAwait(false);
            if ( redirects == null || redirects.Simple == null)
            {
                return null;
            }
            var stem = requestUri.AbsolutePath.TrimStart('/');
            
            // try any redirects
            RedirectEntry redir;

            if (redirects.Simple.TryGetValue(stem, out redir))
            {
                return ProcessQS(requestUri, redir);  
            }
            List<RuntimeRedirectEntry> rrel;

            if ( string.IsNullOrEmpty(requestUri.Query) ||  !redirects.QueryString.TryGetValue( stem, out rrel))
            {
                return null;
            }
            var incommingQs = requestUri.ParseQueryString();
            foreach(var rre in rrel)
            {
                bool match = true;
                foreach ( var key in rre.Query.AllKeys)
                {
                    var redirVal = rre.Query[key];
                   
                    if ( redirVal == "*")
                    {
                        continue;
                    }
                       
                    var incommingVals =incommingQs.GetValues(key);
                    if ( incommingVals == null || incommingVals.Length ==0 || !incommingVals.Any( x=> string.Equals( x,redirVal, StringComparison.OrdinalIgnoreCase )))
                    {
                        match = false;
                        break;
                    }
                        
                }
                if ( match )
                {

                    return ProcessQS(requestUri, rre.Redirect);
                }
            }

            return null;
        }

        static Regex redirectTokenReplacement = new Regex(@"{(?<token>[^}]+)}|%7b(?<token>[^}]+)%7d",
                RegexOptions.IgnoreCase |
                RegexOptions.ExplicitCapture |
                RegexOptions.Singleline |
                RegexOptions.IgnorePatternWhitespace);


        static RedirectEntry ProcessQS( Uri incoming, RedirectEntry entry)
        {
          
            
            var incommingQs = incoming.ParseQueryString();
            var qpos = entry.Destination.IndexOf('?');
            var stem = qpos > -1 ? entry.Destination.Substring(0,qpos) : entry.Destination; 
            var query = qpos > -1 ? entry.Destination.Substring(qpos + 1) : string.Empty;
            var qstring =  System.Web.HttpUtility.ParseQueryString(query,System.Text.Encoding.UTF8);




            if (entry.CopyQueryString.GetValueOrDefault(false))
            {
                foreach( string key in incommingQs.Keys)
                {
                    if ( qstring[key] == null)
                    {
                        qstring[key] = incommingQs[key];
                    }
                }
            }

            string dest = stem;
            if (  qstring.Count> 0 )
            {
               dest = stem + "?" + qstring.ToString();
            }


            dest = redirectTokenReplacement.Replace(dest, match => {
                var token = match.Groups["token"].Value;
                var rep = incommingQs[token];
                if ( rep != null)
                {
                    return rep;
                }
                return match.Value;
            });

            return  new RedirectEntry()
            {
                Source = entry.Source,
                Destination = dest,
                IsRewrite = entry.IsRewrite,
                IsTemporary = entry.IsTemporary
            };
           
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

        private static HttpResponseMessage RedirectTo(string location, bool isTemorary , HttpRequestMessage request)
        {
            HttpResponseMessage resp = request.CreateResponse(isTemorary? HttpStatusCode.Redirect : HttpStatusCode.MovedPermanently);
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
            request.Properties[IsSeoRewrite] = true;

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
