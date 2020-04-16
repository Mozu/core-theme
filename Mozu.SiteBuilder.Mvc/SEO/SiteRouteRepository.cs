using Mozu.Core;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using System.Runtime.Caching;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Mozu.Core.Logging;
using Mozu.SiteSettings.General.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.Core.Api.Client;
using Mozu.Core.Extensions;
using Mozu.Content.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.SEO.Constraints;
using Mozu.SiteBuilder.Mvc.SEO.Mappings;
using Mozu.SiteBuilder.Mvc.Caching;
using Mozu.SiteBuilder.Mvc.Context;
using Route = Mozu.SiteSettings.General.Contracts.General.Routing.Route;

namespace Mozu.SiteBuilder.Mvc.SEO
{
    public class HttpRouteCollectionWithMappings : RouteCollection {
        public List<IRouteDataMapping> PreRouteMappings { get; set; }
    }

    public class CustomRouteRepository : ICustomRouteCollectionRepository
    {

        private readonly HttpContext _httpContext;
        readonly ILogger _logger;
        readonly ISiteBuilderApiContext _siteBuilderApiContext;
        readonly ICustomRouteConstraintFactory _customRouteConstraintFactory;
        readonly IRouteDataMappingFactory _routeDataMappingFactory;
  
        Mozu.SiteBuilder.Mvc.Context.ISiteBuilderContextProvider _contextProvider;

        static IDictionary<FancyRoute, string> ControllerRoutes = new Dictionary<FancyRoute, string> {
            { FancyRoute.ProductDetails, "catalog" },
            { FancyRoute.Category, "catalog" },
            { FancyRoute.Search, "search" },
            { FancyRoute.CmsPage, "cmsPages" },
            { FancyRoute.CmsList, "cmsPages" },
            { FancyRoute.Cart, "cart" },
            { FancyRoute.Arcjs, null },
        };
        static IDictionary<FancyRoute, string> ActionNames = new Dictionary<FancyRoute, string> {
            { FancyRoute.ProductDetails, "productDetail" },
            { FancyRoute.Category, "category" },
            { FancyRoute.Search, "index" },
            { FancyRoute.CmsPage, "page" },
            { FancyRoute.CmsList, "contentindex" },
            { FancyRoute.Cart, "index" },
            { FancyRoute.Arcjs, null },
        };

    
        public CustomRouteRepository(
            ISiteBuilderApiContext siteBuilderApiContext,
            ILogger logger,
            ISiteBuilderContextProvider contextProvider,
            ICustomRouteConstraintFactory customRouteConstraintFactory,
            IRouteDataMappingFactory routeDataMappingFactory,
            HttpContext httpContext
          )
        {
            _siteBuilderApiContext = siteBuilderApiContext;
            _logger = logger;
            _contextProvider = contextProvider;
            _customRouteConstraintFactory = customRouteConstraintFactory;
            _routeDataMappingFactory = routeDataMappingFactory;
            _httpContext = httpContext;
        }

        public class HttpRouteCollectionContainer
        {
            public IList<IRouter> RouteCollection { get; set; }
            public long? LastUpdate { get; set; }
        }

        static System.Collections.Concurrent.ConcurrentDictionary<int, System.Threading.SemaphoreSlim> _sempDic = new System.Collections.Concurrent.ConcurrentDictionary<int, System.Threading.SemaphoreSlim>();

        HttpRouteCollectionContainer GetHttpRouteCollectionContainer(bool isCacheCallback)
        {
            var contextData =  _contextProvider.GetContextData();

            if (contextData.GeneralSettings == null) return null;

            var routes = contextData.GeneralSettings.CustomRoutes;
            var lastUpdate = contextData.GeneralSettings.AuditInfo.UpdateDate.GetValueOrDefault(DateTime.MaxValue).Ticks;
            if (routes == null) return null;

            if (contextData.RouteCollection == null)
            {
                var col = CreateRouteCollectionFromSettings(routes);
                contextData.RouteCollection = new HttpRouteCollectionContainer()
                {
                    RouteCollection = col,
                    LastUpdate = lastUpdate
                 };
            }
            return contextData.RouteCollection;
        }

        IList<IRouter> ICustomRouteCollectionRepository.GetRouteCollection( )
        {
            var col = GetHttpRouteCollectionContainer(false);
            return col?.RouteCollection;
        }

        IList<IRouter> CreateRouteCollectionFromSettings(CustomRouteSettings customSettings)
        {
            if (customSettings == null) return null;

            //clone as the object gets mutated
            customSettings = Newtonsoft.Json.Linq.JObject.FromObject(customSettings).ToObject<CustomRouteSettings>();
          
            FixCasing(customSettings);
            var constraints =
                customSettings.Validators
                .Select(kvp => new { kvp.Key, Constraint = _customRouteConstraintFactory.BuildConstraint(kvp.Key, kvp.Value) })
                .Where(x => x.Constraint != null)
                .ToDictionary(x => x.Key, x => x.Constraint, StringComparer.OrdinalIgnoreCase);

            var mappings =
                customSettings.Mappings
                .Select(kvp => new { kvp.Key, Mapping = _routeDataMappingFactory.BuildMapping(kvp.Key , kvp.Value) })
                .Where(x => x.Mapping != null)
                .ToDictionary(x => x.Key, x => x.Mapping, StringComparer.OrdinalIgnoreCase);
            
            AncestoryTokenExmpander.Process(customSettings.Routes);
            ImplicitConfigurationHandler.Process(constraints, mappings, _customRouteConstraintFactory, _routeDataMappingFactory , customSettings.Routes );
            QueryStringPreProcessor.Process(customSettings.Routes, constraints);

           constraints.Values
                .Concat(mappings.Values.Cast<ICanInit>())
                .Where(x => x != null)
                .Each(x => x.Initialize());

            var routes = customSettings.Routes.Select(x => CreateCustomRoute(x, constraints, mappings));

            var routeCollection = new List<IRouter>();
            foreach (var route in routes)
            {
                if (routeCollection.OfType<Route>().Any(r => r.Template == route.RouteTemplate))
                {
                    throw new ArgumentException("duplicate route [" + route.RouteTemplate + "]");
                }
                routeCollection.Add(route);
            }

            return routeCollection;
        }

        static Dictionary<string, string> CaseInsensitiveValidatorLookup;
        static Dictionary<string, string> CaseInsensitiveMappingLookup;

        private void FixCasing(CustomRouteSettings customSettings)
        {
            if (CaseInsensitiveValidatorLookup ==null)
            {
                CaseInsensitiveValidatorLookup = typeof(Validator.TypeConst).GetFields().ToDictionary(x => x.Name, y => y.Name, StringComparer.OrdinalIgnoreCase);
            }
            if (CaseInsensitiveMappingLookup == null)
            {
                CaseInsensitiveMappingLookup = typeof(Mapping.TypeConst).GetFields().ToDictionary(x => x.Name, y => y.Name, StringComparer.OrdinalIgnoreCase);
            }

            string tmp;
            customSettings.Mappings?.Each(x =>
            {
                var (_, value) = x;
                value.type = CaseInsensitiveMappingLookup.TryGetValue(value.type, out tmp) ? tmp : value.type;
            });
            customSettings.Validators?.Each(x =>
            {
                var (_, value) = x;
                value.type = CaseInsensitiveValidatorLookup.TryGetValue(value.type, out tmp) ? tmp : value.type;
            });

        }

        CustomRoute CreateCustomRoute(Route routeDef, IDictionary<string, ICustomRouteConstraint> validators, IDictionary<string, IRouteDataMapping> mappings)
        {
            var knownValidators =
                routeDef.Validators
                .Partition(kvp => validators.ContainsKey(kvp.Key ))
                .GetOrError(unknowns => new ArgumentException(
                    $"Some validators are not known: {string.Join(",", unknowns.Select(x => x.Key))}"))
                .ToDictionary( x => validators[x.Key],  x => x.Value);

            var knownMappings =
                routeDef.Mappings
                .Partition(kvp => mappings.ContainsKey(kvp.Key))
                .GetOrError(unknowns => new ArgumentException(
                    $"Some validators are not known: {string.Join(",", unknowns)}"))
                .ToDictionary(x => mappings[x.Key ], x => x.Value);

            knownMappings[RouteDataFixup.DefaultMapping] = new string[0];

            var defaults =
                routeDef.Defaults
                .ChainSet("controller", GetControllerName(routeDef.InternalRoute.ToEnum<FancyRoute>()))
                .ChainSet("action", GetControllerAction(routeDef.InternalRoute.ToEnum<FancyRoute>()));

            var template = routeDef.Template;
            string qString = null;
            var qpos = routeDef.Template.IndexOf('?');
            if ( qpos >-1)
            {
                template = routeDef.Template.Substring(0, qpos);
                qString = routeDef.Template.Substring(qpos + 1);
            }
            var scheme = routeDef.UrlScheme.IsNullOrEmpty() ? (CustomRoute.Scheme?)null : routeDef.UrlScheme.ToEnum<CustomRoute.Scheme>();

            var defaultRouter = _httpContext.Items["DefaultRouter"] as IRouter ?? new RouteHandler(ctx => ctx.Response.WriteAsync("no handler provided"));
            var constraintResolver = _httpContext.Items["ConstraintResolver"] as IInlineConstraintResolver ?? new DefaultInlineConstraintResolver(new OptionsWrapper<RouteOptions>(new RouteOptions()), _httpContext.RequestServices ?? new ServiceContainer());

            return new CustomRoute(defaultRouter,
                null,
                template, 
                qString, 
                routeDef.InternalRoute.ToEnum<FancyRoute>(), 
                routeDef.Canonical.GetValueOrDefault(false), 
                new RouteValueDictionary(defaults), 
                knownValidators, 
                knownMappings, 
                //routeDef.FunctionId, 
                scheme,
                constraintResolver);
        }

        private static class QueryStringPreProcessor
        {
            public static void Process(List<Route> routes, Dictionary<string, ICustomRouteConstraint> constraints)
            {
                foreach (var route in routes)
                {
                    if ( route?.Template == null )
                    {
                        continue;
                    }
                    var qpos = (route.Template ?? "").IndexOf('?');
                    if (qpos == -1)
                    {
                        continue;
                    }
                   
                    var qString = route.Template.Substring( qpos + 1);
                  
                    var qPairs = qString.Split(new [] { '&' }, StringSplitOptions.RemoveEmptyEntries);

                    foreach (var qPair in qPairs)
                    {
                        var parts = qPair.Split(new [] { '=' }, StringSplitOptions.RemoveEmptyEntries);
                        if (parts.Length != 2)
                        {
                            continue;
                        }
                        var key = parts[0];
                        var value = parts[1];
                        if (!constraints.TryGetValue(qPair, out _))
                        {
                            var  qsVal = new QueryStringConstraint.ValidatorSettings
                            {
                                type = QueryStringConstraint.TypeName ,
                                QsKey = key,
                                ValueKey = key,
                                IsLiteral = false
                            };
                            if (value.StartsWith("{") && value.EndsWith("}"))
                            {
                                qsVal.ValueKey = value.Substring(1, value.Length - 2);
                                qsVal.IsLiteral = false;
                            }
                            else if (value != "*")
                            {
                                qsVal.IsLiteral = true;
                                qsVal.Value = value;
                            }
                            constraints.Add(qPair, new QueryStringConstraint(qsVal));
                        }
                        route.Validators[qPair] = new [] { "*" };
                    }
                }
            }
        }

        private static class AncestoryTokenExmpander
        {
            static readonly Regex regex = new Regex(@"{(?<name>[^:^{^}]+):ancestors\((?<num>[0-9]+)\)}",
                RegexOptions.IgnoreCase |
                RegexOptions.ExplicitCapture |
                RegexOptions.Singleline |
                RegexOptions.IgnorePatternWhitespace);
            public static void Process (List<Route> routeDefs)
            {
                var i = 0;
                while (i < routeDefs.Count)
                {
                    var curIndex = i;
                    i++;
                    var route = routeDefs[curIndex];
                    var match = regex.Match(route.Template);

                    if (!match.Success)
                    {
                        continue;
                    }

                    if (!match.Success) continue;

                    routeDefs.Remove(route);
                    var name = match.Groups["name"].Value;

                    if (!int.TryParse(match.Groups["num"].Value, out var num)|| num > 10)
                    {
                        continue;
                    }
                    string path = null;
                    var token = new CategoryToken(name);
                    var initDepth = token.Depth;
                    for( var ancess = initDepth; ancess <= num; ancess++)
                    {
                        token.Depth = ancess;
                        var segment  = $"{{{token.Raw}}}";
                        if (path == null)
                        {
                            path = segment;
                        }
                        else
                        {
                            path = segment + "/" + path;
                        }

                        // token.to
                        var newRoute = new Route()
                        {
                            Canonical = route.Canonical,
                            Defaults = route.Defaults,
                            InternalRoute = route.InternalRoute,
                            Mappings = route.Mappings,
                            Template = route.Template.Replace(match.Value, path),
                            Validators = route.Validators,
                            UrlScheme = route.UrlScheme,
                            FunctionId = route.FunctionId
                        };
                        routeDefs.Insert(curIndex, newRoute);
                    }
                }
            }
        }


        public class ImplicitConfigurationHandler
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

            public static Dictionary<string,Validator> ConcatImplicitValidators(CustomRouteSettings routeSettings )
            {
                Dictionary<string, Validator> vals = new Dictionary<string, Validator>();

                if ( routeSettings?.Routes == null)
                {
                    return vals;
                }
                
                if (routeSettings.Validators != null)
                {
                    vals.AddRange(routeSettings.Validators);
                }
                foreach ( var routeDef in routeSettings.Routes)
                {
                    var matches = segmentsRe.Matches(routeDef.Template);

                    foreach (Match match in matches)
                    {
                        if (match.Success)
                        {
                            var facetSegments = match.Groups["facetSegment"].Captures;
                            var facets = match.Groups["facet"].Captures;
                            for (int i = 0; i < facetSegments.Count; i++)
                            {
                                var facetSegment = facetSegments[i].Value;
                                var facet = facets[i].Value;
                                var constaintName = (string)null;
                                if ( !vals.Any(
                                        x =>
                                        x.Value.type == Validator.TypeConst.attribute &&
                                        string.Equals(x.Value.attributeFQN, facet, StringComparison.OrdinalIgnoreCase)
                                        ))
                                {
                                    constaintName = "_" + facet;
                                    vals[constaintName] = new Validator()
                                    {
                                        attributeFQN = facet,
                                        type = Validator.TypeConst.attribute
                                    };
                               }
                                    
                                   
                            }
                        }
                    }
                }
                return vals;
            }

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
                        if (!_validators.ContainsKey(constaintName))
                        {
                            var constraint =
                                _customRouteConstraintFactory.BuildConstraint(constaintName, new Validator()
                                {
                                    type = ConstraintFactory.SearchFacetConstraintType,
                                    attributeFQN = facet
                                });
                            _validators[constaintName] = constraint;
                        }
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
                        if (!_mappings.ContainsKey(mappingName))
                        {
                            var mapping =
                                _routeDataMappingFactory.BuildMapping(null, new Mapping()
                                {
                                    type = Mapping.TypeConst.facet,
                                    facetId = facet,
                                    mapTo = "facetValueFilter"
                                });
                            _mappings[mappingName] = mapping;
                        }
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

            public static void Process(Dictionary<string, ICustomRouteConstraint> constraints, Dictionary<string, IRouteDataMapping> mappings, ICustomRouteConstraintFactory customRouteConstraintFactory, IRouteDataMappingFactory routeDataMappingFactory, List<Route> routeDefs)
            {
                var implictHanlder = new ImplicitConfigurationHandler(constraints, mappings, customRouteConstraintFactory, routeDataMappingFactory);

                routeDefs.ForEach(x => implictHanlder.ConfigureRoute(x));
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
