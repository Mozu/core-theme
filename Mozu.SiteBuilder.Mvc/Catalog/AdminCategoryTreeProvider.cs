using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Caching;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.Core.Logging;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using Mozu.Core;
using Mozu.SiteBuilder.Mvc.Caching;

namespace Mozu.SiteBuilder.Mvc.Catalog
{
    /// <summary>
    /// Provides the runtime Catalog Tree to SiteContext.
    /// </summary>
    public class AdminCategoryTreeProvider : RuntimeCategoryTreeProvider
    {
        /// <summary>
        /// Public constructor.
        /// </summary>
        public AdminCategoryTreeProvider(IProductCategoryRuntimeWebApiClient productCategoryRuntimeWebApiClient, ILogger logger)
            : base(productCategoryRuntimeWebApiClient, logger, new ApiContext(), new AdminStorefrontCache())
        {
        }

        public class AdminStorefrontCache : IStorefrontCache
        {
            T IStorefrontCache.Get<T>(string key, CacheScope scope, StorefrontCacheTypes cacheType)
            {
                return (T)MemoryCache.Default[key];
            }

            void IStorefrontCache.Set(string key, object value, CacheScope scope, StorefrontCacheTypes cacheType, Func<object, object> updateCallback, IList<string> filePaths)
            {
                MemoryCache.Default.Add(new CacheItem(key, value), new CacheItemPolicy() { AbsoluteExpiration = DateTime.Now.AddMinutes(15), Priority = CacheItemPriority.NotRemovable });

            }
        }
    }
}