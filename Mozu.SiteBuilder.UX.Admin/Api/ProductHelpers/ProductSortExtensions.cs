using System;
using System.Linq.Expressions;
using System.ServiceModel;
using System.Text;
using System.Web.Mvc;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using DC = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.ProductHelpers
{
    internal static class ProductSortExtensions
    {
        private const string PRODUCT_CODE_PROPERTY = "productCode";
        private const string GLOBAL_PRODUCT_NAME_PROPERTY = "content.productName";
        private const string GLOBAL_PRICE_PROPERTY = "price.price";
        private const string SITE_PRODUCT_NAME_PROPERTY = "productinsites.content.productName";
        private const string SITE_PRICE_PROPERTY = "productinsites.price.price";
        private const string CATEGORY_ID_PROPERTY = "productinsites.productcategories.categoryId";
        private const string IS_ACTIVE_PROPERTY = "productinsites.isActive";
        private const string STOCK_ON_HAND_PROPERTY = "stockOnHand";

        /// <summary>
        /// Converts a SortingCollection for Product to a mozu services-compatible sort string.
        /// </summary>
        /// <param name="useSiteContext">
        /// By default, sort occurs on global-level content or price parameters.
        /// Pass true to force sort on content and price fields nested inside ProductInSites.
        /// </param>
        public static string ToSortString(this SortingCollection sortCollection, bool useSiteContext = false)
        {
            if (sortCollection == null)
                return null;

            var sb = new StringBuilder();

            foreach (SortingCollectionItem sort in sortCollection)
            {
                if (sb.Length > 0)
                {
                    sb.Append(" and ");
                }

                switch (sort.property.ToLowerInvariant())
                {
                    case "categoryids":
                        sb.Append(CATEGORY_ID_PROPERTY);
                        break;
                    case "isactive":
                        sb.Append(IS_ACTIVE_PROPERTY);
                        break;
                    case "productname":
                    case "name":
                        sb.Append(useSiteContext ? SITE_PRODUCT_NAME_PROPERTY : GLOBAL_PRODUCT_NAME_PROPERTY);

                        break;
                    case "saleprice":
                    case "price":
                        sb.Append(useSiteContext ? SITE_PRICE_PROPERTY : GLOBAL_PRICE_PROPERTY);

                        break;
                    case "productcode":
                        sb.Append(PRODUCT_CODE_PROPERTY);
                        break;
                    case "stockonhand":
                        sb.Append(STOCK_ON_HAND_PROPERTY);
                        break;
                    default:
                        {
                            throw new InvalidOperationException("unknown sort.property " + sort.property);
                        }
                }
                sb.Append(sort.IsAscending ? " asc" : " desc");
            }

            return sb.ToString();
        }

    }
}