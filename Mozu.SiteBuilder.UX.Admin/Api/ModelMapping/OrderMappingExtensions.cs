using System;
using System.Collections.Generic;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    /// <summary>
    /// A collection of Extension methods to help order mapping.
    /// </summary>
    public static class OrderMappingExtensions
    {
        public static int GetDesiredQuantityByFulfillmentMethod(this Order order, string productCode, string fulfillmentMethod)
        {
            int unbundledQuantity =
                (from orderItem in order.Items
                 where orderItem.ProductCode == productCode
                 where orderItem.FulfillmentMethod == fulfillmentMethod
                 select orderItem.Quantity
                ).Sum();

            int bundledQuantity =
                (from parentItem in order.Items
                 from bundleItem in parentItem.BundledProducts
                 where bundleItem.ProductCode == productCode
                 where parentItem.FulfillmentMethod == fulfillmentMethod
                 select parentItem.Quantity * bundleItem.Quantity
                ).Sum();

            return unbundledQuantity + bundledQuantity;
        }

        public static string GetProductName(this Order order, string productCode)
        {
            var item = order.Items.FirstOrDefault(i => i.ProductCode == productCode);
            if (item != null)
                return item.ProductName;

            var bundleItem = order.Items.SelectMany(i => i.BundledProducts).First(bi => bi.ProductCode == productCode);
            return bundleItem.Name;
        }

        public static bool IsProductPackagedStandAlone(this Order order, string productCode)
        {
            var item = order.Items.FirstOrDefault(i => i.ProductCode == productCode);
            if (item != null)
                return item.IsPackagedStandAlone;

            var bundleItem = order.Items.SelectMany(i => i.BundledProducts).First(bi => bi.ProductCode == productCode);
            return bundleItem.IsPackagedStandAlone;
        }

        public static decimal? GetUnitWeight(this Order order, string productCode)
        {
            var item = order.Items.FirstOrDefault(i => i.ProductCode == productCode);
            if (item != null)
                return item.UnitWeight;

            var bundleItem = order.Items.SelectMany(i => i.BundledProducts).FirstOrDefault(bi => bi.ProductCode == productCode);
            return bundleItem.UnitWeight;
        }

        /// <summary>
        /// get a single location code by fulfillment type. This is handy for fulfillmentType = DirectShip, which can only originate from one location.
        /// </summary>
        public static string GetAFulfillmentLocationCodeByFulfillmentMethod(this Order order, string productCode, string fulfillmentMethod)
        {
            return
                (from i in order.Items
                 where (i.ProductCode == productCode || (i.BundledProducts != null && i.BundledProducts.Any(bp => bp.ProductCode == productCode)))
                 where i.FulfillmentMethod == fulfillmentMethod
                 select i.FulfillmentLocationCode
                ).FirstOrDefault();
            //return order.Items.First(i => i.ProductCode == productCode || (i.BundledProducts != null && i.BundledProducts.Any(bi => bi.ProductCode == productCode))).FulfillmentLocationCode;
        }

        /// <summary>
        /// get all fulfillment locations for a fulfillment method. This applies to in-store pickup, which can have multiple locations.
        /// </summary>
        public static IDictionary<string, int> GetAllFulfillmentLocationCodeByFulfillmentMethod(this Order order, string productCode, string fulfillmentMethod)
        {
            return
                (from i in order.Items
                 where (i.ProductCode == productCode || (i.BundledProducts != null && i.BundledProducts.Any(bp => bp.ProductCode == productCode)))
                 where i.FulfillmentMethod == fulfillmentMethod
                 group i by i.FulfillmentLocationCode into g
                 select g
                ).ToDictionary(g => g.Key, g => g.Sum(i => i.Quantity));
        }

        public static int GetNumberOfPickedUpItemsByProductCodeAndLocationCode(this Order order, string productCode, string locationCode)
        {
            return
                (from p in order.Pickups
                 from i in p.Items
                 where p.FulfillmentLocationCode == locationCode
                 where i.ProductCode == productCode
                 select i.Quantity
                ).Sum();
        }

        public static decimal GetUnitPrice(this Order order, string productCode)
        {
            return order.Items.First(i => i.ProductCode == productCode || (i.BundledProducts != null && i.BundledProducts.Any(bi => bi.ProductCode == productCode))).UnitPrice;
        }

        /// <summary>
        /// Gets a single list of all the products ordered, 
        /// regardless of whether they are sold standalone or part of a bundle.
        /// </summary>
        public static List<string> GetAllProductsOrdered(this Order order)
        {
            return
                (
                  from i in order.Items
                  where i.ProductUsage != "Bundle"
                  select i.ProductCode
                )
                .Union
                (
                  from bp in order.Items.SelectMany(i => i.BundledProducts)
                  select bp.ProductCode
                )
                .Distinct()
                .ToList();
        }

        /// <summary>
        /// Get the total quantity of this product thath as been ordered. 
        /// Since line items can get split, we have to potentially sum multiple OrderItems.
        /// </summary>
        public static int GetItemCount(this Order order, string productCode)
        {
            int topLevelQty = order.Items.Where(i => i.ProductCode == productCode).Sum(i => i.Quantity);

            int bundledQty = order.Items.SelectMany(i => i.BundledProducts).Where(bi => bi.ProductCode == productCode).Sum(bi => bi.Quantity);

            return topLevelQty + bundledQty;
        }

        public static int GetFulfilledItemCount(this Order order, string productCode)
        {
            int packageCount = order.Packages.Where(p => p.Status == "Fulfilled").SelectMany(p => p.Items).Count(i => i.ProductCode == productCode);
            int pickupCount = order.Pickups.Where(p => p.Status == "Fulfilled").SelectMany(p => p.Items).Count(i => i.ProductCode == productCode);
            int digitalCount = order.DigitalPackages.Where(p => p.Status == "Fulfilled").SelectMany(p => p.Items).Count(i => i.ProductCode == productCode);

            return packageCount + pickupCount + digitalCount;
        }
    }
}