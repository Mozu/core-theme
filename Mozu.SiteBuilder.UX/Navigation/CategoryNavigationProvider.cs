using System;
using System.Collections.Generic;
using System.Runtime.Caching;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.UX.Models.Navigation;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;

namespace Mozu.SiteBuilder.UX.Navigation
{
    /// <summary>
    /// Abstracts the runtime distinction of categories and
    /// returns a list of NavigationTreeNodes.
    /// </summary>
    public class CategoryNavigationProvider : ICategoryNavigationProvider
    {
        private ICategoryTreeProvider _categoryTreeProvider;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public CategoryNavigationProvider(ICategoryTreeProvider categoryTreeProvider)
        {
            _categoryTreeProvider = categoryTreeProvider;
        }

        /// <summary>
        /// Retrieves categories from the Runtime category client and
        /// returns a list of NavigationTreeNodes.
        /// </summary>
        public Task<NavigationNodeCollection> GetCategories()
        {
            return _categoryTreeProvider.GetAllCategories()
                .ContinueWith(t =>
                {
                    NavigationNodeCollection nnc = null;
                    string cachekey = null;
                    if (!string.IsNullOrEmpty(t.Result.ETag))
                    {
                        cachekey = t.Result.ETag + this.GetType().FullName;
                        nnc = (NavigationNodeCollection)MemoryCache.Default[cachekey];
                    }
                    if (nnc == null)
                    {
                        nnc = NavigationNodeCollection(t);
                        if (cachekey != null)
                        {
                            MemoryCache.Default.Add(new CacheItem(cachekey, nnc), new CacheItemPolicy() { AbsoluteExpiration = DateTime.Now.AddMinutes(15), Priority = CacheItemPriority.NotRemovable });
                        }
                    }
                    return nnc;

                });
        }

        private static NavigationNodeCollection NavigationNodeCollection(Task<CategoryTree> t)
        {
            NavigationNodeCollection nnc;
            var cats = t.Result.Items;
            var nodes = Mapper.Map<List<NavigationNode>>(cats);
            nnc = new NavigationNodeCollection {Nodes = nodes, ETag = t.Result.ETag};
            return nnc;
        }
    }
}