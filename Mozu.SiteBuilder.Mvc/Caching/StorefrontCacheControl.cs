using System;

namespace Mozu.SiteBuilder.Mvc.Caching
{
    public interface IStorefrontCacheControl
    {
        void InvalidateTenant(int tenantId);
        void InvalidateCatalog(int tenantId, int catalogId);
        void InvalidateSite(int siteId);
    }

    public  class StorefrontCacheControlImpl : IStorefrontCacheControl
    {
        private System.Runtime.Caching.ObjectCache _cache;

        public StorefrontCacheControlImpl(System.Runtime.Caching.ObjectCache cache)
        {
            _cache = cache;
        }

        public void InvalidateTenant(int tenantId)
        {
            // expire after 5 minutes of no access.
            var policy = new System.Runtime.Caching.CacheItemPolicy { SlidingExpiration = new TimeSpan(0, 5, 0) };

            _cache.Set(_cache.GetTenantCacheKey(tenantId), Guid.NewGuid(), policy);
        }

        public void InvalidateCatalog(int tenantId, int catalogId)
        {
            // expire after 5 minutes of no access.
            var policy = new System.Runtime.Caching.CacheItemPolicy { SlidingExpiration = new TimeSpan(0, 5, 0) };

            _cache.Set("tenant:" + tenantId + "catalog:" + catalogId, Guid.NewGuid(), policy);
        }

        public void InvalidateSite(int siteId)
        {
            // expire after 5 minutes of no access.
            var policy = new System.Runtime.Caching.CacheItemPolicy { SlidingExpiration = new TimeSpan(0, 5, 0) };

            _cache.Set(_cache.GetSiteCacheKey(siteId), Guid.NewGuid(), policy);
        }
    }
}
