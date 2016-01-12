using System;
using System.Collections;
using System.Runtime.Caching;
using Autofac;
using Mozu.Core.Api;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Client.Caching;
using Mozu.Core.Settings;
using Mozu.Tenant.Contracts.Clients;
using System.Collections.Generic;
using System.Linq;
using Mozu.Core.Logging;

namespace Mozu.SiteBuilder.Mvc.Caching
{
    public interface IStorefrontCache
    {
        T Get<T>(string key, CacheScope scope = CacheScope.Site, StorefrontCacheTypes cacheType = StorefrontCacheTypes.Default);
        void Set(string key, object value, CacheScope scope = CacheScope.Site, StorefrontCacheTypes cacheType = StorefrontCacheTypes.Default, Func<object, object> updateCallback   = null);


    }
   
   
    internal sealed class StorefrontCache : IStorefrontCache
    {
        private readonly ISiteBuilderApiContext _ctx;
       
        private readonly ILifetimeScope _scope;
        private readonly IStorefrontCacheControl _cacheControl;
        private static readonly Hashtable SiteLookupHashtable = new Hashtable();
     
      //  private readonly int _timeout;
        /// <summary>
        /// Public constructor.
        /// </summary>
        public StorefrontCache(ISiteBuilderApiContext ctx, ILifetimeScope scope, IStorefrontCacheControl cacheControl )
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
                    res = site!= null ? site.Id : new int?();
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
            if (String.IsNullOrWhiteSpace(key))
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
                default:
                    return cc.Cache.Get(CacheKeyHelper.GetTenantCacheKey(_ctx.TenantId, key));
            }
        }

        public T Get<T>(string key, CacheScope scope, StorefrontCacheTypes cacheType)
        {
            var value = Get(key, scope, cacheType);
            return (value is T) ? (T)value : default(T);
        }

        class CacheHandler
        {
            public CacheHandler( CacheConfiguration config, Func<object, object> updateCallback, IEnumerable<string> dependencies)
            {
                this.Config = config;
                this.UpdateCallback = updateCallback;
                this.Dependencies = dependencies;
            }
           public CacheConfiguration Config { get; private set; }
            
            public Func<object,object> UpdateCallback { get; set; }
            public IEnumerable<string> Dependencies { get; set; }
            public void CacheEntryUpdateHandler (CacheEntryUpdateArguments args)
            {
                if ( args.RemovedReason == CacheEntryRemovedReason.Expired )
                {
                    return;
                }
                var origionalObj = args.Source.Get(args.Key);
                object newObj = null;
                try
                {
                    newObj = UpdateCallback(origionalObj);
                }
                catch ( Exception ex)
                {
                    LoggingService.LoggerFor<StorefrontCache>().Warn(string.Format("error in cache updateCallback [{0}, {1}]", args.Key, args.Source.Name), ex);
                }
                 
                if ( newObj == null)
                {
                    return;
                }
                args.UpdatedCacheItem = new CacheItem(args.Key, newObj);
                args.UpdatedCacheItemPolicy = GetPolicy(args.Key, args.Source);
               
            }

            CacheItemPolicy GetPolicy (string key , ObjectCache cache )
            {
                var abskey = key + ";abs";
                cache.AddOrGetExisting(new CacheItem(abskey, new object()), new CacheItemPolicy() { AbsoluteExpiration = DateTime.Now.AddSeconds(Config.AbsoluteExpirationSeconds.GetValueOrDefault(300)) });
                return new CacheItemPolicy()
                {
                    SlidingExpiration = TimeSpan.FromSeconds(Config.SlidingExpirationSeconds.GetValueOrDefault(120)),
                    UpdateCallback = UpdateCallback == null ? (CacheEntryUpdateCallback)null : CacheEntryUpdateHandler,
                    ChangeMonitors = { cache.CreateCacheEntryChangeMonitor(this.Dependencies.Union(new string[] { abskey })) }
                };
            }
            public void Cache( string key , object obj , ObjectCache cache)
            {
                var policy= GetPolicy(key, cache);
                cache.Set(new CacheItem(key, obj), policy);
            }
           
        }


        public void Set(string key, object value, CacheScope scope, StorefrontCacheTypes cacheType, Func<object, object>  updateCallback = null)
        {
            if (String.IsNullOrWhiteSpace(key)  )
                return;
            ValidateContext();

          

            if (_ctx == null || _ctx.TenantId == 0)
                throw new ArgumentOutOfRangeException("scope", "Cannot add item to cache: no api context.");
            if (scope >= CacheScope.Catalog && !_ctx.CatalogId.HasValue)
                throw new ArgumentOutOfRangeException("scope", "Cannot add item to cache: Api context lacks CatalogId. Requested cache scope: " + scope);
            if (scope >= CacheScope.Site && !_ctx.SiteId.HasValue)
                throw new ArgumentOutOfRangeException("scope", "Cannot add item to cache: Api context lacks SiteId. Requested cache scope: " + scope);

            string cacheKey;
            string[] dependencies;
            switch (scope)
            {
                case CacheScope.Catalog:
                    cacheKey = CacheKeyHelper.GetCatalogCacheKey(_ctx.TenantId, _ctx.CatalogId.GetValueOrDefault(), key);
                    dependencies = new [] {
                        CacheKeyHelper.GetTenantCacheKey(_ctx.TenantId),
                        CacheKeyHelper.GetCatalogCacheKey(_ctx.TenantId, _ctx.CatalogId.GetValueOrDefault()) 
                    };
                    break;
                case CacheScope.Site:
                    cacheKey = CacheKeyHelper.GetSiteCacheKey(_ctx.SiteId.GetValueOrDefault(), key);
                    dependencies = new [] {
                        CacheKeyHelper.GetTenantCacheKey(_ctx.TenantId),
                        CacheKeyHelper.GetCatalogCacheKey(_ctx.TenantId, _ctx.CatalogId.GetValueOrDefault()),
                        CacheKeyHelper.GetSiteCacheKey(_ctx.SiteId.GetValueOrDefault())
                    };
                    break;
                default:
                    cacheKey = CacheKeyHelper.GetTenantCacheKey(_ctx.TenantId, key);
                    dependencies = new [] {
                        CacheKeyHelper.GetTenantCacheKey(_ctx.TenantId)
                    };
                    break;
            }

            var cc = _cacheControl.GetCache(cacheType, _ctx.DataViewMode);
            // ensure that all the dependencies have an entry in cache. we will have a really bad experience if they're not.
            foreach (var dep in dependencies)
            {
                // dependencies have a max expiration
                cc.Cache.AddOrGetExisting(dep, Guid.NewGuid(), new CacheItemPolicy { AbsoluteExpiration = DateTimeOffset.MaxValue });            
            }

            //disable update call back for staging.   product updates make this kill the system
            updateCallback = _ctx.DataViewMode == Core.DataViewModeType.Pending ? null : updateCallback;

            new CacheHandler(cc.Configuration, updateCallback, dependencies).Cache(cacheKey, value, cc.Cache);

            
        }
    }
}