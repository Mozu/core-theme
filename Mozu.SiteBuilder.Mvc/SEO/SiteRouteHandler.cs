using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Hosting;
using System.Web.Http.Routing;
using System.Web.Routing;
using Autofac;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.SEO
{

    public interface IRouteConfig
    {
        HttpRouteCollection DefaultRoutes { get; }

        void RouteIncomingRequest(HttpRequestMessage message);
        

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


    public class SiteRouteHandler : ISiteRouteHandler
    {
        public static string ContextKey = "SiteRouteEntry";
        private readonly Lazy<HttpRequestMessage> _requestMessage;
        private readonly Lazy<ISiteBuilderApiContext> _siteBuilderApiContext;
        private readonly Lazy<ISiteRouteRepository> _siteRouteRepository;
        private object _httpRouteCollection;

        //public SiteRouteHandler(Lazy<ISiteRouteRepository> siteRouteRepository, Lazy<HttpRequestMessage> requestMessage, Lazy<ISiteBuilderApiContext> siteBuilderApiContext)
        //{
        //    _siteRouteRepository = siteRouteRepository;
        //    _requestMessage = requestMessage;
        //    _siteBuilderApiContext = siteBuilderApiContext;
        //}

        public SiteRouteHandler(HttpRequestMessage request, Lazy<ISiteRouteRepository> siteRouteRepository, Lazy<ISiteBuilderApiContext> siteBuilderApiContext)
        {
            _requestMessage = new Lazy<HttpRequestMessage>(() => request);
            _siteRouteRepository = siteRouteRepository;
            _siteBuilderApiContext = siteBuilderApiContext;

        }

        private HttpRouteCollection RouteCollection
        {
            get
            {
                if (_httpRouteCollection == null)
                {
                    _httpRouteCollection = _siteRouteRepository.Value.GetHttpRouteCollection().ConfigureAwait(false).GetAwaiter().GetResult() ?? new object();
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

            foreach( var key in _requestMessage.Value.GetRouteData().Values.Keys)
            {
                if ( !rerouteData.Values.ContainsKey(key))
                {
                    rerouteData.Values[key] = _requestMessage.Value.GetRouteData().Values[key];
                }
            }

            if (rerouteData.Route is CustomRoute)
            {
                var cr = rerouteData.Route as CustomRoute;
                cr.RewriteRouteData(_requestMessage.Value, rerouteData.Values);

            }

            //_requestMessage.Value .Properties[HttpPropertyKeys.HttpRouteDataKey] = rerouteData;
            //var rctx = _requestMessage.Value.GetRequestContext();
            //rctx.RouteData = rerouteData;

            _requestMessage.Value.SetRouteData(rerouteData);
            return true;
        }



        async Task<HttpRouteCollection> GetRouteCollectionAsync()
        {
            if (_httpRouteCollection == null)
            {
                _httpRouteCollection = (await _siteRouteRepository.Value.GetHttpRouteCollection().ConfigureAwait(false)) ?? new object();
            }
            return _httpRouteCollection as HttpRouteCollection;
        }


        public async Task<HttpResponseMessage> RedirectWithContext(HttpRequestMessage request, FancyRoute internalRoute, Func<IDictionary<string, object>> viewDataAdditionFunc)
        {
            if (_siteBuilderApiContext.Value.IsEditMode)
            {
                return null;
            }

            var routeCollection = await GetRouteCollectionAsync().ConfigureAwait(false);
            if (routeCollection == null) return null;

            var routes = 
                routeCollection
                .Where(route => route is CustomRoute).Cast<CustomRoute>()
                .Where(route => route.IsCanonicalFor(internalRoute))
                .ToList();

            if (!routes.Any()) return null; // no canonical route that matches, or current route is canonical? then no redirect!

     
            var incomingRouteValues = _requestMessage.Value.GetRouteData().Values;
            var additionalValues = viewDataAdditionFunc == null ? new Dictionary<string, object>() : viewDataAdditionFunc();
            var finalRouteValues =
                incomingRouteValues
                .ChainSet(additionalValues);
            finalRouteValues["httproute"] = true;
            var newReq = new HttpRequestMessage();
            foreach ( var rp in _requestMessage.Value.Properties)
            {
                newReq.Properties[rp.Key]= rp.Value;
            }
          
            foreach (var route in routes)
            {
                var vpath = route.GetVirtualPath(newReq, finalRouteValues);
              
                if ( vpath != null)
                { 
                    var uri = new Uri("http://localhost/" + vpath.VirtualPath);
                    uri = new Uri(uri.GetLeftPart(UriPartial.Path) + request.RequestUri.Query);
                    if (!string.Equals(uri.PathAndQuery, _requestMessage.Value.RequestUri.PathAndQuery, StringComparison.OrdinalIgnoreCase))
                    {
                        return request.CreateResponse(HttpStatusCode.MovedPermanently, new RedirectResult(uri.PathAndQuery, true));
                    }
                    return null;
                    
                }
                
            }
               

            
            return null;
           
        }

        public IHttpRouteData GetRouteData(string virtualPathRoot, HttpRequestMessage request)
        {
            var routeCollection = GetRouteCollectionAsync().Result;
            if (routeCollection == null)
            {
                return null;
            }

            return  routeCollection.GetRouteData(_requestMessage.Value);
            
        }

     


    }
}