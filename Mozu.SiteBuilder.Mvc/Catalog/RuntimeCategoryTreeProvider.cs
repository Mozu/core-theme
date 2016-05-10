using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Caching;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Client;
using Mozu.ProductRuntime.Contracts;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.Caching;
using Category = Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Category;

namespace Mozu.SiteBuilder.Mvc.Catalog
{
    /// <summary>
    /// Provides the runtime Catalog Tree to SiteContext.
    /// </summary>
    public class RuntimeCategoryTreeProvider : ICategoryTreeProvider
    {
        private IProductCategoryRuntimeWebApiClient _productCategoryRuntimeWebApiClient;
        private Task<CategoryTree> _categoryTreeTask;
        private ILogger _logger;
        private readonly IStorefrontCache _cache;
        private string _priceListCode;
        private DataViewModeType _dataViewMode;
        int? _siteId;


        public RuntimeCategoryTreeProvider(IProductCategoryRuntimeWebApiClient productCategoryRuntimeWebApiClient, ILogger logger, IApiContext apiContext, IStorefrontCache cache )
        {
            _productCategoryRuntimeWebApiClient = productCategoryRuntimeWebApiClient.CloneWithoutUserClaims();
            _logger = logger;
            _cache = cache;
            _priceListCode = apiContext.PriceListCode;
            _dataViewMode = apiContext.DataViewMode;
            _siteId = apiContext.SiteId;
        }

        public bool HasCompleted
        {
            get
            {
                return _categoryTreeTask != null && _categoryTreeTask.IsCompleted;
            }
        }
        static System.Collections.Concurrent.ConcurrentDictionary<int, System.Threading.SemaphoreSlim> _sempDic = new System.Collections.Concurrent.ConcurrentDictionary<int, System.Threading.SemaphoreSlim>();

        public  Task<CategoryTree> GetAllCategories()
        {
            return _categoryTreeTask ?? (_categoryTreeTask = GetAllCategoriesImpl());
        }
        static SemaphoreSlim SemaphoreFactory(int id =0 )
        {
            return new System.Threading.SemaphoreSlim(1, 1);
        }
        static SemaphoreSlim DifferentOrNew(SemaphoreSlim current, SemaphoreSlim possibleBad)
        {
            return current == possibleBad ? SemaphoreFactory() : current;
        }
        private async Task<CategoryTree> GetAllCategoriesImpl() {
            var cacheKey = this.GetType().FullName + _priceListCode + _dataViewMode;

            var catTree = _cache.Get<CategoryTree>(cacheKey, CacheScope.Catalog, StorefrontCacheTypes.Default);
            if (catTree != null)
            {
                return catTree;
            }

            SemaphoreSlim sem = null;
           
            //wait on an semiphore.. if it fails to get a lock.. ya know try a new one.. becuase we dont know what the fuck happend. 
            while (true)
            {
                sem = _sempDic.GetOrAdd(_siteId.GetValueOrDefault(), SemaphoreFactory);
                if (await sem.WaitAsync(30000).ConfigureAwait(false))
                {
                    break;
                }
                else
                {
                    _sempDic.AddOrUpdate(_siteId.GetValueOrDefault(), SemaphoreFactory, (i, current) => DifferentOrNew(current, sem));
                }
            }
            try
            {
                catTree = _cache.Get<CategoryTree>(cacheKey, CacheScope.Catalog, StorefrontCacheTypes.Default);
                if (catTree != null)
                {
                    return catTree;
                }

                var fetcher = new CatTreeFetcher() { Cachekey = cacheKey , Client = _productCategoryRuntimeWebApiClient.CloneWithApiContext(ctx => ctx.PriceListCode = _priceListCode).CloneWithoutUserClaims() };
                catTree = await fetcher.GetAsyc(null).ConfigureAwait(false);
                _cache.Set(cacheKey,catTree , CacheScope.Catalog, StorefrontCacheTypes.Default, fetcher.GetSync);
                return catTree;
            }
            finally
            {
                sem.Release();
                
            }
        }
        
        



        class CatTreeFetcher
        {
            static ConcurrentDictionary<string, CategoryTree> _persistentCache = new ConcurrentDictionary<string, CategoryTree>();
            public IProductCategoryRuntimeWebApiClient Client { get; set; }
            public string Cachekey { get; set; }

            void Log ( Exception ex)
            {
                LoggingService.LoggerFor<RuntimeCategoryTreeProvider>().Warn(ex);
            }

            public CategoryTree GetSync(object origVal)
            {
                return GetAsyc(origVal).Result;
            }

            public Task<CategoryTree> GetAsyc(object origVal)
            {
                CategoryTree lastGoodTree;
                _persistentCache.TryGetValue(this.Cachekey, out lastGoodTree);
                var catTreeFromCache = origVal as CategoryTree;
                return Client.CloneWithConfigOptions(x=> x.TimeoutMilliseconds = 15000)
                    .GetCategoryTree()
                    .ContinueWith(t => {
                        if (t.IsFaulted && t.Exception != null)
                        {
                            Log(t.Exception);
                      
                            if (catTreeFromCache != null)
                            {
                                return catTreeFromCache;
                            }
                            if( lastGoodTree != null)
                            {
                                return lastGoodTree;
                            }
                            throw t.Exception;
                        }
                        if (t.Result.HasException)
                        {
                            var ex = t.Result.ReadException();
                            Log(ex);

                            if (catTreeFromCache != null)
                            {
                                return catTreeFromCache;
                            }
                            if (lastGoodTree != null)
                            {
                                return lastGoodTree;
                            }
                            throw ex;
                        }
                        lastGoodTree =  ParseCategoryTree(t.Result);
                        _persistentCache[this.Cachekey] = lastGoodTree;
                        return lastGoodTree;
                });
            }

            private static CategoryTree ParseCategoryTree(ServiceClientResponse<CategoryCollection> res)
            {
                var categories = new List<Category>();

                var dic = new Dictionary<int, Category>();

                var etag = res.ETag();
                var srvTree = res.ReadAsSync();

                var treeStack =
                    new Stack<Tuple<Mozu.ProductRuntime.Contracts.Category, List<Mozu.ProductRuntime.Contracts.Category>>>(
                        srvTree.Items.Select(x =>
                            new Tuple<Mozu.ProductRuntime.Contracts.Category, List<Mozu.ProductRuntime.Contracts.Category>>
                                (x, srvTree.Items)));

                while (treeStack.Any())
                {
                    var catPair = treeStack.Pop();
                    if (catPair.Item1 == null)
                    {
                       // _logger.Error("Unexpected null returned from productCategoryRuntimeWebApiClient.GetCategoryTree().");
                        continue;
                    }
                    var cat = Mapper.Map<Category>(catPair.Item1);

                    categories.Add(cat);
                    dic[cat.Id.Value] = cat;
                    cat.ReadOnly = true;

                    if (catPair.Item1.ChildrenCategories != null)
                    {
                        catPair.Item1.ChildrenCategories.ForEach(
                            x =>
                                treeStack.Push(
                                    new Tuple<Mozu.ProductRuntime.Contracts.Category, List<Mozu.ProductRuntime.Contracts.Category>>(x, catPair.Item1.ChildrenCategories)))
                            ;
                    }
                }

                foreach (var cat in categories)
                {
                    Category parent;
                    if (cat.ParentCategoryId.HasValue && dic.TryGetValue(cat.ParentCategoryId.Value, out parent))
                    {
                        cat.ParentCategory = parent;
                    }
                }
                return new CategoryTree { AllCategories = categories, ETag = etag };
            }

        }
        
    }
    
}
