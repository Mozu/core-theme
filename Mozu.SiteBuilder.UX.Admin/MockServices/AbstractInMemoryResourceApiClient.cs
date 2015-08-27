using System;
using System.Collections.Generic;
using System.Runtime.Caching;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.MockServices
{
    /// <summary>
    /// Mocks IProductTypeWebApiClient to store ProductTypes in the HttpRuntime.Cache
    /// </summary>
    public abstract class AbstractInMemoryResourceApiClient<T> where T : new()
    {
        /// <summary>
        /// Cache key for the repository. Can be implemented by subclasses to be specific to ApiContext, etc.
        /// </summary>
        protected abstract string CacheKey { get; }
        private readonly ObjectCache _cache;

        private ObjectCache Cache { get { return _cache ?? MemoryCache.Default; } }

        protected virtual void InitializeRepoWithMockData(T repo)
        {
        }

        /// <summary>
        /// Public constructor.
        /// </summary>
        /// <param name="cache"></param>
        public AbstractInMemoryResourceApiClient(ObjectCache cache = null)
        {
            _cache = cache;
        }

        /// <summary>
        /// Returns the Resource repository (which is backed by HttpRuntimeCache) for this tenant.
        /// </summary>
        protected T Repository
        {
            get
            {
                T existingRepo = (T)Cache[CacheKey];
                if (existingRepo == null)
                {
                    existingRepo = new T();
                    // if the repository is empty, fill it with mock data.
                    InitializeRepoWithMockData(existingRepo);

                    var policy = new CacheItemPolicy { AbsoluteExpiration = ObjectCache.InfiniteAbsoluteExpiration, Priority = CacheItemPriority.NotRemovable, SlidingExpiration = ObjectCache.NoSlidingExpiration };

                    Cache.Add(CacheKey, existingRepo, policy, null);
                }

                return existingRepo;
            }
        }
    }
}