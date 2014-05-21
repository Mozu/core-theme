using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using Mozu.Core.Collections.Filtering;
using Mozu.Location.Contracts;
using Mozu.ProductAdmin.Contracts;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public interface IProductAvailableInventoryHelper
    {
        List<LocationWithInventory> GetShipAndPickupLocationsWithInventory(
            ProductAdmin.Contracts.LocationInventoryCollection inventories, List<Location.Contracts.Location> locations,
            ProductAdmin.Contracts.Product product);
    }

    public class ProductAvailableInventoryHelper : IProductAvailableInventoryHelper
    {
        /// <summary>
        /// Provide inventory by location based on following logic.  
        /// If location supports multiple fulfillment type
        ///     then duplicates LocationWithInventory with different FulfillmentType.
        /// Sorts on Direct ship, 
        /// 
        /// manage stock    out of stock behavior                       inv         show
        /// ------------    ---------------------                       ---         ----
        //  true            DisplayMsg, HideProduct                     0           false
        //  true            DisplayMsg, HideProduct, AllowBack          > 0         true
        //  true            AllowBackorder                              0           true
        //  false           DisplayMsg, HideProduct, AllowBack          >0          true
        //  false           DisplayMsg, HideProduct, AllowBack          0           true
        //
        /// </summary>
        /// <param name="inventories"></param>
        /// <param name="locations"></param>
        /// <param name="product"></param>
        /// <returns></returns>
        public List<LocationWithInventory> GetShipAndPickupLocationsWithInventory(ProductAdmin.Contracts.LocationInventoryCollection inventories, List<Location.Contracts.Location> locations, ProductAdmin.Contracts.Product product)
        {
            //converts to sb.
            var locationsWithInventory = inventories.Items.Map<List<LocationWithInventory>>();

            var fulfillmentComparer = new LocationWithInventoryFulfillmentComparer();
            
            locationsWithInventory.ForEach(lwi => lwi.Location = locations.FirstOrDefault(l => l.Code == lwi.LocationCode));
            var result = new List<LocationWithInventory>();
            foreach (var locWithInv in locationsWithInventory
                .Where(locWithInv => (!product.InventoryInfo.ManageStock.HasValue || !product.InventoryInfo.ManageStock.Value) 
                                     || (product.InventoryInfo.OutOfStockBehavior != ProductInventoryInfo.OutOfStockBehaviorConst.DisplayMessage && product.InventoryInfo.OutOfStockBehavior != ProductInventoryInfo.OutOfStockBehaviorConst.HideProduct) 
                                     || (locWithInv.StockAvailable > 0)).Where(locWithInv => locWithInv.Location != null && locWithInv.Location.FulfillmentTypes != null))
            {
                result.AddRange(locWithInv.Location.FulfillmentTypes.Select(fulfillment => new LocationWithInventory
                {
                    Location = locWithInv.Location, 
                    AuditInfo = locWithInv.AuditInfo, 
                    Fulfillment = fulfillment, 
                    LocationCode = locWithInv.LocationCode, 
                    ProductCode = locWithInv.ProductCode, 
                    ProductName = locWithInv.ProductName, 
                    StockAvailable = locWithInv.StockAvailable, 
                    StockOnBackOrder = locWithInv.StockOnBackOrder, 
                    StockOnHand = locWithInv.StockOnHand
                }));
            }
            result.Sort(fulfillmentComparer);
            return result;
        }
    }

    /// <summary>
    /// used to sort 1. DirectShip, 2. Location, 3. Other
    /// </summary>
    public class LocationWithInventoryFulfillmentComparer : IComparer<LocationWithInventory>
    {
        public int Compare(LocationWithInventory x, LocationWithInventory y)
        {
            if (x.Fulfillment.Code == y.Fulfillment.Code)
            {
                //could do secondary sort on Inv. desc.
                return 0;
            }
            if (x.Fulfillment.Code == FulfillmentTypeConstants.DirectShip.Code &&
                y.Fulfillment.Code == FulfillmentTypeConstants.InStorePickup.Code)
                return -1;
            if (x.Fulfillment.Code == FulfillmentTypeConstants.InStorePickup.Code &&
                y.Fulfillment.Code == FulfillmentTypeConstants.DirectShip.Code)
                return 1;
            return 1;
        }
    }

}