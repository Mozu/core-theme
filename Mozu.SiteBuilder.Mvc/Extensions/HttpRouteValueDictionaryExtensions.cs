using System.Collections.Generic;
using System.Web.Http.Routing;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.Mvc.SEO.Mappings;
using Mozu.SiteSettings.General.Contracts.General.Routing;

namespace Mozu.SiteBuilder.Mvc.Extensions
{
    public static class HttpRouteValueDictionaryExtensions
    {
        public static HttpRouteValueDictionary ToRouteDictionary<TValue>(this IDictionary<string, TValue> dict)
        {
            var rvd = new HttpRouteValueDictionary(dict.Count);
            foreach (var pair in dict) {
                {
                    rvd[pair.Key] = pair.Value is long ? (object)System.Convert.ToInt32(pair.Value) : pair.Value;
                }
               
            }
            return rvd;
        }
        //public static HttpRouteValueDictionary ToRouteDictionary<TValue>(this IDictionary<string, TValue> dict)
        //{
        //    var rvd = new HttpRouteValueDictionary();
        //    foreach (var pair in dict)
        //    {
        //        rvd[pair.Key] = pair.Value;
        //    }
        //    return rvd;
        //}
    }
    public static class RouteExtensions
    {
        public static IHttpRoute MapCustomHttpRoute(this System.Web.Http.HttpRouteCollection routes, string name, string routeTemplate, object defaults, IDictionary<ICustomRouteConstraint, string[]> constraints, IDictionary<IRouteDataMapping, string[]> mappings, FancyRoute fancyRoute, bool isCanonical, CustomRoute.Scheme? scheme = null)
        {
            if (mappings == null)
            {
                mappings = new Dictionary<IRouteDataMapping, string[]>();
            }

            mappings.Add(new RouteDataFixup(), new string[0]);

            HttpRouteValueDictionary defaultsDictionary = new HttpRouteValueDictionary(defaults);
            defaultsDictionary
               .ChainSet("controller", CustomRouteRepository.GetControllerName(fancyRoute))
               .ChainSet("action", CustomRouteRepository.GetControllerAction(fancyRoute));

            var route = new CustomRoute(routeTemplate, null, fancyRoute, isCanonical, defaultsDictionary, constraints, mappings, null, scheme);
            routes.Add(name, route);
            return route;
        }
    }
}
