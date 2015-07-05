using System.Collections.Generic;
using System.Web.Http.Routing;

namespace Mozu.SiteBuilder.Mvc.Extensions
{
    public static class HttpRouteValueDictionaryExtensions
    {
        public static HttpRouteValueDictionary ToRouteDictionary<TValue>(this IDictionary<string, TValue> dict)
        {
            var rvd = new HttpRouteValueDictionary();
            foreach (var pair in dict) {
                rvd[pair.Key] = pair.Value;
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
}
