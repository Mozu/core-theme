using Microsoft.AspNetCore.Routing;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.Mvc.SEO.Mappings;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using System.Collections.Generic;
using IInlineConstraintResolver = Microsoft.AspNetCore.Routing.IInlineConstraintResolver;
using Route = Microsoft.AspNetCore.Routing.Route;

namespace Mozu.SiteBuilder.Mvc.Extensions
{
    //public static class HttpRouteValueDictionaryExtensions
    //{
    //    public static HttpRouteValueDictionary ToRouteDictionary<TValue>(this IDictionary<string, TValue> dict)
    //    {
    //        var rvd = new HttpRouteValueDictionary(dict.Count);
    //        foreach (var pair in dict) {
    //            {
    //                rvd[pair.Key] = pair.Value is long ? (object)System.Convert.ToInt32(pair.Value) : pair.Value;
    //            }

    //        }
    //        return rvd;
    //    }
    //    //public static HttpRouteValueDictionary ToRouteDictionary<TValue>(this IDictionary<string, TValue> dict)
    //    //{
    //    //    var rvd = new HttpRouteValueDictionary();
    //    //    foreach (var pair in dict)
    //    //    {
    //    //        rvd[pair.Key] = pair.Value;
    //    //    }
    //    //    return rvd;
    //    //}
    //}
    public static class RouteExtensions
    {
        public static IList<IRouter> MapRoute(this IList<IRouter> routes, IRouter handler, string name,
            string routeTemplate, object defaults, IInlineConstraintResolver resolver)
        {
            var defaultsDictionary = new RouteValueDictionary(defaults);
            var route = new Route(handler, name, routeTemplate, defaultsDictionary, null, null, resolver);
            routes.Add(route);

            return routes;
        }
        public static IList<IRouter> MapRoute(this IList<IRouter> routes, IRouter handler, string name,
            string routeTemplate, object defaults, IDictionary<string, object> constraints, IInlineConstraintResolver resolver)
        {
            var defaultsDictionary = new RouteValueDictionary(defaults);
            var route = new Route(handler, name, routeTemplate, defaultsDictionary, constraints, null, resolver);
            routes.Add(route);

            return routes;
        }

        public static IList<IRouter> MapCustomRoute(this IList<IRouter> routes, IRouter handler, string name, string routeTemplate, object defaults, IDictionary<ICustomRouteConstraint, string[]> constraints, IDictionary<IRouteDataMapping, string[]> mappings, FancyRoute fancyRoute, bool isCanonical, IInlineConstraintResolver resolver, CustomRoute.Scheme? scheme = null)
        {
            if (mappings == null)
            {
                mappings = new Dictionary<IRouteDataMapping, string[]>();
            }

            mappings.Add(new RouteDataFixup(), new string[0]);

            var defaultsDictionary = new RouteValueDictionary(defaults);
            defaultsDictionary
                .ChainSet("controller", CustomRouteRepository.GetControllerName(fancyRoute))
                .ChainSet("action", CustomRouteRepository.GetControllerAction(fancyRoute));

            var route = new CustomRoute(handler, 
                name, 
                routeTemplate, 
                null, 
                fancyRoute, 
                isCanonical, 
                defaultsDictionary, 
                constraints, 
                mappings, 
                null,
                scheme, 
                resolver);

            routes.Add(route);

            return routes;
        }
    }
}
