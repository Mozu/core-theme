using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Mozu.Core.Configuration;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Middleware;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.Mvc.SEO
{
    public interface IRouteConfig
    {
        RouteCollection DefaultRoutes { get; }
        IRouter DefaultHandler { get; }
        //void RouteIncomingDefaultRouteRequest(RouteContext context);
        Task RouteAsync(RouteContext context);

        //void RouteIncomingSystemRouteRequest(RouteContext context);
    }

    public class CustomRouteHandler : ICustomRouteHandler
    {
        private readonly HttpContext _context;
        private readonly Lazy<ISiteBuilderApiContext> _siteBuilderApiContext;
        private readonly IRouteConfig _routeconfig;
        private readonly Lazy<ICustomRouteCollectionRepository> _customRouteRepository;
        private object _httpRouteCollection;
        private readonly Lazy<bool> _forceSSL;
        private readonly Uri _originalUri;

        public CustomRouteHandler(HttpContext context, Lazy<ICustomRouteCollectionRepository> customRouteRepository, Lazy<ISiteBuilderApiContext> siteBuilderApiContext, IRouteConfig routeconfig, IRequestUrlFinderOuter requestUrlHelper)
        {
            _context = context;
            _customRouteRepository = customRouteRepository;
            _siteBuilderApiContext = siteBuilderApiContext;
            _routeconfig = routeconfig;
            _forceSSL = new Lazy<bool>(() => context.RequestServices.Resolve<ISiteContext>().GeneralSettings?.EnforceSitewideSSL == true, LazyThreadSafetyMode.None);
            _originalUri = new Uri(requestUrlHelper.GetRequestUrl());
        }

        public void Reset ()
        {
            _httpRouteCollection = null;
        }
        private RouteCollection RouteCollection
        {
            get
            {
                if (_httpRouteCollection == null)
                {
                    _httpRouteCollection = _customRouteRepository.Value.GetRouteCollection() ?? new object();
                }
                return _httpRouteCollection as RouteCollection ?? new RouteCollection();
            }
        }

        public Task RouteAsync(RouteContext context)
        {
            var routeCollection = GetRouteCollection();
            if (routeCollection == null)
            {
                return Task.CompletedTask;
            }
            return RouteCollection.RouteAsync(context);
        }
        //public async Task<bool> Init()
        //{
        //    var routeCollection = await GetRouteCollectionAsync().ConfigureAwait(false);

        //    return routeCollection == null;
        //}

        // public IRouter RouteIncomingRequest(RouteContext routeContext)
        // {
        //     var path = _originalUri.AbsolutePath;
        //     if (path.Contains( "=") || path.Contains("?"))
        //     {
        //         return null;
        //     }
        //     var routeCollection = GetRouteCollection();
        //     if (routeCollection == null)
        //     {
        //         return null;
        //     }
        //
        //     
        //     if (!routeCollection.TryMatchRoute(_context, out var routeData)) return null;
        //
        //     if (routeData.Routers[0] is CustomRoute cr)
        //     {
        //        
        //         cr.RewriteRouteData(routeContext, routeData.Values);
        //     }
        //
        //     routeContext.RouteData = routeData;
        //     return routeData.Routers[0];
        // }
        
        RouteCollection GetRouteCollection()
        {
            _httpRouteCollection ??= _customRouteRepository.Value.GetRouteCollection();
            return _httpRouteCollection as RouteCollection ?? new RouteCollection();
        }

        System.Collections.Concurrent.ConcurrentDictionary<FancyRoute,Tuple<RouteCollection, List<CustomRoute>>> _canonicalCache = new System.Collections.Concurrent.ConcurrentDictionary<FancyRoute, Tuple<RouteCollection, List<CustomRoute>>>();
        List<CustomRoute> GetCanonicalRouteList(FancyRoute internalRoute, RouteCollection routeCollection , IRouteConfig routeConfig)
        {
            var res = _canonicalCache.GetOrAdd(internalRoute, (ir) => DoGetCanonicalRouteList(ir, routeCollection, routeConfig));
            if (!Equals(res.Item1, routeCollection))
            {
                _canonicalCache.TryRemove(internalRoute, out res);
            }
            res = _canonicalCache.GetOrAdd(internalRoute, (ir) => DoGetCanonicalRouteList(ir, routeCollection, routeConfig));
            return res.Item2;
        }
        Tuple<RouteCollection, List<CustomRoute>> DoGetCanonicalRouteList(FancyRoute internalRoute, RouteCollection routeCollection, IRouteConfig routeConfig)
        {
            var routes = new List<CustomRoute>();
           

            if (routeCollection != null)
            {
                for (int i = 0; i < routeCollection.Count;i++) {
                    var route = routeCollection[i] as CustomRoute;
                    if (route?.IsCanonicalFor(internalRoute) == true)
                    {
                        routes.Add(route);
                    }
                }
            }
            for (int i = 0; i < routeConfig.DefaultRoutes.Count; i++)
            {
                var route = routeConfig.DefaultRoutes[i] as CustomRoute;
                if (route?.IsCanonicalFor(internalRoute) == true)
                {
                    routes.Add(route);
                }
            }
           
            
            return new Tuple<RouteCollection, List<CustomRoute>>(routeCollection, routes);
        }

        public IActionResult RedirectWithContext(HttpRequest request, FancyRoute internalRoute, Func<IDictionary<string, object>> viewDataAdditionFunc)
        {
            if (_siteBuilderApiContext.Value.IsEditMode || _siteBuilderApiContext.Value.IsAdminMode)
            {
                return null;
            }

            if (request.HttpContext.Items.TryGetValue(UrlRewritingMiddleware.IsSeoRewrite , out var tmp) && tmp is bool b && b)
            {
                return null;
            }

            var currentRouteData  = request.HttpContext.GetRouteData();
            var routes = GetCanonicalRouteList(internalRoute, RouteCollection, _routeconfig);
            if (!routes.Any()) return null; // no canonical route that matches, or current route is canonical? then no redirect!

     
            var incomingRouteValues = currentRouteData.Values;
            var additionalValues = viewDataAdditionFunc == null ? new Dictionary<string, object>() : viewDataAdditionFunc();
            var finalRouteValues =
                incomingRouteValues
                .ChainSet(additionalValues)
                .ChainSet("httproute", true);

            //var newReq = new HttpRequestMessage();
            //foreach ( var (key, value) in _context.Items)
            //{
            //    newReq.Properties[key]= value;
            //}
            
            foreach (var route in routes)
            {
                var vpc = new VirtualPathContext(_context, currentRouteData.Values, new RouteValueDictionary(finalRouteValues));
                var vpath = route.GetVirtualPath(vpc);
                if (vpath != null)
                {
                    var uri = new Uri("http://localhost/" + vpath.VirtualPath.TrimStart('/'));

                    //only redirect if stem is different
                    if (!string.Equals(
                        uri.GetComponents(UriComponents.Path , UriFormat.Unescaped),
                        _originalUri.GetComponents(UriComponents.Path , UriFormat.Unescaped), 
                        StringComparison.OrdinalIgnoreCase)  &&
                        !string.Equals(
                        uri.GetComponents(UriComponents.Path, UriFormat.Unescaped),
                        _context.GetRequestUri().GetComponents(UriComponents.Path, UriFormat.Unescaped),
                        StringComparison.OrdinalIgnoreCase))
                    {

                        var httpCtx = new DefaultHttpContext();
                        httpCtx.RequestServices = _context.RequestServices;
                        httpCtx.Request.Path = uri.LocalPath;
                        var rc = new RouteContext(httpCtx);
                        route.RouteAsync(rc);
                        if (rc.RouteData.Routers?.Count!=1)
                        {
                            return null;
                        }
                        // if (!IsValidForExistingContext(request , uri, RouteCollection, _routeconfig.DefaultRoutes))
                        // {
                        //     return null;
                        // }

                        var preStrippedRequest = request.HttpContext.Items.ContainsKey(UrlRewritingMiddleware.MzPreCleanedUri) ?
                        (Uri)request.HttpContext.Items[UrlRewritingMiddleware.MzPreCleanedUri] :
                        new Uri(request.GetDisplayUrl());

                        uri = new Uri(uri.GetLeftPart(UriPartial.Path) + preStrippedRequest.Query);
                        request.HttpContext.Response.Headers[Constants.HEADER_CANONICAL_URL] = uri.PathAndQuery;

                        return new RedirectResult(new Uri(uri.PathAndQuery, UriKind.Relative).ToString(), true);
                    }

                    if (!request.Headers.TryGetValue(Constants.HEADER_ALTERNATIVE_VIEW, out var values) ||
                        values.All(string.IsNullOrWhiteSpace)) return null;

                    uri = new Uri(uri.GetLeftPart(UriPartial.Path) + request.QueryString);
                    request.HttpContext.Response.Headers[Constants.HEADER_CANONICAL_URL] = uri.PathAndQuery;
                    return null;
                }
                //if current route didnt match??? load bearing code do not remove
                if (currentRouteData.Routers.Last() == route)
                {
                    return null;
                }
            }
            return null;
        }

        // private static bool IsValidForExistingContext(HttpRequest currentRequest, Uri candidateUri, RouteCollection siteCollection, RouteCollection defaultCollection)
        // {
        //     siteCollection.RouteAsync()
        //     CustomRoute reverseResolvedRoute = null;
        //
        //     if (siteCollection.TryMatchRoute(candidateUri, out var outRouteData) ||
        //        defaultCollection.TryMatchRoute(candidateUri, out outRouteData))
        //     {
        //         reverseResolvedRoute = outRouteData.Routers[0] as CustomRoute;
        //     }
        //
        //     if (reverseResolvedRoute == null)
        //     {
        //         return false;
        //     }
        //     return !(currentRequest.HttpContext.GetRouteData().Routers.Last() is CustomRoute resolvedRoute) || resolvedRoute.InternalRoute == reverseResolvedRoute.InternalRoute;
        // }

        private static bool IsValidForExistingContext(HttpRequest currentRequest, Uri candidateUri, RouteCollection siteCollection, IList<IRouter> defaultCollection)
        {
            CustomRoute reverseResolvedRoute = null;
            
            //PANTS
            // if (siteCollection.TryMatchRoute(currentRequest.HttpContext, out var outRouteData) || 
            //    defaultCollection.TryMatchRoute(currentRequest.HttpContext, out outRouteData))
            // {
            //     reverseResolvedRoute = outRouteData.Routers[0] as CustomRoute;
            // }

            if (reverseResolvedRoute == null)
            {
                return false;
            }
            return !(currentRequest.HttpContext.GetRouteData().Routers.Last() is CustomRoute resolvedRoute) || resolvedRoute.InternalRoute == reverseResolvedRoute.InternalRoute;
        }

        static int? GetPortForScheme(int incomingPort, CustomRoute.Scheme desiredScheme)
        {
            if (incomingPort == 80 && desiredScheme == CustomRoute.Scheme.Http) return null;
            if (incomingPort == 443 && desiredScheme == CustomRoute.Scheme.Https) return null;
            return incomingPort;
        }

        public string GetCanonicalUrl(FancyRoute internalRoute, Func<IDictionary<string, object>> viewDataAdditionFunc, bool useContext, string hostName = null)
        {
            var routeCollection =  RouteCollection;
            var routes = GetCanonicalRouteList(internalRoute, routeCollection, _routeconfig);
            if (!routes.Any()) return null; // no canonical route that matches, or current route is canonical? then no redirect!


            var  routingValues = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase) { { "httproute", true } };
            if (useContext)
            {
                routingValues.ChainSet(_context.GetRouteData().Values, true);
            }
            if ( viewDataAdditionFunc != null)
            {
                routingValues.ChainSet(viewDataAdditionFunc(), true);
            }

            var vpc = new VirtualPathContext(_context, null, new RouteValueDictionary(routingValues));
            foreach (var route in routes)
            {
                var vpath = route.GetVirtualPath(vpc);
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
        //static HttpRequestMessage PrepareNewHttpRequest(HttpRequestMessage parent)
        //{
        //    var newReq = new HttpRequestMessage();
        //    newReq.Properties[HttpPropertyKeys.DependencyScope] = parent.Properties[HttpPropertyKeys.DependencyScope];
        //    return newReq;
        //}
        
        static string CreateOutboundUri(CustomRoute route, VirtualPathData vpath, string host, bool fullyQualifyUris, Lazy<bool> forceSsl)
        {
           var path = "/" + new Uri("http://localhost/" + vpath.VirtualPath.TrimStart('/'), UriKind.Absolute).GetComponents(UriComponents.Path, UriFormat.Unescaped);
           // var query = useInboundQuery ? incomingUri.Query.TrimStart('?') :  string.Empty;
           // var scheme = route.UrlScheme.HasValue ? route.UrlScheme.Value.ToStringQuickly() : incomingUri.Scheme;
           var builder = new UriBuilder("http://localhost") {Path = path};
           if (!fullyQualifyUris) return builder.Uri.GetComponents(UriComponents.PathAndQuery, UriFormat.Unescaped);

           builder.Host = host;
           builder.Scheme = route.UrlScheme.HasValue ? route.UrlScheme.ToString() : (forceSsl.Value ? "https" : "http");
           if (string.Equals(builder.Scheme , CustomRoute.Scheme.Https.ToString(), StringComparison.OrdinalIgnoreCase))
           {
               builder.Port = 443;
           }
           return builder.Uri.GetComponents(UriComponents.HttpRequestUrl, UriFormat.Unescaped);
        }

        // public RouteData GetRouteData()
        // {
        //     var routeCollection = GetRouteCollection();
        //     if (routeCollection == null) return null;
        //
        //     return routeCollection.TryMatchRoute(_context, out var routeData) ? routeData : null;
        // }
    }
}