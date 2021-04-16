using System;
using Mozu.Core;
using Mozu.SiteBuilder.UX.Models;
using System.Collections.Generic;

namespace Mozu.SiteBuilder.Mvc.Caching
{
    public interface ILiveModeOnlyCache : IStorefrontCache { }
    
    public class LiveModeOnlyCacheInternal : ILiveModeOnlyCache
    {
        private readonly IApiContext _apiContext;
        private readonly IEditableContext _pageContext;
        
        private readonly IStorefrontCache _backingCache;

        public LiveModeOnlyCacheInternal(IApiContext apiContext, IEditableContext pageContext, IStorefrontCache backingCache)
        {
            _apiContext = apiContext;
            _pageContext = pageContext;
            

            _backingCache = backingCache;
        }

        public T Get<T>(string key, CacheScope scope , StorefrontCacheTypes cacheType)
        {
            if(CachingIsDisabled(_pageContext, _apiContext)) return default(T);
            return  _backingCache.Get<T>(key, scope, cacheType);
        }

        public void Set(string key, object value, CacheScope scope = CacheScope.Site, StorefrontCacheTypes cacheType = StorefrontCacheTypes.Default)
        {
            if (CachingIsDisabled(_pageContext, _apiContext)) return; // don't want to corrupt the cache with 'pending' stuff from a consumer.
            _backingCache.Set(key, value, scope, cacheType);
        }

        private static bool CachingIsDisabled(IEditableContext pageCtx, IApiContext apiCtx )
        {
            return
                pageCtx.IsEditMode ||
                apiCtx.DataViewMode == DataViewModeType.Pending;
        }

       
    }
}
