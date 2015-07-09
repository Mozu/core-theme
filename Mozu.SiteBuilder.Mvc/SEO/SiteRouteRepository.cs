using Mozu.Core;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.SiteBuilder.UX.Models.Navigation;
using System.Runtime.Caching;

using Mozu.Core.Logging;
using Mozu.SiteSettings.General.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.Core.Api.Client;
using Mozu.Core.Extensions;
using Mozu.Content.Contracts.Clients;
using Newtonsoft.Json.Linq;
using Mozu.Content.Contracts;
using Mozu.SiteBuilder.Mvc.SEO.Mappings;

namespace Mozu.SiteBuilder.Mvc.SEO
{

    public class HttpRouteCollection2 : System.Web.Http.HttpRouteCollection
    {
        

    }

    public class HttpRouteCollectionWithMappings:System.Web.Http.HttpRouteCollection{
        public List<IRouteDataMapping> PreRouteMappings { get; set; }

    }
    public class SiteRouteRepository : ISiteRouteRepository
    {
        readonly ObjectCache _cache;
        readonly ILogger _logger;
        readonly ISiteBuilderApiContext _siteBuilderApiContext;
        readonly ICustomRouteConstraintFactory _customRouteConstraintFactory;
        readonly IRouteDataMappingFactory _routeDataMappingFactory;
        readonly IGeneralSettingsWebApiClient _genSettingsClient;
        readonly IDocumentListWebApiClient _documentListWebApiClient;

        static IDictionary<FancyRoute, string> ControllerRoutes = new Dictionary<FancyRoute, string> {
            { FancyRoute.ProductDetails, "catalog" },
            { FancyRoute.Category, "catalog" },
            { FancyRoute.Search, "search" },
            { FancyRoute.CmsPage, "cmsPages" },
            { FancyRoute.CmsList, "cmsPages" },
            { FancyRoute.Cart, "cart" },
        };
        static IDictionary<FancyRoute, string> ActionNames = new Dictionary<FancyRoute, string> {
            { FancyRoute.ProductDetails, "productDetail" },
            { FancyRoute.Category, "category" },
            { FancyRoute.Search, "index" },
            { FancyRoute.CmsPage, "page" },
            { FancyRoute.CmsList, "contentindex" },
            { FancyRoute.Cart, "index" },
        };
        

        public SiteRouteRepository(
            ISiteBuilderApiContext siteBuilderApiContext,
            ILogger logger,
            ObjectCache cache,
            ICustomRouteConstraintFactory customRouteConstraintFactory,
            IRouteDataMappingFactory routeDataMappingFactory,
            IGeneralSettingsWebApiClient genSettingsClient,
            IDocumentListWebApiClient documentListWebApiClient)
        {
            _siteBuilderApiContext = siteBuilderApiContext;
            _logger = logger;
            _cache = cache;
            _customRouteConstraintFactory = customRouteConstraintFactory;
            _routeDataMappingFactory = routeDataMappingFactory;
            _genSettingsClient = genSettingsClient.CloneWithoutUserClaims();
            _documentListWebApiClient = documentListWebApiClient.CloneWithoutUserClaims();
        }

        async Task<List<SiteRouteEntry>> ISiteRouteRepository.FetchSiteRouteEntries()
        {
            var docResponse = await _documentListWebApiClient.GetTreeDocument("siteSettings@mozu", "siteRoutes").ConfigureAwait(false);
            if (docResponse.HasException || !docResponse.ResponseMessage.IsSuccessStatusCode)
            {
                return new List<SiteRouteEntry>();
            }
            return FetchSiteRouteEntries(docResponse.ReadAsSync());
        }

        async Task<List<SiteRouteEntry>> ISiteRouteRepository.UpdateRedirectEntries(List<SiteRouteEntry> routes)
        {
            var res = await _documentListWebApiClient.GetTreeDocument("siteSettings@mozu", "siteRoutes").ConfigureAwait(false);
            if (res.ResponseMessage.IsSuccessStatusCode)
            {
                var doc = res.ReadAsSync();
                doc.Set("data", JArray.FromObject(routes));
                res = await _documentListWebApiClient.UpdateDocument(doc.ListFQN, doc.Id, doc);
                return routes;
            }
            else
            {
                var doc = new Document
                          {
                              Name = "siteRoutes",
                              DocumentTypeFQN = "document@mozu",
                              ListFQN = "siteSettings@mozu",
                          };
                doc.Set("data", JArray.FromObject(routes));
                res = await _documentListWebApiClient.CreateDocument(doc.ListFQN, doc).ConfigureAwait(false);
                return FetchSiteRouteEntries(res.ReadAsSync());
            }
        }

        async Task<HttpRouteCollection2> ISiteRouteRepository.GetHttpRouteCollection()
        {
            var settings = await GetRouteSettings(_genSettingsClient).ConfigureAwait(false);
            var routes = settings.CustomRoutes;
            if (routes == null) return null;

            var key = GetType().FullName +
                         ((_siteBuilderApiContext.DataViewMode == DataViewModeType.Pending) ? "1" : "0") +
                         _siteBuilderApiContext.SiteId +
                         settings.AuditInfo.UpdateDate.GetValueOrDefault(DateTime.MaxValue).Ticks;

            return await _cache.AddOrGetExisting(key, async () => await CreateRouteCollectionFromSettings(routes).ConfigureAwait(false), DateTimeOffset.UtcNow.AddMinutes(5)).ConfigureAwait(false);
        }

        List<SiteRouteEntry> FetchSiteRouteEntries(Document doc)
        {
            if (doc == null) return new List<SiteRouteEntry>(); 
            var jobj = doc.Get<JArray>("data");
            if (jobj == null) return new List<SiteRouteEntry>();
            try
            {
                return jobj.ToObject<List<SiteRouteEntry>>();
            }
            catch (Exception ex)
            {
                _logger.Warn("unexpected error deserializing errror in siteroute repo", ex);
                return new List<SiteRouteEntry>();
            }
        }

        async Task<HttpRouteCollection2> CreateRouteCollectionFromSettings(CustomRouteSettings customSettings)
        {
            if (customSettings == null) return null;

            var constraints =
                customSettings.Validators
                .Select(kvp => new { kvp.Key, Constraint = _customRouteConstraintFactory.BuildConstraint(kvp.Value) })
                .Where(x => x.Constraint != null)
                .ToDictionary(x => x.Key, x => x.Constraint, StringComparer.OrdinalIgnoreCase);

            var mappings =
                customSettings.Mappings
                .Select(kvp => new { kvp.Key, Mapping = _routeDataMappingFactory.BuildMapping(kvp.Value) })
                .Where(x => x.Mapping != null)
                .ToDictionary(x => x.Key, x => x.Mapping, StringComparer.OrdinalIgnoreCase);

            var tasks =
                constraints.Values.Cast<ICanInit>()
                .Concat(mappings.Values.Cast<ICanInit>())
                .Where(x => x != null)
                .Select(async x => await x.Initialize().ConfigureAwait(false));

            await Task.WhenAll(tasks).ConfigureAwait(false);

            var routes = customSettings.Routes.Select(x => CreateCustomRoute(x, constraints, mappings));

            var routeCollection = new HttpRouteCollection2();
            foreach (var route in routes)
            {
                if ( routeCollection.ContainsKey( route.RouteTemplate))
                {
                    throw new ArgumentException("duplicate route [" + route.RouteTemplate + "]");
                }
               routeCollection.Add(route.RouteTemplate, route);
               
            }

            return routeCollection;
        }

        CustomRoute CreateCustomRoute(Route routeDef, IDictionary<string, ICustomRouteConstraint> validators, IDictionary<string, IRouteDataMapping> mappings)
        {
            var knownValidators =
                routeDef.Validators
                .Partition(kvp => validators.ContainsKey(kvp.Key ))
                .GetOrError(unknowns => new ArgumentException(string.Format("Some validators are not known: {0}", string.Join(",", unknowns.Select(x => x.Key)))))
                .ToDictionary( x => validators[x.Key],  x => x.Value);

               // .ToDictionary<ICustomRouteConstraint, string[]>((KeyValuePair<string, string[]> x) => validators[x.Key], (KeyValuePair<string, string[]> x) => x.Value, StringComparer.OrdinalIgnoreCase);

            var knownMappings =
                routeDef.Mappings
                .Partition(kvp => mappings.ContainsKey(kvp.Key))
                .GetOrError(unknowns => new ArgumentException(string.Format("Some validators are not known: {0}", string.Join(",", unknowns))))
                .ToDictionary(x => mappings[x.Key ], x => x.Value);

            knownMappings[RouteDataFixup.DefaultMapping] = new string[0];

            var defaults =
                routeDef.Defaults
                .ChainSet("controller", GetControllerName(routeDef.InternalRoute.ToEnum<FancyRoute>()))
                .ChainSet("action", GetControllerAction(routeDef.InternalRoute.ToEnum<FancyRoute>()));
               

                

            return new CustomRoute(routeDef.Template, routeDef.InternalRoute.ToEnum<FancyRoute>(), routeDef.Canonical.GetValueOrDefault(false), defaults, knownValidators, knownMappings);
        }

        public static string GetControllerAction(FancyRoute internalRoute)
        {
            string s;
            if (ActionNames.TryGetValue(internalRoute, out s)) return s;

            throw new ArgumentException(string.Format("don't know the route specified, {0}. Try one of {1} instead.", internalRoute, string.Join(";", Enum.GetValues(typeof(FancyRoute)).Cast<FancyRoute>().Select(x => x.ToString()))));
        }

        public static string GetControllerName(FancyRoute internalRoute)
        {
            string s;
            if (ControllerRoutes.TryGetValue(internalRoute, out s)) return s;

            throw new ArgumentException(string.Format("don't know the route specified, {0}. Try one of {1} instead.", internalRoute, string.Join(";", Enum.GetValues(typeof(FancyRoute)).Cast<FancyRoute>().Select(x => x.ToString()))));
        }

        static async Task<Mozu.SiteSettings.General.Contracts.GeneralSettings> GetRouteSettings(IGeneralSettingsWebApiClient genSettingsClient)
        {
            var settings = (await genSettingsClient.CloneWithoutUserClaims().GetGeneralSettings().ConfigureAwait(false)).ReadAsSync();
            return settings;
        }
    }
}
