using System;
using System.Collections.Generic;
using System.Runtime.Caching;
using FSharpx.Collections;
using Mozu.Core.Api.Client.Caching;
using System.Linq;
namespace Mozu.SiteBuilder.Mvc.Caching
{
    public interface IStorefrontCacheControl
    {
        void InvalidateTenant(int tenantId , StoreFrontCacheDependencies cacheDepType, Mozu.Core.DataViewModeType dataModeType);
        void InvalidateCatalog(int tenantId, int catalogId, StoreFrontCacheDependencies cacheDepType , Mozu.Core.DataViewModeType dataModeType);
        void InvalidateSite(int siteId, StoreFrontCacheDependencies cacheDepType, Mozu.Core.DataViewModeType dataModeType);

        ClientCacheContainer GetCache(StorefrontCacheTypes cacheType, Mozu.Core.DataViewModeType dataModeType);
    }
    [Flags]
    public enum StoreFrontCacheDependencies
    {
        Catalog=1,
        None =2

    };



    [Flags]
    public enum StorefrontCacheTypes
    {
        Default = 1,
        PartialOutput = 2,
        ProductSearch =4,
        All = 7
    };


    public static class CacheKeyHelper
    {
        public static string GetSiteCacheKey( int siteId)
        {
            return "site:" + siteId;
        }

        public static string GetSiteCacheKey( int siteId, string key)
        {
            return String.Format("site:{0}-{1}", siteId, key);
        }

        public static string GetCatalogCacheKey( int tenantId, int catalogId)
        {
            return String.Format("tenant:{0}-catalog:{1}", tenantId, catalogId);
        }

        public static string GetCatalogCacheKey(int tenantId, int catalogId, string key)
        {
            return String.Format("tenant:{0}-catalog:{1}-{2}", tenantId, catalogId, key);
        }

        public static string GetTenantCacheKey(int tenant)
        {
            return "tenant:" + tenant;
        }

        public static string GetTenantCacheKey( int siteId, string key)
        {
            return String.Format("tenant:{0}-{1}", siteId, key);
        }
    }

    class StorefrontCacheControlImpl : IStorefrontCacheControl
    {
        private readonly IClientCacheProvider _cacheProvidere;
       

        int _stagingKeyOffset = 2 ^ 29;
        Dictionary<int, ClientCacheContainer> _caches = new Dictionary<int, ClientCacheContainer>();
        Dictionary<StoreFrontCacheDependencies, List<StorefrontCacheTypes>> _cacheDeps = new Dictionary<StoreFrontCacheDependencies, List<StorefrontCacheTypes>>();
        public StorefrontCacheControlImpl(IClientCacheProvider cacheProvidere)
        {
            _cacheProvidere = cacheProvidere;
            AddClientCacheContainer(StorefrontCacheTypes.Default, StoreFrontCacheDependencies.Catalog);
            AddClientCacheContainer(StorefrontCacheTypes.PartialOutput, StoreFrontCacheDependencies.Catalog);
            AddClientCacheContainer(StorefrontCacheTypes.ProductSearch, StoreFrontCacheDependencies.Catalog);
          

        }
        void AddClientCacheContainer(StorefrontCacheTypes cacheType, StoreFrontCacheDependencies dep)
        {
            var liveKey = (int)cacheType;
            var stagingKey = (int)cacheType + _stagingKeyOffset;
            var liveConfigKey = "sitebuilder." + cacheType.ToString();
            var stangincConfigKey = "sitebuilder." + cacheType.ToString() + ".staging";
            var liveCache = _cacheProvidere.GetCache(liveConfigKey);
            var stageCache = _cacheProvidere.GetCache(stangincConfigKey);

           
            _caches[liveKey] = liveCache;
            _caches[stagingKey] = stageCache;
            List<StorefrontCacheTypes> deps;
            if ( !_cacheDeps.TryGetValue( dep, out deps))
            {
                deps = new List<StorefrontCacheTypes>();
                _cacheDeps[dep] = deps;
            }
            deps.Add(cacheType);
        }

        IEnumerable<ObjectCache> GetCaches(StoreFrontCacheDependencies dep, Mozu.Core.DataViewModeType dataModeType)
        {

            if (dataModeType == Core.DataViewModeType.Live)
            {
                return _cacheDeps[dep].Select(cacheType => _caches[(int)cacheType].Cache);
            }
            else if (dataModeType == Core.DataViewModeType.Pending)
            {

                return _cacheDeps[dep].Select(cacheType => _caches[(int)cacheType + _stagingKeyOffset].Cache);
            }

          
            return _cacheDeps[dep].Select(cacheType => _caches[(int)cacheType + _stagingKeyOffset].Cache).Union(_cacheDeps[dep].Select(cacheType => _caches[(int)cacheType ].Cache));



        }

        public void InvalidateTenant(int tenantId, StoreFrontCacheDependencies cacheType, Mozu.Core.DataViewModeType dataModeType)
        {
            var key = CacheKeyHelper.GetTenantCacheKey(tenantId);
            foreach( var cache in this.GetCaches(cacheType, dataModeType))
            {
                cache.Set(key, true, ObjectCache.InfiniteAbsoluteExpiration);
            }
            
        }

        public void InvalidateCatalog(int tenantId, int catalogId, StoreFrontCacheDependencies cacheType, Mozu.Core.DataViewModeType dataModeType)
        {
            var key = CacheKeyHelper.GetCatalogCacheKey(tenantId, catalogId);
            foreach (var cache in this.GetCaches(cacheType, dataModeType))
            {
                cache.Set(key, true, ObjectCache.InfiniteAbsoluteExpiration);
            }
        }

        public void InvalidateSite(int siteId, StoreFrontCacheDependencies cacheType, Mozu.Core.DataViewModeType dataModeType)
        {
            var key = CacheKeyHelper.GetSiteCacheKey(siteId);
            foreach (var cache in this.GetCaches(cacheType, dataModeType))
            {
                cache.Set(key, true, ObjectCache.InfiniteAbsoluteExpiration);
            }
        }

        public ClientCacheContainer GetCache(StorefrontCacheTypes cacheType, Mozu.Core.DataViewModeType dataModeType)
        {
            var offSet = dataModeType == Core.DataViewModeType.Pending ? _stagingKeyOffset : 0;
            return _caches[(int)cacheType + offSet];
        }
    }
}
