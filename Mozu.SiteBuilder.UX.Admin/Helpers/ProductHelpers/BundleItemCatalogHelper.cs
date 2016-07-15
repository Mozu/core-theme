using System.Collections.Generic;
using System.Linq;
using DC = Mozu.ProductAdmin.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.ProductHelpers
{
    public interface IBundleItemCatalogHelper
    {
        List<ProductInCatalogInfo> MergeBundleItemsAndCatalogInfo(List<BundledProduct> mcBundledProducts,
            List<ProductInCatalogInfo> productInCatalogInfos, List<DC.Product> bundleItems);
    }

    public class BundleItemCatalogHelper : IBundleItemCatalogHelper
    {
        public List<ProductInCatalogInfo> MergeBundleItemsAndCatalogInfo(List<BundledProduct> mcBundledProducts, List<ProductInCatalogInfo> productInCatalogInfos, List<DC.Product> bundleItems)
        {
            var result = new List<ProductInCatalogInfo>(productInCatalogInfos);

            // flattens bundle items with product code and product in catalog info.
            var flatBundleItems = bundleItems.SelectMany(b => b.ProductInCatalogs.Select(p => new { b.ProductCode, p.CatalogId, p.Price.Price, p.Price.SalePrice, p.Content.ProductName }));

            //merges bundle products with catalog specific pricing & product name
            var mergedBundleProducts = 
                from bp in mcBundledProducts
                join fbi in flatBundleItems on bp.ProductCode equals fbi.ProductCode
                select new { fbi.CatalogId, Bp = new BundledProduct
                {
                    ProductCode = bp.ProductCode,
                    Quantity = bp.Quantity,
                    FulfillmentTypesSupported = bp.FulfillmentTypesSupported,
                    PackageHeight = bp.PackageHeight,
                    PackageLength = bp.PackageLength,
                    PackageWeight = bp.PackageWeight,
                    PackageWidth = bp.PackageWidth,
                                
                    ProductName = fbi.ProductName,
                    Price = fbi.Price,
                    SalePrice = fbi.SalePrice
                } };

            foreach (var pc in result)
            {
                pc.BundledProducts = mergedBundleProducts
                                        .Where(x => x.CatalogId == pc.CatalogId)
                                        .Select(x => x.Bp)
                                        .ToList();
            }
            return result;
        }
    }
}