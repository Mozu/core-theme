using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.UX.Models.Navigation;

namespace Mozu.SiteBuilder.UX.Navigation
{
    /// <summary>
    /// Abstracts the runtime distinction of categories and
    /// returns a list of NavigationTreeNodes.
    /// </summary>
    public class CategoryNavigationProvider : ICategoryNavigationProvider
    {
        private IRuntimeCatalogTreeProvider _categoryTreeProvider;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public CategoryNavigationProvider(IRuntimeCatalogTreeProvider categoryTreeProvider)
        {
            _categoryTreeProvider = categoryTreeProvider;
        }

        /// <summary>
        /// Retrieves categories from the Runtime category client and
        /// returns a list of NavigationTreeNodes.
        /// </summary>
        public Task<List<NavigationTreeNode>> GetCategories()
        {
            return _categoryTreeProvider.GetAllCategories()
                .ContinueWith(t =>
                {
                    var cats = t.Result;
                    var nodes = Mapper.Map<List<NavigationTreeNode>>(cats);
                    return nodes;
                });
        }
    }
}