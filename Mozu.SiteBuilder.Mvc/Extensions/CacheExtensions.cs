using System;
using System.Runtime.Caching;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.Mvc.Extensions
{
    public static class CacheExtensions
    {
        static async Task<T> AddOrGetFromCache<T, TExp>(Func<object> getter, Func<Task<T>> valueMaker, Func<T, TExp> expirationGenner, Func<T, TExp, object> addOrGetter)
        {
            var got = getter();
            if (got != null) return (T)got;
            var v = await valueMaker().ConfigureAwait(false);
            var exp = expirationGenner(v);
            var addResult = addOrGetter(v, exp);
            if (addResult == null) return v;
            else return (T)addResult;
        }

        /// <summary>
        /// Adds an item to the cache at a given key. if the Func for the item returns null, default(T) is added to the cache for 2 minutes.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="cache"></param>
        /// <param name="key"></param>
        /// <param name="value"></param>
        /// <param name="expiration"></param>
        /// <param name="regionName"></param>
        /// <returns></returns>
        public static T AddOrGetExisting<T>(this ObjectCache cache, string key, Func<T> value, DateTimeOffset expiration, string regionName = null)
        {
            return AddOrGetFromCache(
                () => cache.Get(key, regionName), 
                () => Task.FromResult(value()), 
                v => v == null ? DateTimeOffset.UtcNow.AddMinutes(2) : expiration, 
                (v, exp) => cache.AddOrGetExisting(key, v, exp, regionName)).Result;
        }

        /// <summary>
        /// Adds an item to the cache at a given key. if the Func for the item returns null, default(T) is added to the cache for 2 minutes.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="cache"></param>
        /// <param name="key"></param>
        /// <param name="value"></param>
        /// <param name="expiration"></param>
        /// <param name="regionName"></param>
        /// <returns></returns>
        public static T AddOrGetExisting<T>(this ObjectCache cache, string key, Func<T> value, CacheItemPolicy policy, string regionName = null)
        {
            return AddOrGetFromCache(
                () => cache.Get(key, regionName),
                () => Task.FromResult(value()),
                v => v == null ? new CacheItemPolicy { AbsoluteExpiration = DateTimeOffset.UtcNow.AddMinutes(2) } : policy,
                (v, exp) => cache.AddOrGetExisting(key, v, exp, regionName)).Result;
        }

        /// <summary>
        /// Adds an item to the cache at a given key. if the Func for the item returns null, default(T) is added to the cache for 2 minutes.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="cache"></param>
        /// <param name="key"></param>
        /// <param name="value"></param>
        /// <param name="expiration"></param>
        /// <param name="regionName"></param>
        /// <returns></returns>
        public static async Task<T> AddOrGetExisting<T>(this ObjectCache cache, string key, Func<Task<T>> value, DateTimeOffset expiration, string regionName = null)
        {
            return await AddOrGetFromCache(
                () => cache.Get(key, regionName),
                value,
                v => v == null ? DateTimeOffset.UtcNow.AddMinutes(2) : expiration,
                (v, exp) => cache.AddOrGetExisting(key, v, exp, regionName)).ConfigureAwait(false);
        }

        /// <summary>
        /// Adds an item to the cache at a given key. if the Func for the item returns null, default(T) is added to the cache for 2 minutes.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="cache"></param>
        /// <param name="key"></param>
        /// <param name="value"></param>
        /// <param name="expiration"></param>
        /// <param name="regionName"></param>
        /// <returns></returns>
        public static async Task<T> AddOrGetExisting<T>(this ObjectCache cache, string key, Func<Task<T>> value, CacheItemPolicy policy, string regionName = null)
        {
            return await AddOrGetFromCache(
                            () => cache.Get(key, regionName),
                            value,
                            v => v == null ? new CacheItemPolicy { AbsoluteExpiration = DateTimeOffset.UtcNow.AddMinutes(2) } : policy,
                            (v, exp) => cache.AddOrGetExisting(key, v, exp, regionName)).ConfigureAwait(false);
        }
    }
}
