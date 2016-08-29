using System;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.LocationInventoryHelpers
{
    internal static class LocationInventorySortExtensions
    {
        private const string PRODUCT_CODE_PROPERTY = "productCode";
        private const string STOCK_ON_HAND_PROPERTY = "stockOnHand";
        private const string STOCK_AVAILABLE_PROPERTY = "stockAvailable";
        private const string STOCK_ON_BACKORDER_PROPERTY = "stockonbackorder";


        /// <summary>
        /// Converts a SortingCollection for LocationInventory to a mozu services-compatible sort string.
        /// </summary>
        /// <param name="useSiteContext">
        /// By default, sort occurs on global-level content or price parameters.
        /// Pass true to force sort on content and price fields nested inside ProductInCatalogs.
        /// </param>
        public static string ToSortString(this SortingCollection sortCollection, bool useSiteContext = false)
        {
            if (sortCollection == null)
                return null;
            //Mozu.ProductAdmin.Contracts.Product p;
            //p.AuditInfo.UpdateDate 
            return string.Join(" and ", sortCollection.Select(x => GetFilter(x, useSiteContext) + (x.IsAscending ? " asc" : " desc")));
        }
        
        private static string GetFilter(SortingCollectionItem item, bool useSiteContext)
        {
            switch (item.property.ToLowerInvariant())
            {
                case "productcode":
                    return PRODUCT_CODE_PROPERTY;
                case "stockavailable":
                    return STOCK_AVAILABLE_PROPERTY;
                case "stockreserved":
                    return STOCK_ON_BACKORDER_PROPERTY;
                case "stockonhand":
                    return STOCK_ON_HAND_PROPERTY;

                default:
                    throw new InvalidOperationException("unknown sort.property " + item.property);
            }
        }
    }
}