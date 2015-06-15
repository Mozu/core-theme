using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http.Routing;
using Autofac;
using Mozu.Core;
using Mozu.Core.Api.Client;
using System.Runtime.Caching;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.UX.Models.Navigation;
using System.Web.Http;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteSettings.General.Contracts.Clients;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using Mozu.Core.Extensions;

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

        static IDictionary<FancyRoute, string> controllerRoutes = new Dictionary<FancyRoute, string> {
            { FancyRoute.ProductDetails, "catalog" },
            { FancyRoute.Category, "catalog" },
            { FancyRoute.Search, "search" },
            { FancyRoute.CmsPage, "cmsPages" },
            { FancyRoute.CmsList, "cmsPages" },
            { FancyRoute.Cart, "cart" },
        };
        static IDictionary<FancyRoute, string> actionNames = new Dictionary<FancyRoute, string> {
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
            IGeneralSettingsWebApiClient genSettingsClient)
        {
            _siteBuilderApiContext = siteBuilderApiContext;
            _logger = logger;   
            _cache = cache;
            _customRouteConstraintFactory = customRouteConstraintFactory;
            _routeDataMappingFactory = routeDataMappingFactory;
            _genSettingsClient = genSettingsClient.CloneWithoutUserClaims();
        }

        Task<List<SiteRouteEntry>> ISiteRouteRepository.FetchSiteRouteEntries()
        {
            //TODO what here? siterouteentry isn't a clear map to this model
            throw new NotImplementedException();
        }

        Task<List<SiteRouteEntry>> ISiteRouteRepository.UpdateRedirectEntries(List<SiteRouteEntry> routes)
        {
            //TODO what here? siterouteentry isn't a clear map to this model
            throw new NotImplementedException();
        }

        async Task<HttpRouteCollection> ISiteRouteRepository.GetHttpRouteCollection()
        {
            var routes = await GetRouteSettings(_genSettingsClient).ConfigureAwait(false);
            if (routes == null) return null;

            var key = GetType().FullName +
                         ((_siteBuilderApiContext.DataViewMode == DataViewModeType.Pending) ? "1" : "0") +
                         _siteBuilderApiContext.SiteId +
                         (routes.Mappings.Count+routes.Validators.Count+routes.Routes.Count);

            return await _cache.AddOrGetExisting(key, async () => await CreateRouteCollectionFromSettings(routes), DateTimeOffset.UtcNow.AddMinutes(5));
        }

        private async Task<HttpRouteCollection> CreateRouteCollectionFromSettings(CustomRouteSettings customSettings)
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

        private CustomRoute CreateCustomRoute(Route routeDef, IDictionary<string, ICustomRouteConstraint> validators, IDictionary<string, IRouteDataMapping> mappings)
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


        private string GetControllerAction(FancyRoute internalRoute)
        {
            string s;
            if(actionNames.TryGetValue(internalRoute, out s)) return s;

            throw new ArgumentException(string.Format("don't know the route specified, {0}. Try one of {1} instead.", internalRoute, string.Join(";", Enum.GetValues(typeof(FancyRoute)).Cast<FancyRoute>().Select(x => x.ToString()))));
        }

        private string GetControllerName(FancyRoute internalRoute)
        {
            string s;
            if (controllerRoutes.TryGetValue(internalRoute, out s)) return s;

            throw new ArgumentException(string.Format("don't know the route specified, {0}. Try one of {1} instead.", internalRoute, string.Join(";", Enum.GetValues(typeof(FancyRoute)).Cast<FancyRoute>().Select(x => x.ToString()))));
        }

        private static async Task<CustomRouteSettings> GetRouteSettings(IGeneralSettingsWebApiClient genSettingsClient)
        {
            var settings = (await genSettingsClient.CloneWithoutUserClaims().GetGeneralSettings().ConfigureAwait(false)).ReadAsSync();
            return settings.CustomRoutes;
        }
    }

    public class CustomRoute : HttpRoute
    {
        string Template { get; set; }
        FancyRoute InternalRoute { get; set; }
        bool IsCanonical { get; set; }
        IEnumerable<IRouteDataMapping> Mappings { get; set; }

        public CustomRoute(string template, FancyRoute internalRoute, bool isCanonical, IDictionary<string, object> defaults, IDictionary<string, ICustomRouteConstraint> constraints, IEnumerable<IRouteDataMapping> mappings) :
            base(template, defaults.ToRouteDictionary(), constraints.ToRouteDictionary())
        {
            Template = template;
            InternalRoute = internalRoute;
            IsCanonical = isCanonical;
            Mappings = mappings;
        }

        /// <summary>
        /// Applies any route mappings that are attached to this route to the provided set of route data
        /// </summary>
        /// <param name="values"></param>
        /// <returns></returns>
        public IDictionary<string, object> RewriteRouteData(IDictionary<string, object> values)
        {
            values = Mappings.Aggregate(values, (dict, m) => m.Map(dict));
            return values;
        }

        public bool IsCanonicalFor(FancyRoute route)
        {
            return IsCanonical && InternalRoute == route;
        }
    }

    #region Interfaces
    public interface INotCrappyHttpRouteData : IHttpRouteData
    {
        new IDictionary<string, object> Values { get; set; }
    }

    public interface ICustomRouteConstraintFactory
    {
        ICustomRouteConstraint BuildConstraint(Validator validator);
    }

    public interface IRouteDataMappingFactory
    {
        IRouteDataMapping BuildMapping(Mapping mapping);
    }

    public interface ICanInit
    {
        Task<bool> Initialize();
    }

    /// <summary>
    /// think of these as a func (dict => dict) where we add mapped keys with the same values if present
    /// </summary>
    public interface IRouteDataMapping : ICanInit
    {
        IDictionary<string, object> Map(IDictionary<string, object> values);
    }

    public interface ICustomRouteConstraint : ICanInit {
        bool Match(string parameterName, IDictionary<string, object> routeData);
    }
    #endregion

}
