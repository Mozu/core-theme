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
        void Set(string key, object value, CacheScope scope = CacheScope.Site, StorefrontCacheTypes cacheType = StorefrontCacheTypes.Default, Func<object, object> updateCallback   = null , IList<string> filePaths= null);
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

            public CacheHandler( CacheConfiguration config, Func<object, object> updateCallback, IEnumerable<string> dependencies, IList<string> filePaths, IMemoryCache cache)
            {
                this.Config = config;
                this.UpdateCallback = updateCallback;
                this.Dependencies = dependencies;
                this.FilePaths = filePaths;
                this.cache = cache;
            }
           public CacheConfiguration Config { get; private set; }
            
            public Func<object,object> UpdateCallback { get; set; }
            public IEnumerable<string> Dependencies { get; set; }
            IList<string> _filePaths = null;
            public IList<string> FilePaths {
                get => _filePaths;

                private set {
                    if (value == null) return;
                    var subDirs = value.Select(x => new DirectoryInfo(x)).ToList();
                    _filePaths = subDirs
                        .Where(x => x.Attributes.HasFlag(FileAttributes.Directory))
                        .SelectMany(x => x.GetDirectories("*.*", SearchOption.AllDirectories))
                        .Where( x => x.FullName.IndexOf("node_modules", StringComparison.CurrentCultureIgnoreCase) ==-1)
                        .Union(subDirs)
                        .Select( x=> x.FullName).ToList();
                }
            }

            public void CacheEntryEvictionHandler(object key, object value, EvictionReason reason, object state)
            {
                if (reason == EvictionReason.Expired)
                {
                    return;
                }
                var originalObj = value;
                object newObj = null;
                try
                {
                    System.Diagnostics.Debug.WriteLine("starting refresh of" + key, "cache updater");
                    newObj = UpdateCallback(originalObj);
                    System.Diagnostics.Debug.WriteLine("ending refresh of" + key, "cache updater");
                }
                catch ( Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine("error on refresh of" + key + " " + ex, "cache updater");
                    LoggingService.LoggerFor<StorefrontCache>().Warn(
                        $"error in cache updateCallback [{key}]", ex);
                }
                 
                if ( newObj == null)
                {
                    return;
                }
                var policy = GetPolicy(key.ToString());
                cache.Set(key, newObj, policy);

            }

            MemoryCacheEntryOptions GetPolicy (string key)
            {
                var abskey = key + ";abs";
                cache.GetOrCreate(abskey, entry =>
                {
                    entry.AbsoluteExpiration =
                        DateTime.Now.AddSeconds(Config.AbsoluteExpirationSeconds.GetValueOrDefault(300));
                    entry.Size = 1;
                    return new object();
                });

                var cip = new MemoryCacheEntryOptions
                {
                    SlidingExpiration = TimeSpan.FromSeconds(Config.SlidingExpirationSeconds.GetValueOrDefault(120)),
                    Size =1
                };

                if (UpdateCallback != null)
                {
                    cip.RegisterPostEvictionCallback(CacheEntryEvictionHandler);
                }

                //cip.AddExpirationToken(new )
                //    ChangeMonitors = { cache.CreateCacheEntryChangeMonitor(this.Dependencies.Union(new string[] { abskey })) } 
                //};
                //if (FilePaths != null && FilePaths.Count >0)
                //{
                //    cip.AddExpirationToken(new ).Add(new HostFileChangeMonitor(FilePaths));
                //}
                return cip;
            }
            public void Cache( string key , object obj)
            {
                var policy= GetPolicy(key);
                cache.Set(key, obj, policy);
            }
        }


        public void Set(string key, object value, CacheScope scope, StorefrontCacheTypes cacheType, Func<object, object>  updateCallback = null, IList<string> filePaths = null)
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
                case CacheScope.Global:
                    dependencies = new string[0];
                    cacheKey =  key;
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
                cc.Cache.Set(dep, Guid.NewGuid(), new MemoryCacheEntryOptions { AbsoluteExpiration = DateTimeOffset.MaxValue , Size =1});            
            }

            //disable update call back for staging.   product updates make this kill the system
            updateCallback = _ctx.DataViewMode == Core.DataViewModeType.Pending ? null : updateCallback;

            new CacheHandler(cc.Configuration, updateCallback, dependencies, filePaths, cc.Cache).Cache(cacheKey, value);
        }
    }
}