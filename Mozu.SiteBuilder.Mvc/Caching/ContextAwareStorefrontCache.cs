using System;
using Mozu.Core;
using Mozu.SiteBuilder.Mvc.Contexts;

namespace Mozu.SiteBuilder.Mvc.Caching
{
    public interface IContextAwareStorefrontCache : IStorefrontCache { }
    
    public class ContextAwareStorefrontCache : IContextAwareStorefrontCache
    {
        private readonly ISiteBuilderApiContext _apiContext;
        private readonly PageContext _pageContext;
        private readonly SiteContext _siteContext;
        private readonly IStorefrontCache _backingCache;

        public ContextAwareStorefrontCache(ISiteBuilderApiContext apiContext, PageContext pageContext, SiteContext siteContext, IStorefrontCache backingCache)
        {
            _apiContext = apiContext;
            _pageContext = pageContext;
            _siteContext = siteContext;
            _backingCache = backingCache;
        }

        public T Get<T>(string key, CacheScope scope = CacheScope.Site)
        {
            return CachingIsDisabled(_pageContext, _apiContext, _siteContext)
                ? default(T)
                : _backingCache.Get<T>(key, scope);
        }

        public void Set(string key, object value, CacheScope scope = CacheScope.Site)
        {
            _backingCache.Set(key, value, scope);
        }

        private static bool CachingIsDisabled(PageContext pageCtx, ISiteBuilderApiContext apiCtx, SiteContext siteCtx)
        {
            var enablePartialCaching = Convert.ToBoolean(siteCtx.ThemeSettings["enablePartialCaching"]);
            return
                pageCtx.IsEditMode ||
                apiCtx.DataViewMode == DataViewModeType.Pending ||
                !enablePartialCaching;
        }
    }
}
