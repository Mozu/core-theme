using System;
using System.Collections;
using System.Runtime.Caching;
using Mozu.Core.Api;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Client.Caching;
using Mozu.Core.Settings;
using Mozu.Tenant.Contracts.Clients;
using System.Collections.Generic;
using System.Linq;
using Mozu.Core.Logging;
using Mozu.Core;
using Mozu.SiteBuilder.Mvc.Contexts;
using System.Net.Http;
using System.Web;
using System.IO;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Mozu.Core.Configuration;
using Mozu.SiteBuilder.Mvc;

namespace Mozu.SiteBuilder.Mvc.Caching
{
    public interface IStorefrontCache
    {
        T Get<T>(string key, CacheScope scope = CacheScope.Site, StorefrontCacheTypes cacheType = StorefrontCacheTypes.Default);
        void Set(string key, object value, CacheScope scope = CacheScope.Site, StorefrontCacheTypes cacheType = StorefrontCacheTypes.Default);
    }
   
    internal  class StorefrontCache : IStorefrontCache
    {
        private readonly IApiContext _ctx;
        private readonly IServiceProvider _scope;
        private readonly IStorefrontCacheControl _cacheControl;
        private static readonly Hashtable SiteLookupHashtable = new Hashtable();
     
      //  private readonly int _timeout;
        /// <summary>
        /// Public constructor.
        /// </summary>
        public StorefrontCache(IApiContext ctx, IServiceProvider scope, IStorefrontCacheControl cacheControl )
        {
            _ctx = ctx;
            _scope = scope;
            _cacheControl = cacheControl;
        }

        void ValidateContext()
        {
            if (!_ctx.SiteId.HasValue || _ctx.CatalogId.HasValue) return;
            var key = _ctx.SiteId.Value;
            var res = (int?)SiteLookupHashtable[key ];
            if (res == null)
            {
                var client = _scope.Resolve<ISitesWebApiClient>().CloneWithoutUserClaims();
                var siteTask = client.GetSite(_ctx.SiteId.Value ,true);
                if (!siteTask.Result.HasException && siteTask.Result.ResponseMessage.IsSuccessStatusCode)
                {
                    var site = siteTask.Result.ReadAsSync();
                    res = site?.Id;
                }
                SiteLookupHashtable[key] = res;
            }
            ((MozuServiceApiContext)_ctx).CatalogId = res;
        }

        /// <summary>
        /// Get an entry from the cache.
        /// </summary>
        public object Get(string key, CacheScope scope, StorefrontCacheTypes cacheType)
        {
            var cc = _cacheControl.GetCache(cacheType, _ctx.DataViewMode);
            //if (_timeout == 0)
            //    return null;
            if (string.IsNullOrWhiteSpace(key))
                return null;
            ValidateContext();
            if (_ctx == null || _ctx.TenantId == 0)
                return null;
            if (scope >= CacheScope.Catalog && !_ctx.CatalogId.HasValue)
                return null;
            if (scope >= CacheScope.Site && !_ctx.SiteId.HasValue)
                return null;
            

            switch (scope)
            {
                case CacheScope.Catalog:
                    return cc.Cache.Get(CacheKeyHelper.GetCatalogCacheKey(_ctx.TenantId, _ctx.CatalogId.Value, key));
                case CacheScope.Site:
                    return cc.Cache.Get(CacheKeyHelper.GetSiteCacheKey(_ctx.SiteId.Value, key));
                case CacheScope.Global:
                    return cc.Cache.Get( key);
                default:
                    return cc.Cache.Get(CacheKeyHelper.GetTenantCacheKey(_ctx.TenantId, key));
            }
        }

        public T Get<T>(string key, CacheScope scope, StorefrontCacheTypes cacheType)
        {
            var value = Get(key, scope, cacheType);
            return value is T ? (T)value : default;
        }

       

        class CacheHandler
        {
            private IMemoryCache cache;

            public CacheHandler( CacheConfiguration config,  IMemoryCache cache)
            {
                this.Config = config;
                this.cache = cache;
            }
           public CacheConfiguration Config { get; private set; }
            
           
            

            MemoryCacheEntryOptions GetPolicy (string key)
            {
                return new MemoryCacheEntryOptions
                {
                    AbsoluteExpiration =
                        DateTime.Now.AddSeconds(Config.AbsoluteExpirationSeconds.GetValueOrDefault(300)),
                    SlidingExpiration = TimeSpan.FromSeconds(Config.SlidingExpirationSeconds.GetValueOrDefault(120)),
                    Size =1
                };
            }
            public void Cache( string key , object obj)
            {
                var policy= GetPolicy(key);
                cache.Set(key, obj, policy);
            }
        }


        public void Set(string key, object value, CacheScope scope, StorefrontCacheTypes cacheType)
        {
            if (string.IsNullOrWhiteSpace(key)  )
                return;
            ValidateContext();
            
            if (_ctx == null || _ctx.TenantId == 0)
                throw new ArgumentOutOfRangeException("scope", "Cannot add item to cache: no api context.");
            if (scope >= CacheScope.Catalog && !_ctx.CatalogId.HasValue)
                throw new ArgumentOutOfRangeException("scope", "Cannot add item to cache: Api context lacks CatalogId. Requested cache scope: " + scope);
            if (scope >= CacheScope.Site && !_ctx.SiteId.HasValue)
                throw new ArgumentOutOfRangeException("scope", "Cannot add item to cache: Api context lacks SiteId. Requested cache scope: " + scope);

            string cacheKey;
    
            switch (scope)
            {
                case CacheScope.Catalog:
                    cacheKey = CacheKeyHelper.GetCatalogCacheKey(_ctx.TenantId, _ctx.CatalogId.GetValueOrDefault(), key);
                    break;
                case CacheScope.Site:
                    cacheKey = CacheKeyHelper.GetSiteCacheKey(_ctx.SiteId.GetValueOrDefault(), key);
                    break;
                case CacheScope.Global:
                    cacheKey =  key;
                    break;
                    
                default:
                    cacheKey = CacheKeyHelper.GetTenantCacheKey(_ctx.TenantId, key);
                    break;
            }
            var cc = _cacheControl.GetCache(cacheType, _ctx.DataViewMode);
            
            new CacheHandler(cc.Configuration,  cc.Cache).Cache(cacheKey, value);
        }
    }
}