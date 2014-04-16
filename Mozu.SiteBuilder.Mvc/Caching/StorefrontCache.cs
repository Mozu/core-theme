using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using Mozu.SiteBuilder.Mvc;

namespace Mozu.SiteBuilder.Mvc.Caching
{
    public interface IStorefrontCache
    {
        T Get<T>(string key, CacheScope scope = CacheScope.Site);
        void Set(string key, object value, CacheScope scope = CacheScope.Site);
    }

    internal sealed class StorefrontCache : IStorefrontCache
    {
        private ISiteBuilderApiContext _ctx;
        private System.Runtime.Caching.ObjectCache _cache;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public StorefrontCache(ISiteBuilderApiContext ctx, System.Runtime.Caching.ObjectCache cache)
        {
            _ctx = ctx;
            _cache = cache;
        }

        /// <summary>
        /// Get an entry from the cache.
        /// </summary>
        public object Get(string key, CacheScope scope)
        {
            if (String.IsNullOrWhiteSpace(key))
                return null;

            if (_ctx == null || _ctx.TenantId == 0)
                return null;
            else if (scope >= CacheScope.Catalog && !_ctx.CatalogId.HasValue)
                return null;
            else if (scope >= CacheScope.Site && !_ctx.SiteId.HasValue)
                return null;


            switch (scope)
            {
                case CacheScope.Catalog:
                    return _cache.Get(_cache.GetCatalogCacheKey(_ctx.TenantId, _ctx.CatalogId.Value, key));
                case CacheScope.Site:
                    return _cache.Get(_cache.GetSiteCacheKey(_ctx.SiteId.Value, key));
                default:
                    return _cache.Get(_cache.GetTenantCacheKey(_ctx.TenantId, key));
            }
        }

        public T Get<T>(string key, CacheScope scope)
        {
            object value = Get(key, scope);
            return (value != null && value is T) ? (T)value : default(T);
        }

        public void Set(string key, object value, CacheScope scope = CacheScope.Site)
        {
            if (String.IsNullOrWhiteSpace(key))
                return;


            if (_ctx == null || _ctx.TenantId == 0)
                throw new ArgumentOutOfRangeException("scope", "Cannot add item to cache: no api context.");
            else if (scope >= CacheScope.Catalog && !_ctx.CatalogId.HasValue)
                throw new ArgumentOutOfRangeException("scope", "Cannot add item to cache: Api context lacks CatalogId. Requested cache scope: " + scope);
            else if (scope >= CacheScope.Site && !_ctx.SiteId.HasValue)
                throw new ArgumentOutOfRangeException("scope", "Cannot add item to cache: Api context lacks SiteId. Requested cache scope: " + scope);

            string cacheKey;
            string[] dependencies;
            switch (scope)
            {
                case CacheScope.Catalog:
                    cacheKey = _cache.GetCatalogCacheKey(_ctx.TenantId, _ctx.CatalogId.Value, key);
                    dependencies = new string[] { 
                        _cache.GetTenantCacheKey(_ctx.TenantId),
                        _cache.GetCatalogCacheKey(_ctx.TenantId, _ctx.CatalogId.Value) 
                    };
                    break;
                case CacheScope.Site:
                    cacheKey = _cache.GetSiteCacheKey(_ctx.SiteId.Value, key);
                    dependencies = new string[] { 
                        _cache.GetTenantCacheKey(_ctx.TenantId),
                        _cache.GetCatalogCacheKey(_ctx.TenantId, _ctx.CatalogId.Value),
                        _cache.GetSiteCacheKey(_ctx.SiteId.Value)
                    };
                    break;
                default:
                    cacheKey = _cache.GetTenantCacheKey(_ctx.TenantId, key);
                    dependencies = new string[] { 
                        _cache.GetTenantCacheKey(_ctx.TenantId)
                    };
                    break;
            }

            // ensure that all the dependencies have an entry in cache. we will have a really bad experience if they're not.
            foreach (string dep in dependencies)
            {
                // dependencies have a 5 minute _sliding_ expiration.
                _cache.AddOrGetExisting(dep, Guid.NewGuid(), new System.Runtime.Caching.CacheItemPolicy { SlidingExpiration = new TimeSpan(0, 5, 0) });            
            }

            var itemPolicy = new System.Runtime.Caching.CacheItemPolicy {
                // items have a 5 minute absolute expiration.
                AbsoluteExpiration = DateTimeOffset.UtcNow.AddMinutes(5)
            };
            itemPolicy.ChangeMonitors.Add( _cache.CreateCacheEntryChangeMonitor(dependencies) );

            _cache.Set(cacheKey, value, itemPolicy);
        }
    }
}