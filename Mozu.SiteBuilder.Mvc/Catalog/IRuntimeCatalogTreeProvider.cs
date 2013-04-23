using System;
using System.Collections.Generic;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;

namespace Mozu.SiteBuilder.Mvc.Catalog
{
    /// <summary>
    /// Provides the runtime Catalog Tree to SiteContext.
    /// </summary>
    public interface IRuntimeCatalogTreeProvider
    {
        List<Category> GetAllCategories();
    }
}
