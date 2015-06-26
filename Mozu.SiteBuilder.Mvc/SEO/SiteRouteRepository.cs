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

namespace Mozu.SiteBuilder.Mvc.SEO
{
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
                res = await _documentListWebApiClient.CreateDocument(doc.ListFQN, doc);
                return FetchSiteRouteEntries(res.ReadAsSync());
            }
        }

        async Task<HttpRouteCollection> ISiteRouteRepository.GetHttpRouteCollection()
        {
            var routes = await GetRouteSettings(_genSettingsClient).ConfigureAwait(false);
            if (routes == null) return null;

            var key = GetType().FullName +
                         ((_siteBuilderApiContext.DataViewMode == DataViewModeType.Pending) ? "1" : "0") +
                         _siteBuilderApiContext.SiteId +
                         (routes.Mappings.Count + routes.Validators.Count + routes.Routes.Count);

            return await _cache.AddOrGetExisting(key, async () => await CreateRouteCollectionFromSettings(routes), DateTimeOffset.UtcNow.AddMinutes(5));
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

        async Task<HttpRouteCollection> CreateRouteCollectionFromSettings(CustomRouteSettings customSettings)
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
                .Select(async x => await x.Initialize());

            await Task.WhenAll(tasks);

            var routes = customSettings.Routes.Select(x => CreateCustomRoute(x, constraints, mappings));

            var routeCollection = new HttpRouteCollection();
            foreach (var route in routes)
            {
                routeCollection.Add(route.RouteTemplate, route);
            }

            return routeCollection;
        }

        CustomRoute CreateCustomRoute(Route routeDef, IDictionary<string, ICustomRouteConstraint> validators, IDictionary<string, IRouteDataMapping> mappings)
        {
            var knownValidators =
                routeDef.Validators
                .Partition(validators.ContainsKey)
                .GetOrError(unknowns => new ArgumentException(string.Format("Some validators are not known: {0}", string.Join(",", unknowns))))
                .ToDictionary(x => x, x => validators[x], StringComparer.OrdinalIgnoreCase);

            var knownMappings =
                routeDef.Mappings
                .Partition(mappings.ContainsKey)
                .GetOrError(unknowns => new ArgumentException(string.Format("Some validators are not known: {0}", string.Join(",", unknowns))))
                .Select(x => mappings[x]);

            var defaults =
                routeDef.Defaults
                .ChainAdd("controller", GetControllerName(routeDef.InternalRoute.ToEnum<FancyRoute>()))
                .ChainAdd("action", GetControllerAction(routeDef.InternalRoute.ToEnum<FancyRoute>()));

            return new CustomRoute(routeDef.Template, routeDef.InternalRoute.ToEnum<FancyRoute>(), routeDef.Canonical.GetValueOrDefault(false), defaults, knownValidators, knownMappings);
        }

        string GetControllerAction(FancyRoute internalRoute)
        {
            string s;
            if (ActionNames.TryGetValue(internalRoute, out s)) return s;

            throw new ArgumentException(string.Format("don't know the route specified, {0}. Try one of {1} instead.", internalRoute, string.Join(";", Enum.GetValues(typeof(FancyRoute)).Cast<FancyRoute>().Select(x => x.ToString()))));
        }

        string GetControllerName(FancyRoute internalRoute)
        {
            string s;
            if (ControllerRoutes.TryGetValue(internalRoute, out s)) return s;

            throw new ArgumentException(string.Format("don't know the route specified, {0}. Try one of {1} instead.", internalRoute, string.Join(";", Enum.GetValues(typeof(FancyRoute)).Cast<FancyRoute>().Select(x => x.ToString()))));
        }

        static async Task<CustomRouteSettings> GetRouteSettings(IGeneralSettingsWebApiClient genSettingsClient)
        {
            var settings = (await genSettingsClient.CloneWithoutUserClaims().GetGeneralSettings().ConfigureAwait(false)).ReadAsSync();
            return settings.CustomRoutes;
        }
    }
}
