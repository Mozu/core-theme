using System;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.ProductHelpers
{
    internal static class ProductFilterExtensions
    {
        private const string PRODUCT_NAME_PROPERTY = "productinsites.content.productName";
        private const string PRODUCT_CODE_PROPERTY = "productCode";
        private const string PRICE_PROPERTY = "productinsites.price.price";
        private const string CATEGORY_ID_PROPERTY = "productinsites.productcategories.categoryId";
        private const string IS_ACTIVE_PROPERTY = "productinsites.isActive";
        private const string STOCK_ON_HAND_PROPERTY = "stockOnHand";
        private const string SITE_ID_PROPERTY = "productinsites.siteId";

        /// <summary>
        /// Converts a FilterCollection for Product to a mozu services-compatible filter string.
        /// </summary>
        public static string ToFilterString(this FilterCollection extFilter)
        {
            if (extFilter == null || extFilter.Count == 0)
                return null;

            // TODO: commenting out this next part. I can't find any way from EXT to make "query" happen.
            // if (!string.IsNullOrEmpty(extFilter.query))
            //     extFilter.Add(new FilterCollectionItem { comparison = "cont", field = PropertyGuy.Convert(x => x.Content.ProductName), value = extFilter.query });

            return string.Join(" and ", extFilter.Select(GetFilter));
        }

        private static string GetFilter(FilterCollectionItem filter)
        {
            switch (filter.property.ToLowerInvariant())
            {
                case "categoryids":
                    return string.Format("{2} {1} {0}", filter.value, filter.comparison);
                case "isactive":
                    return string.Format("{2} {1} {0}", filter.value, filter.comparison, IS_ACTIVE_PROPERTY);
                case "productname":
                case "name":
                    return string.Format("({1} cont \"{0}\" or {2} cont \"{0}\")", filter.value, PRODUCT_NAME_PROPERTY, PRODUCT_CODE_PROPERTY);
                case "price":
                    return string.Format("{2} {1} {0}", filter.value, filter.comparison, PRICE_PROPERTY);
                case "stockonhand":
                    return string.Format("{2} {1} {0}", filter.value, filter.comparison, STOCK_ON_HAND_PROPERTY);
                case "siteid":
                    return string.Format("{1} eq {0}", filter.value, SITE_ID_PROPERTY);
            }
            return "";
        }
    }
}