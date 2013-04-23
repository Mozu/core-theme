using System;
using Mozu.CommerceRuntime.Contracts.Clients;
using System.Collections.Generic;
using System.Linq;
using Mozu.SiteBuilder.UX.Models;
using SFCart = Mozu.SiteBuilder.UX.Models.StoreFront.Cart;
using SFCatalog = Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;

namespace Mozu.SiteBuilder.Mvc
{
    /// <summary>
    /// Contains context data pertinent to the catalog (categories, current product, etc).
    /// </summary>
    public class CatalogContext : ModelBase, ICatalogContext
    {
        private readonly ICartWebApiClient _cartWebApiClient;
        
        public CatalogContext (ICartWebApiClient cartWebApiClient)
        {
            _cartWebApiClient = cartWebApiClient;
        }

        public SFCatalog.Product CurrentProduct { get; set; }

        public List<SFCatalog.Category> AllCategories { get; set; }

        [AlternateName("RootCategories")]
        public List<SFCatalog.Category> CategoryTree
        {
            get
            {
                if (AllCategories != null && AllCategories.Count > 0)
                    return AllCategories.Where(x => x.ParentCategoryId.GetValueOrDefault(-1) < 1).ToList();
                else
                    return null;
            }
        }

        private SFCart.CartAbstract _cartAbstract;
        public SFCart.CartAbstract CartAbstract
        {
            get
            {
               if ( _cartAbstract== null )
               {
                   var ca = _cartWebApiClient.GetCartSummary().Result.ReadAsSync();
                   _cartAbstract = new SFCart.CartAbstract()
                                       {
                                           Exists = ca.HasActiveCart,
                                           ItemCount = ca.ItemCount,
                                           Total = ca.Total.GetValueOrDefault(0) 
                                       };
                   // var ca = null;
               }

                return _cartAbstract;
            }
        }
    }
}
