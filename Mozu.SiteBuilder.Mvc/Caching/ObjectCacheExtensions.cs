using System;

namespace Mozu.SiteBuilder.Mvc.Caching
{
    internal static class ObjectCacheExtensions
    {
        public static string GetSiteCacheKey(this System.Runtime.Caching.ObjectCache cache, int siteId)
        {
            return "site:" + siteId;
        }

        public static string GetSiteCacheKey(this System.Runtime.Caching.ObjectCache cache, int siteId, string key)
        {
            return String.Format("site:{0}-{1}", siteId, key);
        }

        public static string GetCatalogCacheKey(this System.Runtime.Caching.ObjectCache cache, int tenantId, int catalogId)
        {
            return String.Format("tenant:{0}-catalog:{1}", tenantId, catalogId);
        }

        public static string GetCatalogCacheKey(this System.Runtime.Caching.ObjectCache cache, int tenantId, int catalogId, string key)
        {
            return String.Format("tenant:{0}-catalog:{1}-{2}", tenantId, catalogId, key);
        }

        public static string GetTenantCacheKey(this System.Runtime.Caching.ObjectCache cache, int siteId)
        {
            return "tenant:" + siteId;
        }

        public static string GetTenantCacheKey(this System.Runtime.Caching.ObjectCache cache, int siteId, string key)
        {
            return String.Format("tenant:{0}-{1}", siteId, key);
        }
    }
}