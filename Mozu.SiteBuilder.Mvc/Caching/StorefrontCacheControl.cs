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
            _cache.Set(_cache.GetTenantCacheKey(tenantId), Guid.NewGuid(), FiveMinutePolicy);
        }

        public void InvalidateCatalog(int tenantId, int catalogId)
        {
            _cache.Set("tenant:" + tenantId + "catalog:" + catalogId, Guid.NewGuid(), FiveMinutePolicy);
        }

        public void InvalidateSite(int siteId)
        {
            _cache.Set(_cache.GetSiteCacheKey(siteId), Guid.NewGuid(), FiveMinutePolicy);
        }
    }
}
