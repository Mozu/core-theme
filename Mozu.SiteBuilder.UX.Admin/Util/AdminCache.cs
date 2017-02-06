using System;
using System.IO;
using System.Web;
using System.Web.Http;
using Mozu.Core.Settings;
using Mozu.MZDB.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Contexts;
using System.Runtime.Caching;
using System.Collections.Generic;
using Mozu.Core.Messaging.Consume;
using Burrows;
using Mozu.Core.Messaging.Contracts.Product.Events;

namespace Mozu.SiteBuilder.UX.Admin.Misc
{
    public class AdminCache
    {
        static Lazy<AdminCache> _instace = new Lazy<AdminCache>();
        MemoryCache _cache;
        public static AdminCache Instace
        {
            get
            {
                return _instace.Value;
            }

        }
        public AdminCache()
        {
            _cache = new MemoryCache("sbadmin");
        }

        string GetTenantKey(int tenant, bool addToCache = true)
        {
            var key = $"tenant-{tenant}-";
            var obj = _cache.Get(key);
            if (obj == null)
            {
                _cache[key] = new object();
            }
            return key;
        }


        public void ClearTenantCache(int tenant)
        {
            var key = GetTenantKey(tenant, false);
            _cache.Remove(key);
        }
        string GetKey(int tenant, string key)
        {
            return $"-{tenant}-{key}_";
        }
        public object Get(int tenant, string key)
        {
            var cachekey = GetKey(tenant, key);
            return _cache.Get(cachekey);

        }
        

        public void Add(int tenant, string key, object obj)
        {
            var cachekey = GetKey(tenant, key);
            var dep = GetTenantKey(tenant);
            var policy = new CacheItemPolicy()
            {
                AbsoluteExpiration = DateTime.Now.AddMinutes(15)
            };
            var cm = _cache.CreateCacheEntryChangeMonitor(new string[] { dep });
            policy.ChangeMonitors.Add(cm);
            var cacheItem = new CacheItem(cachekey, obj);
            _cache.Set(cacheItem, policy);


        }
    }


    class AdminCacheItemsInvalidConsumer : LoggingConsumer,

       Consumes<ICategoryEvent>.All

    {
        public void Consume(ICategoryEvent message)
        {
            AdminCache.Instace.ClearTenantCache(message.MessagePublishingContext.TenantId);
        }
    }
}