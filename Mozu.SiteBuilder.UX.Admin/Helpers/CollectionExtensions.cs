using System;
using System.Collections.Generic;
using System.Linq;

namespace Mozu.SiteBuilder.UX.Admin.Helpers
{
    public static class CollectionExtensions
    {
        //todo: Replace with MoreLinq nuget - Greg Murray on 2014-04-22 
        /// <summary>
        /// From http://stackoverflow.com/questions/489258/linq-distinct-on-a-particular-property?rq=1
        /// </summary>
        /// <typeparam name="TSource"></typeparam>
        /// <typeparam name="TKey"></typeparam>
        /// <param name="source"></param>
        /// <param name="keySelector"></param>
        /// <returns></returns>
        public static IEnumerable<TSource> DistinctBy<TSource, TKey>(this IEnumerable<TSource> source, Func<TSource, TKey> keySelector)
        {
            var seenKeys = new HashSet<TKey>();
            foreach (TSource element in source)
            {
                if (seenKeys.Add(keySelector(element)))
                {
                    yield return element;
                }
            }
        }
    }
}