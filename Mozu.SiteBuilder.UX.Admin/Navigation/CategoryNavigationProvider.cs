using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.UX.Models.Navigation;
using DC = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Navigation
{
    /// <summary>
    /// Retrieves categories from the Runtime category client and
    /// returns a list of NavigationTreeNodes.
    /// </summary>
    public class CategoryNavigationProvider : ICategoryNavigationProvider
    {
        private ICategoryWebApiClient _catClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public CategoryNavigationProvider(ICategoryWebApiClient catClient)
        {
            _catClient = catClient;
        }

        /// <summary>
        /// Retrieves categories from the Admin category client and
        /// returns a list of NavigationTreeNodes.
        /// </summary>
        public Task<List<NavigationNode>> GetCategories()
        {
            return _catClient.GetCategories()
                .ContinueWith(t =>
                {
                    DC.CategoryPagedCollection cats = t.Result.ReadAsSync();

                    return Mapper.Map<List<NavigationNode>>(cats.Items);
                });
        }
    }
}