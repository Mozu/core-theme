using System;
using System.Collections.Generic;
using System.Runtime.Caching;
using FSharpx.Collections;
using Mozu.Core.Api.Client.Caching;
using System.Linq;
using Mozu.Core;
using Mozu.Core.Settings;
using System.Collections.Concurrent;
using System.Threading;

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
        CatalogIndependent = 8,
        All = 15
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
    class EventDebouncer
    {
        class InvalidateArgs
        {
            public int? Tenant { get; set; }
            public int? Catalog { get; set; }
            public int? Site { get; set; }
            public StoreFrontCacheDependencies SFCD { get; set; }
            public DataViewModeType DataViewModeType { get; set; }

            public override int GetHashCode()
            {
                return Tenant.GetValueOrDefault()
                    + Catalog.GetValueOrDefault() +
                    (int)SFCD +
                    (int)DataViewModeType;

            }
            public override bool Equals(object obj)
            {
                if (obj == null)
                {
                    return false;
                }
                InvalidateArgs comp = (InvalidateArgs)obj;

                return Tenant == comp.Tenant &&
                    Catalog == comp.Catalog &&
                    Site == comp.Site &&
                    SFCD == comp.SFCD &&
                    DataViewModeType == DataViewModeType;


            }

        }
        System.Collections.Concurrent.ConcurrentDictionary<InvalidateArgs, int> _events = new System.Collections.Concurrent.ConcurrentDictionary<InvalidateArgs, int>();


    }
    class StorefrontCacheControlImpl : IStorefrontCacheControl
    {
        private readonly IClientCacheProvider _cacheProvidere;
       

        int _stagingKeyOffset = 2 ^ 29;
        Dictionary<int, ClientCacheContainer> _caches = new Dictionary<int, ClientCacheContainer>();
        Dictionary<StoreFrontCacheDependencies, List<StorefrontCacheTypes>> _cacheDeps = new Dictionary<StoreFrontCacheDependencies, List<StorefrontCacheTypes>>();
        System.Threading.Timer _invalidateTimer;
        System.Threading.Timer _stagingInvalidateTimer;
        int _stagingIntervalMiliSeconds = 10*1000;
        int _intervalMiliSeconds = 3 * 60 *1000;
        ConcurrentDictionary<InvalidateArgs, int> _events = new ConcurrentDictionary<InvalidateArgs, int>();
        ConcurrentDictionary<InvalidateArgs, int> _stagingEvents = new ConcurrentDictionary<InvalidateArgs, int>();

        public StorefrontCacheControlImpl(IClientCacheProvider cacheProvidere, ISettings settings )
        {
            _cacheProvidere = cacheProvidere;
            AddClientCacheContainer(StorefrontCacheTypes.Default, StoreFrontCacheDependencies.Catalog);
            AddClientCacheContainer(StorefrontCacheTypes.Default, StoreFrontCacheDependencies.Catalog);
            AddClientCacheContainer(StorefrontCacheTypes.PartialOutput, StoreFrontCacheDependencies.Catalog);
            AddClientCacheContainer(StorefrontCacheTypes.PartialOutput, StoreFrontCacheDependencies.None);
            AddClientCacheContainer(StorefrontCacheTypes.CatalogIndependent, StoreFrontCacheDependencies.None );
            AddClientCacheContainer(StorefrontCacheTypes.ProductSearch, StoreFrontCacheDependencies.Catalog);

            var curTime = DateTime.Now;

            var eventRelayInterval = settings.AppSettingsAsNullableInt("Sitebuilder.StorefrontCacheControlImpl:EventRelayInterval");
            //if config wasnt set default to 3 mins for non sandbox and low for sandbox.
            if ( !eventRelayInterval.HasValue)
            {
                if ( settings.CoreSettings.ScaleUnitId.IndexOf("sb", StringComparison.OrdinalIgnoreCase) > -1)
                {
                    eventRelayInterval = 0;
                }
                else
                {
                    eventRelayInterval = 3;
                }
            }

            if (eventRelayInterval > 0)
            {
                var nextTimeInSeconds = (eventRelayInterval.Value - (curTime.Minute % eventRelayInterval.Value)) * 60 - curTime.Second;

                _invalidateTimer = new System.Threading.Timer(OnTimedInvalidate, null, nextTimeInSeconds * 1000, Timeout.Infinite);
                _intervalMiliSeconds = eventRelayInterval.Value * 60 * 1000;
            }
            else
            {
                _invalidateTimer = new System.Threading.Timer(OnTimedInvalidate, null, 10000, Timeout.Infinite);
                _intervalMiliSeconds = 10 * 1000;
            }
            _stagingInvalidateTimer = new System.Threading.Timer(OnTimedInvalidateStaging, null, 10000, Timeout.Infinite);


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

        class InvalidateArgs
        {
            public string Key { get; set; }
            public StoreFrontCacheDependencies CacheType { get; set; }
            public DataViewModeType DataViewModeType { get; set; }
            int? _hash;
            public override int GetHashCode()
            {
                _hash = _hash ?? Key.GetHashCode()+
                    (int)CacheType +
                    (int)DataViewModeType;
                return _hash.Value;

            }
            public override bool Equals(object obj)
            {
                if (obj == null)
                {
                    return false;
                }
                InvalidateArgs comp = (InvalidateArgs)obj;

                return Key == comp.Key &&
                    CacheType == comp.CacheType &&
                    DataViewModeType == DataViewModeType;


            }

        }

        



        void OnTimedInvalidate ( object obj)
        {
            var events = _events;
            if (events.Count > 0)
            {
                _events = new ConcurrentDictionary<InvalidateArgs, int>();
                foreach (var arg in events.Keys)
                {
                    Invalidate(arg.Key, arg.CacheType, arg.DataViewModeType);
                }
            }
            _invalidateTimer.Change(_intervalMiliSeconds, Timeout.Infinite);

        }

        void OnTimedInvalidateStaging(object obj)
        {
            var events = _stagingEvents;
            if (events.Count > 0)
            {
                _stagingEvents = new ConcurrentDictionary<InvalidateArgs, int>();
                foreach (var arg in events.Keys)
                {
                    Invalidate(arg.Key, arg.CacheType, arg.DataViewModeType);
                }
            }
            _stagingInvalidateTimer.Change(_stagingIntervalMiliSeconds, Timeout.Infinite);
           
        }

        void  Invalidate (string key , StoreFrontCacheDependencies cacheType , DataViewModeType dataViewModeType)
        {
            foreach (var cache in this.GetCaches(cacheType, dataViewModeType))
            {
                cache.Set(key, true, ObjectCache.InfiniteAbsoluteExpiration);
            }
        }

        void AddEvent (InvalidateArgs args)
        {
            if (args.DataViewModeType.HasFlag( DataViewModeType.Pending))
            {
                _stagingEvents[args] = 1;
            }
            if (args.DataViewModeType.HasFlag(DataViewModeType.Live )|| args.DataViewModeType.HasFlag(DataViewModeType.NoneSet))
            {
                _events[args] = 1;
            }

        }

        public void InvalidateTenant(int tenantId, StoreFrontCacheDependencies cacheType, Mozu.Core.DataViewModeType dataModeType)
        {
            AddEvent(new InvalidateArgs()
            {
                Key = CacheKeyHelper.GetTenantCacheKey(tenantId),
                CacheType = cacheType,
                DataViewModeType = dataModeType
            });

        }

        public void InvalidateCatalog(int tenantId, int catalogId, StoreFrontCacheDependencies cacheType, Mozu.Core.DataViewModeType dataModeType)
        {
            AddEvent(new InvalidateArgs()
            {
                Key = CacheKeyHelper.GetCatalogCacheKey(tenantId, catalogId),
                CacheType = cacheType,
                DataViewModeType = dataModeType
            });

         
           

        }

        public void InvalidateSite(int siteId, StoreFrontCacheDependencies cacheType, Mozu.Core.DataViewModeType dataModeType)
        {
            AddEvent(new InvalidateArgs()
            {
                Key = CacheKeyHelper.GetSiteCacheKey(siteId),
                CacheType = cacheType,
                DataViewModeType = dataModeType
            });
          
            
        }

        public ClientCacheContainer GetCache(StorefrontCacheTypes cacheType, Mozu.Core.DataViewModeType dataModeType)
        {
            var offSet = dataModeType == Core.DataViewModeType.Pending ? _stagingKeyOffset : 0;
            return _caches[(int)cacheType + offSet];
        }

        

    }
}
