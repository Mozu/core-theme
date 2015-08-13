using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Caching;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Client;
using Mozu.ProductRuntime.Contracts;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using Mozu.Core.Logging;
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

        public RuntimeCategoryTreeProvider(IProductCategoryRuntimeWebApiClient productCategoryRuntimeWebApiClient, ILogger logger)
        {
            _productCategoryRuntimeWebApiClient = productCategoryRuntimeWebApiClient.CloneWithoutUserClaims();
            _logger = logger;
        }

        public bool HasCompleted
        {
            get
            {
                return _categoryTreeTask != null && _categoryTreeTask.IsCompleted;
            }
        }

        public Task<CategoryTree> GetAllCategories()
        {
            if (_categoryTreeTask != null)
            {
                return _categoryTreeTask;
            }



            var task = _productCategoryRuntimeWebApiClient.GetCategoryTree()
                .ContinueWith(t =>
                {
                    var etag = t.Result.ETag();
                    string cachekey = null;
                    CategoryTree catTree = null;
                    if (!string.IsNullOrEmpty(etag))
                    {
                        cachekey = etag + this.GetType().FullName;
                        catTree = (CategoryTree)MemoryCache.Default[cachekey];
                        if (catTree != null)
                        {
                            return catTree;
                        }
                    }
                    catTree = ParseCategoryTree(t.Result);
                    if (!string.IsNullOrEmpty(cachekey))
                    {
                        MemoryCache.Default.Add(new CacheItem(cachekey, catTree), new CacheItemPolicy() { AbsoluteExpiration = DateTime.Now.AddMinutes(15), Priority = CacheItemPriority.NotRemovable });
                    }
                    return catTree;
                });


            _categoryTreeTask = task;
            return _categoryTreeTask;
        }

        private CategoryTree ParseCategoryTree(ServiceClientResponse<CategoryCollection> res)
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
                    _logger.Error("Unexpected null returned from productCategoryRuntimeWebApiClient.GetCategoryTree().");
                    continue;
                }
                var cat = Mapper.Map<Category>(catPair.Item1);

                categories.Add(cat);
                dic [cat.Id.Value] = cat;
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

           foreach( var cat in categories)
            {
                Category parent;
                if (cat.ParentCategoryId.HasValue && dic.TryGetValue(cat.ParentCategoryId.Value, out parent))
                {
                    cat.ParentCategory = parent;
                }
            }
            return new CategoryTree {AllCategories = categories, ETag = etag};
        }
    }
    
}
