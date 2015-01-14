using System;
using Mozu.Core;
using Mozu.SiteBuilder.UX.Models;

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

        public T Get<T>(string key, CacheScope scope = CacheScope.Site)
        {
            if(CachingIsDisabled(_pageContext, _apiContext)) return default(T);
            return  _backingCache.Get<T>(key, scope);
        }

        public void Set(string key, object value, CacheScope scope = CacheScope.Site)
        {
            _backingCache.Set(key, value, scope);
        }

        private static bool CachingIsDisabled(IEditableContext pageCtx, IApiContext apiCtx )
        {
            return
                pageCtx.IsEditMode ||
                apiCtx.DataViewMode == DataViewModeType.Pending;
        }
    }
}
