using System.Collections.Generic;
using System.Linq;
using Mozu.Core.Extensions;
using System.Web;
using System;

namespace Mozu.SiteBuilder.Mvc.Extensions
{
    public static class DictionaryExtensions
    {
        /// <summary>
        /// creates a query string from a dictionary of string, string.  This query string is NOT prepended with '?'. This is so you can set a System.Web.Uri's Query property with this and not get duplicate '?' characters.
        /// </summary>
        /// <param name="values"></param>
        /// <returns></returns>
        public static string ToQueryString(this Dictionary<string, string> values)
        {
            var strings =
                values
                .Where(x => !x.Value.IsNullOrEmpty())
                .Select((x, i) => string.Format("{0}{1}={2}", i == 0 ? string.Empty : "&", x.Key, HttpUtility.UrlEncode(x.Value)));
            return string.Join(string.Empty, strings);
        }

        public static IDictionary<TKey,TValue> ChainSet<TKey,TValue>(this IDictionary<TKey,TValue> dict, TKey key, TValue value, bool overWrite=true)
        {
            if (!overWrite && dict.ContainsKey(key))
            {
                return dict;
            } 
            dict[key] = value;
            
            return dict;
        }

        public static IDictionary<TKey, TValue> ChainSet<TKey, TValue>(this IDictionary<TKey, TValue> dict, KeyValuePair<TKey,TValue> pair)
        {
            dict[pair.Key ] = pair.Value;
            
            return dict;
        }
        public static IDictionary<TKey, TValue> ChainSet<TKey, TValue>(this IDictionary<TKey, TValue> dict, Tuple<TKey, TValue> pair)
        {
            dict[pair.Item1] = pair.Item2;
            return dict;
        }

        public static IDictionary<TKey, TValue> ChainSet<TKey, TValue>(this IDictionary<TKey, TValue> dict, IDictionary<TKey, TValue> pairs)
        {
            if (Object.ReferenceEquals(dict , pairs))
            {
                //wtf chet?
                return dict;
            }

            foreach (var pair in pairs)
            {
                dict[pair.Key] = pair.Value;
            }
            return dict;
        }

        public static IDictionary<TKey, TValue> ChainSet<TKey, TValue>(this IDictionary<TKey, TValue> dict, TKey key, TValue value)
        {
            dict[key] = value;
            return dict;
        }


        /// <summary>
        /// given a map from key1=>key2 and a base dictionary, this adds an entry of (key2, source[key1]) for all key1 that exist in source
        /// </summary>
        /// <typeparam name="TKey"></typeparam>
        /// <typeparam name="TValue"></typeparam>
        /// <param name="source"></param>
        /// <param name="maps"></param>
        /// <returns></returns>
        public static IDictionary<TKey, TValue> ApplyMapping<TKey, TValue>(this IEnumerable<KeyValuePair<TKey, TKey>> maps, IDictionary<TKey, TValue> source)
        {
            return maps.Aggregate(source, (dict, kvp) =>
            {
                if (dict.ContainsKey(kvp.Key))
                {
                    dict[kvp.Value] = dict[kvp.Key];
                }
                return dict;
            });
        }
    }
}
