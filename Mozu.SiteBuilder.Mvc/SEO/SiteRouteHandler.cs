using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Hosting;
using System.Web.Http.Routing;
using System.Web.Routing;
using Autofac;
using Mozu.SiteBuilder.Mvc.MessageHandler;
using Mozu.SiteBuilder.Mvc.ViewEngine;

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



            //detele me ???
            foreach( var key in _requestMessage.Value.GetRouteData().Values.Keys)
            {
                if ( !rerouteData.Values.ContainsKey(key))
                {
                    rerouteData.Values[key] = _requestMessage.Value.GetRouteData().Values[key];
                }
            }
            //end delte me???

            if (rerouteData.Route is CustomRoute)
            {
                var cr = rerouteData.Route as CustomRoute;
                cr.RewriteRouteData(_requestMessage.Value, rerouteData.Values);
            }

          

            _requestMessage.Value.SetRouteData(rerouteData);
            return true;
        }



        async Task<System.Web.Http.HttpRouteCollection> GetRouteCollectionAsync()
        {
            if (_httpRouteCollection == null)
            {
                _httpRouteCollection = (await _customRouteRepository.Value.GetHttpRouteCollection().ConfigureAwait(false)) ?? new object();
            }
            return _httpRouteCollection as System.Web.Http.HttpRouteCollection;
        }
       

        System.Collections.Concurrent.ConcurrentDictionary<FancyRoute,Tuple<System.Web.Http.HttpRouteCollection,List<CustomRoute>>> _canonicleCache = new System.Collections.Concurrent.ConcurrentDictionary<FancyRoute, Tuple<System.Web.Http.HttpRouteCollection, List<CustomRoute>>>();


        List<CustomRoute> GetCanonicalRouteList(FancyRoute internalRoute, System.Web.Http.HttpRouteCollection routeCollection , IRouteConfig routeConfig)
        {
            var res = _canonicleCache.GetOrAdd(internalRoute, (ir) => DoGetCanonicalRouteList(ir, routeCollection, routeConfig));
            if ( !object.Equals(res.Item1 , routeCollection))
            {
                _canonicleCache.TryRemove(internalRoute, out res);
            }
            res = _canonicleCache.GetOrAdd(internalRoute, (ir) => DoGetCanonicalRouteList(ir, routeCollection, routeConfig));
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
                if (route == currentRouteData.Route)
                {
                    return null;
                }
                var vpath = route.GetVirtualPath(newReq, finalRouteValues);
                if (vpath != null)
                {
                    var uri = new Uri("http://localhost/" + vpath.VirtualPath);
                    uri = new Uri(uri.GetLeftPart(UriPartial.Path) + request.RequestUri.Query);
                    if (!string.Equals(uri.PathAndQuery, _requestMessage.Value.RequestUri.PathAndQuery, StringComparison.OrdinalIgnoreCase))
                    {
                        var redirect = request.CreateResponse(HttpStatusCode.MovedPermanently);
                        redirect.Headers.Location = new Uri(uri.PathAndQuery, UriKind.Relative);
                        redirect.Headers.TryAddWithoutValidation(Constants.HEADER_CANONICAL_URL, uri.PathAndQuery);
                        return redirect;
                    }

                    IEnumerable<string> values;
                    if (request.Headers.TryGetValues(Constants.HEADER_ALTERNATIVE_VIEW, out values) && values.Any(x => !string.IsNullOrWhiteSpace(x)))
                    {
                        request.Resolve<HttpContextBase>().Response.AddHeader(Constants.HEADER_CANONICAL_URL, uri.PathAndQuery);

                    }

                    return null;
                }
            }
            return null;
           
        }
      
        public async Task<string> GetCannonicalUrl( FancyRoute internalRoute, Func<IDictionary<string, object>> viewDataAdditionFunc, bool useExistingValues)
        {
            
            var routeCollection = await GetRouteCollectionAsync().ConfigureAwait(false);

            var routes = GetCanonicalRouteList(internalRoute, routeCollection, _routeconfig);

            if (!routes.Any()) return null; // no canonical route that matches, or current route is canonical? then no redirect!

           
            var routingValues = viewDataAdditionFunc == null ? new Dictionary<string, object>() : viewDataAdditionFunc();
            if (useExistingValues)
            {
                routingValues.ChainSet(_requestMessage.Value.GetRouteData().Values, false);
            }

            routingValues.ChainSet("httproute", true);

            var newReq = new HttpRequestMessage();
            newReq.Properties[HttpPropertyKeys.DependencyScope] = _requestMessage.Value.Properties[HttpPropertyKeys.DependencyScope];

            
            foreach (var route in routes)
            {
                var vpath = route.GetVirtualPath(newReq, routingValues);
                if (vpath != null)
                {
                    var url = "/"+ new Uri("http://localhost/" + vpath.VirtualPath).GetComponents(UriComponents.Path, UriFormat.Unescaped);

                    if (useExistingValues)
                    { 
                         url += _requestMessage.Value.RequestUri.Query;
                    }

                    return url;

                }
            }
            return null;

        }

        public IHttpRouteData GetRouteData(string virtualPathRoot, HttpRequestMessage request)
        {
            var routeCollection = GetRouteCollectionAsync().Result;
            if (routeCollection == null) return null;

            return  routeCollection.GetRouteData(_requestMessage.Value);
        }
    }
}