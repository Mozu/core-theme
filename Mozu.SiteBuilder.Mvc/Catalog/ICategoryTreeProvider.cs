using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;

namespace Mozu.SiteBuilder.Mvc.Catalog
{
    /// <summary>
    /// Provides the runtime Catalog Tree to SiteContext.
    /// </summary>
    public interface ICategoryTreeProvider
    {
        Task<CategoryTree> GetAllCategories();
        bool HasCompleted{ get; }
    }
}
