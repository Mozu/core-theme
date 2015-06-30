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

namespace Mozu.SiteBuilder.Mvc.SEO
{
    public class SiteRouteHandler : ISiteRouteHandler
    {
        public static string ContextKey = "SiteRouteEntry";
        private readonly HttpRequestMessage _requestMessage;
        private readonly ISiteBuilderApiContext _siteBuilderApiContext;
        private readonly ISiteRouteRepository _siteRouteRepository;
        private object _httpRouteCollection;

        public SiteRouteHandler(ISiteRouteRepository siteRouteRepository, HttpRequestMessage requestMessage, ISiteBuilderApiContext siteBuilderApiContext)
        {
            _siteRouteRepository = siteRouteRepository;
            _requestMessage = requestMessage;
            _siteBuilderApiContext = siteBuilderApiContext;
        }

        private HttpRouteCollection RouteCollection
        {
            get
            {
                if (_httpRouteCollection == null)
                {
                    _httpRouteCollection = _siteRouteRepository.GetHttpRouteCollection().ConfigureAwait(false).GetAwaiter().GetResult() ?? new object();
                }
                return _httpRouteCollection as HttpRouteCollection;
            }
        }

        public async Task<bool> RouteIncomingRequest()
        {
            var routeCollection = await GetRouteCollectionAsync().ConfigureAwait(false);
            if (routeCollection == null)
            {
                return false;
            }

            var rerouteData = routeCollection.GetRouteData(_requestMessage);
            if (rerouteData == null) return false;

            if (rerouteData.Route is CustomRoute)
            {
                var cr = rerouteData.Route as CustomRoute;
                cr.RewriteRouteData(rerouteData.Values);
            }

            _requestMessage.Properties[HttpPropertyKeys.HttpRouteDataKey] = rerouteData;
            var rctx = _requestMessage.GetRequestContext();
            rctx.RouteData = rerouteData;
            return true;
        }

        async Task<HttpRouteCollection> GetRouteCollectionAsync()
        {
            if (_httpRouteCollection == null)
            {
                _httpRouteCollection = (await _siteRouteRepository.GetHttpRouteCollection().ConfigureAwait(false)) ?? new object();
            }
            return _httpRouteCollection as HttpRouteCollection;
        }


        public async Task<HttpResponseMessage> RedirectWithContext(HttpRequestMessage request, FancyRoute internalRoute, Func<IDictionary<string, object>> viewDataAdditionFunc)
        {
            if (_siteBuilderApiContext.IsEditMode)
            {
                return null;
            }

            var routeCollection = await GetRouteCollectionAsync().ConfigureAwait(false);
            if (routeCollection == null) return null;

            var canonicalRouteAndData =
                routeCollection
                .Where(route => route is CustomRoute).Cast<CustomRoute>()
                .Where(route => route.IsCanonicalFor(internalRoute) && route != request.GetRouteData()) // don't want to redirect if the canonical route is the current route
                .Select(route => new { route, routeData = route.GetRouteData("/", request) }) // uhhh, what is the virtualPathRoot?
                .FirstOrDefault(x => x.routeData != null);

            if (canonicalRouteAndData == null) return null; // no canonical route that matches, or current route is canonical? then no redirect!

            // else redirect
            var incomingRouteValues = _requestMessage.GetRouteData().Values;
            var additionalValues = viewDataAdditionFunc == null ? new Dictionary<string, object>() : viewDataAdditionFunc();
            var finalRouteValues =
                incomingRouteValues
                .ChainAdd(additionalValues)
                .ChainAdd(canonicalRouteAndData.routeData.Values);

            var finalRoute = canonicalRouteAndData.route.GetVirtualPath(request, finalRouteValues).VirtualPath;
            return request.CreateResponse(HttpStatusCode.MovedPermanently, new RedirectResult(finalRoute, true));
        }
    }
}