using Mozu.SiteBuilder.Mvc.Caching;
using System;
using System.Runtime.Caching;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.Mvc.Extensions
{
    public static class CacheExtensions
    {
      
        /// <summary>
        /// does stuff
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="cache"></param>
        /// <param name="key"></param>
        /// <param name="scope"></param>
        /// <param name="cacheType"></param>
        /// <param name="value"></param>
        /// <returns></returns>
        public static async Task<T> AddOrGetExisting<T>(this IStorefrontCache cache, string key, CacheScope scope, StorefrontCacheTypes cacheType , Func<T,Task<T>> value )
        {

            //string key, object value, CacheScope scope = CacheScope.Site, StorefrontCacheTypes cacheType = StorefrontCacheTypes.Default, Func<object, object> updateCallback  
            var ret = cache.Get<T>(key, scope, cacheType);
            if ( ret != null)
            {
                return ret;
            }
            ret = await value(ret).ConfigureAwait(false);
            
            cache.Set(key, ret, scope, cacheType);
            return ret;
        }

        public static async Task<T> AddOrGetExisting<T>(this IStorefrontCache cache, string key, CacheScope scope, StorefrontCacheTypes cacheType, Func<Task<T>> value)
        {

            //string key, object value, CacheScope scope = CacheScope.Site, StorefrontCacheTypes cacheType = StorefrontCacheTypes.Default, Func<object, object> updateCallback  
            var ret = cache.Get<T>(key, scope, cacheType);
            if (ret != null)
            {
                return ret;
            }
            ret = await value().ConfigureAwait(false);
     
            cache.Set(key, ret, scope, cacheType);
            return ret;
        }


    }
}
