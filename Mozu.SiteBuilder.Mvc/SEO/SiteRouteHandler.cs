using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Hosting;
using System.Web.Http.Routing;
using Mozu.SiteBuilder.Mvc.MessageHandler;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.Contexts;
using System.Threading;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Mozu.SiteBuilder.Mvc.SEO
{

    public interface IRouteConfig
    {
        HttpRouteCollection DefaultRoutes { get; }

        void RouteIncomingDefaultRouteRequest(HttpRequestMessage message);

        void RouteIncomingSystemRouteRequest(HttpRequestMessage message);
    }

    public class NonSystemRoute : IHttpRoute
    {
        public IDictionary<string, object> Constraints
        {
            get; set;
        }

        public IDictionary<string, object> DataTokens
        {
            get; set;
        }

        public IDictionary<string, object> Defaults
        {
            get; set;
        }

        public HttpMessageHandler Handler
        {
            get
            {
                return null;
            }
        }

        public string RouteTemplate
        {
            get
            {
                return "{*url}";
            }
        }

        public IHttpRouteData GetRouteData(string virtualPathRoot, HttpRequestMessage request)
        {
            return new HttpRouteData(this);

        }

        public IHttpVirtualPathData GetVirtualPath(HttpRequestMessage request, IDictionary<string, object> values)
        {
            throw new NotImplementedException();
        }
    }


    public class CustomRouteHandler : ICustomRouteHandler
    {
        private readonly HttpRequestMessage _requestMessage;
        private readonly Lazy<ISiteBuilderApiContext> _siteBuilderApiContext;
        private readonly IRouteConfig _routeconfig;
        private readonly Lazy<ICustomRouteCollectionRepository> _customRouteRepository;
        private object _httpRouteCollection;
        Lazy<bool> _forceSSL;
        Uri _origionalUri;

        public CustomRouteHandler(HttpRequestMessage request, Lazy<ICustomRouteCollectionRepository> customRouteRepository, Lazy<ISiteBuilderApiContext> siteBuilderApiContext, IRouteConfig routeconfig, IRequestUrlFinderOuter requestUrlHelper)
        {
            _requestMessage = request;
            _customRouteRepository = customRouteRepository;
            _siteBuilderApiContext = siteBuilderApiContext;
            _routeconfig = routeconfig;
            _forceSSL = new Lazy<bool>(() => request.Resolve<ISiteContext>().GeneralSettings?.EnforceSitewideSSL == true, LazyThreadSafetyMode.None);
            var origUrl = requestUrlHelper.GetRequestUrl();
            _origionalUri = string.IsNullOrEmpty(origUrl) ? _requestMessage.RequestUri : new Uri(origUrl);
        }

        public void Reset ()
        {
            _httpRouteCollection = null;
        }
        private HttpRouteCollection RouteCollection
        {
            get
            {
                if (_httpRouteCollection == null)
                {
                    _httpRouteCollection = _customRouteRepository.Value.GetHttpRouteCollection() ?? new object();
                }
                return _httpRouteCollection as HttpRouteCollection;
            }
        }

        //public async Task<bool> Init()
        //{
        //    var routeCollection = await GetRouteCollectionAsync().ConfigureAwait(false);
            
        //    return routeCollection == null;
        //}

        public bool RouteIncomingRequest()
        {
            
            var path = _origionalUri.AbsolutePath;
            if ( path.Contains( "=") || path.Contains("?"))
            {
                return false;
            }

            var routeCollection =  GetRouteCollection();
            if (routeCollection == null)
            {
                return false;
            }

            var rerouteData = routeCollection.GetRouteData(_requestMessage);
            if (rerouteData == null) return false;

            if (rerouteData.Route is CustomRoute)
            {
                var cr = rerouteData.Route as CustomRoute;
                cr.RewriteRouteData(_requestMessage, rerouteData.Values);
            }

            _requestMessage.SetRouteData(rerouteData);
            return true;
        }

        HttpRouteCollection GetRouteCollection()
        {
            _httpRouteCollection = _httpRouteCollection ?? _customRouteRepository.Value.GetHttpRouteCollection();
            return _customRouteRepository.Value.GetHttpRouteCollection();
        }

        System.Collections.Concurrent.ConcurrentDictionary<FancyRoute,Tuple<HttpRouteCollection, List<CustomRoute>>> _canonicalCache = new System.Collections.Concurrent.ConcurrentDictionary<FancyRoute, Tuple<System.Web.Http.HttpRouteCollection, List<CustomRoute>>>();
        List<CustomRoute> GetCanonicalRouteList(FancyRoute internalRoute, HttpRouteCollection routeCollection , IRouteConfig routeConfig)
        {
            var res = _canonicalCache.GetOrAdd(internalRoute, (ir) => DoGetCanonicalRouteList(ir, routeCollection, routeConfig));
            if (!Equals(res.Item1, routeCollection))
            {
                _canonicalCache.TryRemove(internalRoute, out res);
            }
            res = _canonicalCache.GetOrAdd(internalRoute, (ir) => DoGetCanonicalRouteList(ir, routeCollection, routeConfig));
            return res.Item2;
        }
        Tuple<HttpRouteCollection, List<CustomRoute>> DoGetCanonicalRouteList(FancyRoute internalRoute, HttpRouteCollection routeCollection, IRouteConfig routeConfig)
        {
            var routes = new List<CustomRoute>();
            var defaultRoutes = routeConfig.DefaultRoutes
                        .Where(route => route is CustomRoute).Cast<CustomRoute>()
                        .Where(route => route.IsCanonicalFor(internalRoute)).ToList();

            if (routeCollection != null)
            {
                routes.AddRange(
                    routeCollection
                        .Where(route => route is CustomRoute).Cast<CustomRoute>()
                        .Where(route => route.IsCanonicalFor(internalRoute))
                );
            }
            routes.AddRange(defaultRoutes);
            return new Tuple<HttpRouteCollection, List<CustomRoute>>(routeCollection, routes);
        }

        public IActionResult RedirectWithContext(HttpRequest request, FancyRoute internalRoute, Func<IDictionary<string, object>> viewDataAdditionFunc)
        {
            if (_siteBuilderApiContext.Value.IsEditMode || _siteBuilderApiContext.Value.IsAdminMode)
            {
                return null;
            }

            if (request.HttpContext.Items.TryGetValue(SeoDelegatingHandler.IsSeoRewrite , out var tmp) && tmp is bool b && b)
            {
                return null;
            }

            var currentRouteData  = request.HttpContext.GetRouteData();
            var routeCollection =  GetRouteCollection();
            var routes = GetCanonicalRouteList(internalRoute, routeCollection, _routeconfig);
            if (!routes.Any()) return null; // no canonical route that matches, or current route is canonical? then no redirect!

     
            var incomingRouteValues = currentRouteData.Values;
            var additionalValues = viewDataAdditionFunc == null ? new Dictionary<string, object>() : viewDataAdditionFunc();
            var finalRouteValues =
                incomingRouteValues
                .ChainSet(additionalValues)
                .ChainSet("httproute", true);

            var newReq = new HttpRequestMessage();
            foreach ( var (key, value) in _requestMessage.Properties)
            {
                newReq.Properties[key]= value;
            }

            
            foreach (var route in routes)
            {
                
                var vpath = route.GetVirtualPath(newReq, finalRouteValues);
                if (vpath != null)
                {
                    var uri = new Uri("http://localhost/" + vpath.VirtualPath);

                    //only redirect if stem is different
                    if (!string.Equals(
                        uri.GetComponents(UriComponents.Path , UriFormat.Unescaped),
                        _origionalUri.GetComponents(UriComponents.Path , UriFormat.Unescaped), 
                        StringComparison.OrdinalIgnoreCase)  &&
                        !string.Equals(
                        uri.GetComponents(UriComponents.Path, UriFormat.Unescaped),
                        _requestMessage.RequestUri.GetComponents(UriComponents.Path, UriFormat.Unescaped),
                        StringComparison.OrdinalIgnoreCase))
                    {
                        if (!IsValidForExistingContext(request , uri, routeCollection, _routeconfig.DefaultRoutes))
                        {
                            return null;
                        }

                        var preStrippedRequest = request.HttpContext.Items.ContainsKey(SeoDelegatingHandler.MzPreCleanedUri) ?
                        (Uri)request.HttpContext.Items[SeoDelegatingHandler.MzPreCleanedUri] :
                        new Uri(request.GetDisplayUrl());

                        uri = new Uri(uri.GetLeftPart(UriPartial.Path) + preStrippedRequest.Query);
                        var redirect = request.CreateResponse(HttpStatusCode.MovedPermanently);
                        redirect.Headers.Location = new Uri(uri.PathAndQuery, UriKind.Relative);
                        redirect.Headers.TryAddWithoutValidation(Constants.HEADER_CANONICAL_URL, uri.PathAndQuery);
                        return redirect;
                    }

                    if (!request.Headers.TryGetValue(Constants.HEADER_ALTERNATIVE_VIEW, out var values) ||
                        values.All(string.IsNullOrWhiteSpace)) return null;

                    uri = new Uri(uri.GetLeftPart(UriPartial.Path) + request.QueryString);
                    request.HttpContext.Response.Headers.Add(Constants.HEADER_CANONICAL_URL, uri.PathAndQuery);
                    return null;
                }
                //if current route didnt match??? load bearing code do not remove
                if (route == currentRouteData.Route)
                {
                    return null;
                }
            }
            return null;
        }

        private static bool IsValidForExistingContext(HttpRequest currentRequest, Uri candidateUri, HttpRouteCollection siteCollection, HttpRouteCollection defaultCollection)
        {
            var testHttmMessage = new HttpRequestMessage(new HttpMethod(currentRequest.Method), candidateUri);
            testHttmMessage.Properties[HttpPropertyKeys.DependencyScope] = currentRequest.HttpContext.Items[HttpPropertyKeys.DependencyScope];
            var reverseResolvedRoute = siteCollection?.GetRouteData(testHttmMessage)?.Route as CustomRoute ?? defaultCollection.GetRouteData(testHttmMessage)?.Route as CustomRoute;
            var resolvedRoute = currentRequest.HttpContext.GetRouteData().Routers.Last() as CustomRoute;
            if (reverseResolvedRoute == null)
            {
                return false;
            }
            if (resolvedRoute != null && resolvedRoute.InternalRoute != reverseResolvedRoute.InternalRoute)
            {
                return false;
            }
            return true;
        }

        static int? GetPortForScheme(int incomingPort, CustomRoute.Scheme desiredScheme)
        {
            if (incomingPort == 80 && desiredScheme == CustomRoute.Scheme.Http) return null;
            if (incomingPort == 443 && desiredScheme == CustomRoute.Scheme.Https) return null;
            return incomingPort;
        }

        public string GetCanonicalUrl(FancyRoute internalRoute, Func<IDictionary<string, object>> viewDataAdditionFunc, bool useContext, string hostName = null)
        {
            var routeCollection =  GetRouteCollection();
            var routes = GetCanonicalRouteList(internalRoute, routeCollection, _routeconfig);
            if (!routes.Any()) return null; // no canonical route that matches, or current route is canonical? then no redirect!


            var  routingValues = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase) { { "httproute", true } };
            if (useContext)
            {
                routingValues.ChainSet(_requestMessage.GetRouteData().Values, true);
            }
            if ( viewDataAdditionFunc != null)
            {
                routingValues.ChainSet(viewDataAdditionFunc(), true);
            }
        
            var newReq = PrepareNewHttpRequest(_requestMessage);
            foreach (var route in routes)
            {
                var vpath = route.GetVirtualPath(newReq, routingValues);
                if (vpath != null)
                {
                    return CreateOutboundUri(route, vpath, hostName , hostName != null, _forceSSL);
                }
            }
            return null;
        }

     
        /// <summary>
        /// We want a pristine request with no context to potentially interfere with the routing calculation, so we do that here.
        /// The only dependency we have is the dependency resolver, which we take from the parent request.
        /// </summary>
        /// <param name="parent"></param>
        /// <returns></returns>
        static HttpRequestMessage PrepareNewHttpRequest(HttpRequestMessage parent)
        {
            var newReq = new HttpRequestMessage();
            newReq.Properties[HttpPropertyKeys.DependencyScope] = parent.Properties[HttpPropertyKeys.DependencyScope];
            return newReq;
        }
        
        static string CreateOutboundUri(CustomRoute route, IHttpVirtualPathData vpath, string host, bool fullyQualifyUris, Lazy<bool> forceSsl)
        {
           var path = "/" + new Uri("http://localhost/" + vpath.VirtualPath, UriKind.Absolute).GetComponents(UriComponents.Path, UriFormat.Unescaped);
           // var query = useInboundQuery ? incomingUri.Query.TrimStart('?') :  string.Empty;
           // var scheme = route.UrlScheme.HasValue ? route.UrlScheme.Value.ToStringQuickly() : incomingUri.Scheme;
            var builder = new UriBuilder("http://localhost");
            builder.Path = path;
            if ( fullyQualifyUris)
            {
                builder.Host = host;
                builder.Scheme = route.UrlScheme.HasValue ? route.UrlScheme.ToString() : (forceSsl.Value ? "https" : "http");
                if (string.Equals( builder.Scheme , CustomRoute.Scheme.Https.ToString(), StringComparison.OrdinalIgnoreCase))
                {
                    builder.Port = 443;
                }
                return builder.Uri.GetComponents(UriComponents.HttpRequestUrl, UriFormat.Unescaped);
            }
            return builder.Uri.GetComponents(UriComponents.PathAndQuery, UriFormat.Unescaped);
        }

        public IHttpRouteData GetRouteData(string virtualPathRoot, HttpRequestMessage request)
        {
            var routeCollection = GetRouteCollection();
            if (routeCollection == null) return null;

            return  routeCollection.GetRouteData(_requestMessage);
        }
    }
}