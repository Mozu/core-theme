using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;

namespace Mozu.SiteBuilder.Mvc.Catalog
{
    /// <summary>
    /// Provides the runtime Catalog Tree to SiteContext.
    /// </summary>
    public class AdminCategoryTreeProvider : ICategoryTreeProvider
    {
        /// <summary>
        /// Public constructor.
        /// </summary>
        public AdminCategoryTreeProvider()
        {
        }

        public Task<List<Category>> GetAllCategories()
        {
            return new Task<List<Category>>(() => null);
        }
    }
}
