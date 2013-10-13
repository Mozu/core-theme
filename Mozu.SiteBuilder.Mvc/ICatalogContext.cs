using System;
using System.Collections.Generic;
using SFCart = Mozu.SiteBuilder.UX.Models.StoreFront.Cart;
using SFCatalog = Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;

namespace Mozu.SiteBuilder.Mvc
{
    /// <summary>
    /// Contains context data pertinent to the catalog (categories, current product, etc).
    /// </summary>
    public interface ICatalogContext
    {
        List<SFCatalog.Category> AllCategories { get; set; }
        List<SFCatalog.Category> RootCategories { get; }
        SFCart.CartAbstract CartAbstract { get; }

        SFCatalog.Product CurrentProduct { get; set; }
    }
}
