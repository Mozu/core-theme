using Mozu.Core;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using System.Runtime.Caching;
using System.Text.RegularExpressions;
using Mozu.Core.Logging;
using Mozu.SiteSettings.General.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.Core.Api.Client;
using Mozu.Core.Extensions;
using Mozu.Content.Contracts.Clients;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.SEO.Constraints;
using Mozu.SiteBuilder.Mvc.SEO.Mappings;

namespace Mozu.SiteBuilder.Mvc.SEO
{
    public class HttpRouteCollectionWithMappings: HttpRouteCollection {
        public List<IRouteDataMapping> PreRouteMappings { get; set; }
    }

    public class CustomRouteRepository : ICustomRouteCollectionRepository
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
        

        public CustomRouteRepository(
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


        async Task<HttpRouteCollection> ICustomRouteCollectionRepository.GetHttpRouteCollection()
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
            var implictHanlder = new ImplicitConfigurationHandler(constraints, mappings, _customRouteConstraintFactory, _routeDataMappingFactory);
            customSettings.Routes.ForEach(x=> implictHanlder.ConfigureRoute(x));
           
            
            var tasks =
                constraints.Values.Cast<ICanInit>()
                .Concat(mappings.Values.Cast<ICanInit>())
                .Where(x => x != null)
                .Select(async x => await x.Initialize().ConfigureAwait(false));

            await Task.WhenAll(tasks).ConfigureAwait(false);

            var routes = customSettings.Routes.Select(x => CreateCustomRoute(x, constraints, mappings));

            var routeCollection = new HttpRouteCollection();
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





        class ImplicitConfigurationHandler
        {
            private readonly IDictionary<string, ICustomRouteConstraint> _validators;
            private readonly IDictionary<string, IRouteDataMapping> _mappings;
            private readonly ICustomRouteConstraintFactory _customRouteConstraintFactory;
            private readonly IRouteDataMappingFactory _routeDataMappingFactory;

            public ImplicitConfigurationHandler(
                IDictionary<string, ICustomRouteConstraint> validators,
                IDictionary<string, IRouteDataMapping> mappings,
                ICustomRouteConstraintFactory customRouteConstraintFactory,
                IRouteDataMappingFactory routeDataMappingFactory)
            {
                _validators = validators;
                _mappings = mappings;
                _customRouteConstraintFactory = customRouteConstraintFactory;
                _routeDataMappingFactory = routeDataMappingFactory;
            }

            static Regex segmentsRe = new Regex(@"{(?<catSegment>(([a-z0-9~]+)\-){0,1}(?<catType>category(Code|Id|Slug)))}|{(?<facetSegment>((?<facet>[a-z0-9~]+)\-facet))}",
                RegexOptions.IgnoreCase |
                RegexOptions.ExplicitCapture |
                RegexOptions.Singleline |
                RegexOptions.IgnorePatternWhitespace);

            
            public Route ConfigureRoute(Route routeDef)
            {

                var matches = segmentsRe.Matches(routeDef.Template);

                foreach (Match match in matches)
                {
                    if (match.Success)
                    {
                        var catSegmens = match.Groups["catSegment"].Captures;
                        var catTypes = match.Groups["catType"].Captures;
                        var facetSegments = match.Groups["facetSegment"].Captures;
                        var facets = match.Groups["facet"].Captures;
                        ProcessCategorySegments(routeDef, catSegmens, catTypes);

                        ProcessFacetSegments(routeDef, facetSegments, facets);
                    }
                }
                return routeDef;

            }

            private void ProcessFacetSegments(Route routeDef, CaptureCollection facetSegments, CaptureCollection facets)
            {
                for (int i = 0; i < facetSegments.Count; i++)
                {
                    var facetSegment = facetSegments[i].Value;
                    var facet = facets[i].Value;
                    var constaintName = (string) null;
                    var kvp =
                        _validators.FirstOrDefault(
                            x =>
                                x.Value is ProductAttributeRouteConstraint &&
                                string.Equals(((ProductAttributeRouteConstraint) x.Value).AttributeCode, facet,
                                    StringComparison.OrdinalIgnoreCase));
                    if (kvp.Key == null)
                    {
                        constaintName = "_" + facet;
                        if (_validators.ContainsKey(constaintName))
                        {
                            continue;
                        }

                        var constraint =
                            _customRouteConstraintFactory.BuildConstraint(new Validator()
                            {
                                type = Validator.TypeConst.attribute,
                                attributeCode = facet
                            });
                        _validators[constaintName] = constraint;
                    }
                    else
                    {
                        constaintName = kvp.Key;
                    }
                    routeDef.Validators = routeDef.Validators ?? new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase);
                    string[] tokensToValidate;
                    if (routeDef.Validators.TryGetValue(constaintName, out tokensToValidate))
                    {
                        tokensToValidate = tokensToValidate ?? new string[0];
                        if (!tokensToValidate.Contains(facetSegment))
                        {
                            routeDef.Validators[constaintName] = tokensToValidate.Concat(new string[] {facetSegment}).ToArray();
                        }
                    }
                    else
                    {
                        routeDef.Validators[constaintName] = new string[] {facetSegment};
                    }


                    var mappingName = constaintName;
                    string[] mappTokens;
                    var mappingKvp =
                        _mappings.FirstOrDefault(
                            x =>
                                x.Value is FacetValueFilterMapping &&
                                string.Equals(((FacetValueFilterMapping) x.Value).Settings.facetId, facet,
                                    StringComparison.OrdinalIgnoreCase));
                    if (mappingKvp.Key == null)
                    {
                        mappingName = "_" + facet;
                        if (_mappings.ContainsKey(mappingName))
                        {
                            continue;
                        }

                        var mapping =
                            _routeDataMappingFactory.BuildMapping(new Mapping()
                            {
                                type = Mapping.TypeConst.facet,
                                facetId = facet,
                                mapTo = "facetValueFilter"
                            });
                        _mappings[mappingName] = mapping;
                    }
                    else
                    {
                        mappingName = mappingKvp.Key;
                    }


                    routeDef.Mappings = routeDef.Mappings ?? new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase);
                    if (routeDef.Mappings.TryGetValue(mappingName, out mappTokens))
                    {
                        mappTokens = mappTokens ?? new string[0];
                        if (!mappTokens.Contains(facetSegment))
                        {
                            routeDef.Mappings[mappingName] = mappTokens.Concat(new string[] {facetSegment}).ToArray();
                        }
                    }
                    else
                    {
                        routeDef.Mappings[mappingName] = new string[] {facetSegment};
                    }
                }
            }

            private void ProcessCategorySegments(Route routeDef, CaptureCollection catSegmens, CaptureCollection catTypes)
            {
                for (int i = 0; i < catSegmens.Count; i++)
                {
                    var constaintName = (string) null;
                    var contraintType = catTypes[i].Value;
                    var catSegment = catSegmens[i].Value;
                    var token = new CategoryToken(catSegment);
                    if ( token.Depth !=0)
                    {
                        continue;
                    }
                    if ( string.Equals( contraintType , "categoryCode", StringComparison.InvariantCultureIgnoreCase) ||
                        string.Equals(contraintType, "categorySlug", StringComparison.InvariantCultureIgnoreCase))
                    {
                        contraintType = contraintType + "Path";
                    }
                        
                    if (catSegment.StartsWith("parent-Category"))
                    {
                        continue;
                    }
                    var kvp =
                        _validators.FirstOrDefault(
                            x =>
                                x.Value is CategoryContraint &&
                                string.Equals(((CategoryContraint) x.Value).Settings.type, contraintType,
                                    StringComparison.OrdinalIgnoreCase));
                    if (kvp.Key == null)
                    {
                        constaintName = "_" + contraintType;
                        if (_validators.ContainsKey(constaintName))
                        {
                            continue;
                        }
                        var constraint = new CategoryContraint(new Validator() {type = contraintType});
                        _validators[constaintName] = constraint;
                    }
                    else
                    {
                        constaintName = kvp.Key;
                    }

                    routeDef.Validators = routeDef.Validators ?? new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase);
                    string[] tokensToValidate;
                    if (routeDef.Validators.TryGetValue(constaintName, out tokensToValidate))
                    {
                        tokensToValidate = tokensToValidate ?? new string[0];
                        if (!tokensToValidate.Contains(catSegment))
                        {
                            routeDef.Validators[constaintName] = tokensToValidate.Concat(new string[] {catSegment}).ToArray();
                        }
                    }
                    else
                    {
                        routeDef.Validators[constaintName] = new string[] {catSegment};
                    }
                }
            }
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
