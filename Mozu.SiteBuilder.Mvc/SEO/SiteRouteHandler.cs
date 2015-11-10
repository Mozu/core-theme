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
using Autofac;
using Mozu.SiteBuilder.Mvc.MessageHandler;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.Contexts;

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
        private readonly Lazy<HttpRequestMessage> _requestMessage;
        private readonly Lazy<ISiteBuilderApiContext> _siteBuilderApiContext;
        private readonly IRouteConfig _routeconfig;
        private readonly Lazy<ICustomRouteCollectionRepository> _customRouteRepository;
        private object _httpRouteCollection;

        public CustomRouteHandler(HttpRequestMessage request, Lazy<ICustomRouteCollectionRepository> customRouteRepository, Lazy<ISiteBuilderApiContext> siteBuilderApiContext, IRouteConfig routeconfig)
        {
            _requestMessage = new Lazy<HttpRequestMessage>(() => request);
            _customRouteRepository = customRouteRepository;
            _siteBuilderApiContext = siteBuilderApiContext;
            _routeconfig = routeconfig;
        }

        private HttpRouteCollection RouteCollection
        {
            get
            {
                if (_httpRouteCollection == null)
                {
                    _httpRouteCollection = _customRouteRepository.Value.GetHttpRouteCollection().ConfigureAwait(false).GetAwaiter().GetResult() ?? new object();
                }
                return _httpRouteCollection as HttpRouteCollection;
            }
        }

        public async Task<bool> Init()
        {
            var routeCollection = await GetRouteCollectionAsync().ConfigureAwait(false);
            
            return routeCollection == null;
        }

        public async Task<bool> RouteIncomingRequest()
        {
            var routeCollection = await GetRouteCollectionAsync().ConfigureAwait(false);
            if (routeCollection == null)
            {
                return false;
            }

            var rerouteData = routeCollection.GetRouteData(_requestMessage.Value);
            if (rerouteData == null) return false;

            if (rerouteData.Route is CustomRoute)
            {
                var cr = rerouteData.Route as CustomRoute;
                cr.RewriteRouteData(_requestMessage.Value, rerouteData.Values);
            }

            _requestMessage.Value.SetRouteData(rerouteData);
            return true;
        }

        async Task<HttpRouteCollection> GetRouteCollectionAsync()
        {
            _httpRouteCollection = _httpRouteCollection ??  (_httpRouteCollection = (await _customRouteRepository.Value.GetHttpRouteCollection().ConfigureAwait(false)) ?? new object());
            return _httpRouteCollection as HttpRouteCollection;
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

        public async Task<HttpResponseMessage> RedirectWithContext(HttpRequestMessage request, FancyRoute internalRoute, Func<IDictionary<string, object>> viewDataAdditionFunc)
        {
            if (_siteBuilderApiContext.Value.IsEditMode)
            {
                return null;
            }
            object tmp;
            if (request.Properties.TryGetValue(SeoDelegatingHandler.IsSeoRewrite , out tmp) && tmp is bool && ((bool)tmp))
            {
                return null;
            }

            var currentRouteData  = request.GetRouteData();
            var routeCollection = await GetRouteCollectionAsync().ConfigureAwait(false);
            var routes = GetCanonicalRouteList(internalRoute, routeCollection, _routeconfig);
            if (!routes.Any()) return null; // no canonical route that matches, or current route is canonical? then no redirect!

     
            var incomingRouteValues = currentRouteData.Values;
            var additionalValues = viewDataAdditionFunc == null ? new Dictionary<string, object>() : viewDataAdditionFunc();
            var finalRouteValues =
                incomingRouteValues
                .ChainSet(additionalValues)
                .ChainSet("httproute", true);

            var newReq = new HttpRequestMessage();
            foreach ( var rp in _requestMessage.Value.Properties)
            {
                newReq.Properties[rp.Key]= rp.Value;
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
                        _requestMessage.Value.RequestUri.GetComponents(UriComponents.Path , UriFormat.Unescaped), 
                        StringComparison.OrdinalIgnoreCase))
                    { 
                        uri = new Uri(uri.GetLeftPart(UriPartial.Path) + request.RequestUri.Query);
                        var redirect = request.CreateResponse(HttpStatusCode.MovedPermanently);
                        redirect.Headers.Location = new Uri(uri.PathAndQuery, UriKind.Relative);
                        redirect.Headers.TryAddWithoutValidation(Constants.HEADER_CANONICAL_URL, uri.PathAndQuery);
                        return redirect;
                    }

                    IEnumerable<string> values;
                    if (request.Headers.TryGetValues(Constants.HEADER_ALTERNATIVE_VIEW, out values) && values.Any(x => !string.IsNullOrWhiteSpace(x)))
                    {
                        uri = new Uri(uri.GetLeftPart(UriPartial.Path) + request.RequestUri.Query);
                        request.Resolve<HttpContextBase>().Response.AddHeader(Constants.HEADER_CANONICAL_URL, uri.PathAndQuery);
                    }
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
      
        static int? GetPortForScheme(int incomingPort, CustomRoute.Scheme desiredScheme)
        {
            if (incomingPort == 80 && desiredScheme == CustomRoute.Scheme.Http) return null;
            if (incomingPort == 443 && desiredScheme == CustomRoute.Scheme.Https) return null;
            return incomingPort;
        }

        public async Task<string> GetCanonicalUrl(FancyRoute internalRoute, Func<IDictionary<string, object>> viewDataAdditionFunc, bool useContext)
        {
            var routeCollection = await GetRouteCollectionAsync().ConfigureAwait(false);
            var routes = GetCanonicalRouteList(internalRoute, routeCollection, _routeconfig);
            if (!routes.Any()) return null; // no canonical route that matches, or current route is canonical? then no redirect!


            var  routingValues = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase) { { "httproute", true } };
            if (useContext)
            {
                routingValues.ChainSet(_requestMessage.Value.GetRouteData().Values, true);
            }
            if ( viewDataAdditionFunc != null)
            {
                routingValues.ChainSet(viewDataAdditionFunc(), true);
            }
        
            var newReq = PrepareNewHttpRequest(_requestMessage.Value);
            foreach (var route in routes)
            {
                var vpath = route.GetVirtualPath(newReq, routingValues);
                if (vpath != null)
                {
                    return CreateOutboundUri(route, vpath, _requestMessage.Value.Resolve<IPageContext>().Url);
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

        static string CreateOutboundUri(CustomRoute route, IHttpVirtualPathData vpath, string incoming)
        {
            var incomingUri = new Uri(incoming);
            var path = "/" + new Uri("http://localhost/" + vpath.VirtualPath, UriKind.Absolute).GetComponents(UriComponents.Path, UriFormat.Unescaped);
           // var query = useInboundQuery ? incomingUri.Query.TrimStart('?') :  string.Empty;
            var scheme = route.UrlScheme.HasValue ? route.UrlScheme.Value.ToStringQuickly() : incomingUri.Scheme;
            var builder = new UriBuilder(scheme, incomingUri.Host);
            builder.Path = path;
           // builder.Query = query;
            if (route.UrlScheme.HasValue)
            {
                return builder.Uri.ToString();
            }
            return builder.Uri.GetComponents(UriComponents.PathAndQuery, UriFormat.Unescaped);
        }

        public IHttpRouteData GetRouteData(string virtualPathRoot, HttpRequestMessage request)
        {
            var routeCollection = GetRouteCollectionAsync().Result;
            if (routeCollection == null) return null;

            return  routeCollection.GetRouteData(_requestMessage.Value);
        }
    }
}