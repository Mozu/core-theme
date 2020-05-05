using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Routing.Template;
using Mozu.SiteBuilder.Mvc.SEO;

namespace Mozu.SiteBuilder.Mvc.Extensions
{
    
    public static class EnumerableExtension
    {
        public struct PartitionResult<T>
        {
            private IEnumerable<T> t;
            private IEnumerable<T> f;

            public PartitionResult(IEnumerable<T> Tr, IEnumerable<T> Fa)
            {
                t = Tr;
                f = Fa;
            }
            public IEnumerable<T> True { get { return t; } }
            public IEnumerable<T> False
            {
                get { return f; }
            }
        }

        /// <summary>
        /// splits an enumerable into a true and false enumerable
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="source"></param>
        /// <param name="predicate"></param>
        /// <returns></returns>
        public static PartitionResult<T> Partition<T>(this IEnumerable<T> source, Func<T, bool> predicate)
        {
            var d = source.GroupBy(i => predicate(i)).ToDictionary(x => x.Key, x => x);

            return new PartitionResult<T>(d.ContainsKey(true) ? d[true] : Enumerable.Empty<T>(), d.ContainsKey(false) ? d[false] : Enumerable.Empty<T>());
        }

        public static IEnumerable<T> GetOrError<T>(this PartitionResult<T> partition, Func<IEnumerable<T>, Exception> errorFunc)
        {
            if (partition.False.Any()) throw errorFunc(partition.False);
            return partition.True;
        }

        public static Dictionary<TKey, TElement> ToDictionar2y<TSource, TKey, TElement>(this IEnumerable<TSource> source, Func<TSource, TKey> keySelector, Func<TSource, TElement> elementSelector, IEqualityComparer<TKey> comparer)
        {
           if ( source == null )
            {
                return null;
            }
            Dictionary<TKey, TElement> dictionary = new Dictionary<TKey, TElement>(comparer);
            foreach (TSource source1 in source)
            {
                var key = keySelector(source1);
                var val = elementSelector(source1);
                if ( dictionary.ContainsKey( key))
                {
                    System.Diagnostics.Debug.WriteLine(key);
                    continue;
                }
                dictionary.Add(key, val);
            }
                
            return dictionary;
        }

        /// <summary>
        /// Splits or chunks a list out into several smaller list limited to a cirtain size
        /// </summary>
        /// <typeparam name="T">The generic type the list contains</typeparam>
        /// <param name="source">the list of items to chunk out into smaller list</param>
        /// <param name="size">the size limit of the smaller lists</param>
        /// <returns>A IEnumerable containing the smaller lists</returns>
        public static IEnumerable<IEnumerable<T>> Chunk<T>(this IEnumerable<T> source, int size) =>
            source is T[] array
                ? array.Chunk(size)
                : source.ToArray().Chunk(size);
        
        static IEnumerable<IEnumerable<T>> Chunk<T>(this T[] source, int size)
        {
            var chunks = new List<IEnumerable<T>>();
            T[] buffer;
            for (int i = 0; i < source.Length; i += size)
            {
                var iterationSize = source.Length - i > size ? size : source.Length - i;
                buffer = new T[iterationSize];
                Array.Copy(source.ToArray(), i, buffer, 0, iterationSize);
                chunks.Add(buffer);
            }
            return chunks;
        }

        public static bool TryMatchRoute(this IList<IRouter> routes, HttpContext context, out RouteData routeData)
        {
            var ret = false;

            routeData = null;
            foreach (var r in routes.OfType<Route>())
            {
                var template = r.ParsedTemplate;

                var matcher = new TemplateMatcher(template, GetDefaults(template));

                var innerVals = new RouteValueDictionary(r.Defaults);

                if (!matcher.TryMatch(context.Request.Path.Value, innerVals)) continue;

                if (r.Constraints.Count > 0 &&
                    !(from key in innerVals.Keys
                            let constraints = r.Constraints.Where(c =>
                                c.Key.Equals(key, StringComparison.CurrentCultureIgnoreCase)).Select(c => c.Value)
                            select constraints.All(c =>
                                c.Match(context, r, key, context.Request.RouteValues, RouteDirection.IncomingRequest)))
                        .Any(constraintsPass => constraintsPass)) continue;

                routeData = new RouteData(innerVals);
                routeData.Routers.Add(r);

                ret = true;
                break;
            }

            return ret;
        }
        public static bool TryMatchRoute(this RouteCollection routes, HttpContext context, out RouteData routeData)
        {
            var ret = false;

            routeData = null;
            //foreach (var r in routes.OfType<Route>())
            for ( var i =0; i < routes.Count;i++)
            {
                var r = routes[i] as Route; 
                if ( r == null)
                {
                    continue;
                }
                var template = r.ParsedTemplate;

                var matcher = new TemplateMatcher(template, GetDefaults(template));

                var innerVals = new RouteValueDictionary(r.Defaults);

                if (!matcher.TryMatch(context.Request.Path.Value, innerVals)) continue;

                if (r.Constraints.Count > 0 &&
                    !(from key in innerVals.Keys
                      let constraints = r.Constraints.Where(c =>
                          c.Key.Equals(key, StringComparison.CurrentCultureIgnoreCase)).Select(c => c.Value)
                      select constraints.All(c =>
                          c.Match(context, r, key, context.Request.RouteValues, RouteDirection.IncomingRequest)))
                        .Any(constraintsPass => constraintsPass)) continue;

                routeData = new RouteData(innerVals);
                routeData.Routers.Add(r);

                ret = true;
                break;
            }

            return ret;
        }

        private static RouteValueDictionary GetDefaults(RouteTemplate parsedTemplate)
        {
            var result = new RouteValueDictionary();

            foreach (var parameter in parsedTemplate.Parameters)
            {
                if (parameter.DefaultValue != null)
                {
                    result.Add(parameter.Name, parameter.DefaultValue);
                }
            }

            return result;
        }
    }
}
