using System;
using System.Runtime.Caching;

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
        private readonly ObjectCache _cache;
        private static readonly CacheItemPolicy FiveMinutePolicy = new CacheItemPolicy { SlidingExpiration = new TimeSpan(0, 5, 0) };

        public StorefrontCacheControlImpl(ObjectCache cache)
        {
            _cache = cache;
        }

        public void InvalidateTenant(int tenantId)
        {
            // expire after 5 minutes of no access.
            var policy = FiveMinutePolicy;

            _cache.Set(_cache.GetTenantCacheKey(tenantId), Guid.NewGuid(), policy);
        }

        public void InvalidateCatalog(int tenantId, int catalogId)
        {
            // expire after 5 minutes of no access.
            var policy = FiveMinutePolicy;

            _cache.Set("tenant:" + tenantId + "catalog:" + catalogId, Guid.NewGuid(), policy);
        }

        public void InvalidateSite(int siteId)
        {
            // expire after 5 minutes of no access.
            var policy = FiveMinutePolicy;

            _cache.Set(_cache.GetSiteCacheKey(siteId), Guid.NewGuid(), policy);
        }
    }
}
