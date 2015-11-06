using System;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.ProductHelpers
{
    internal static class ProductSortExtensions
    {
        private const string PRODUCT_CODE_PROPERTY = "productCode";
        private const string GLOBAL_PRODUCT_NAME_PROPERTY = "content.productName";
        private const string GLOBAL_PRICE_PROPERTY = "price.price";
        private const string GLOBAL_SALE_PRICE_PROPERTY = "price.saleprice";
        private const string SITE_PRODUCT_NAME_PROPERTY = "productincatalogs.content.productName";
        private const string SITE_PRICE_PROPERTY = "productincatalogs.price.price";
        private const string SITE_SALE_PRICE_PROPERTY = "productincatalogs.price.saleprice";
        private const string CATEGORY_ID_PROPERTY = "productincatalogs.productcategories.categoryId";
        private const string IS_ACTIVE_PROPERTY = "productincatalogs.isActive";
        private const string STOCK_ON_HAND_PROPERTY = "stockOnHand";
        private const string STOCK_AVAILABLE_PROPERTY = "stockAvailable";
        private const string CREATE_DATE_PROPERTY = "createDate";
        private const string UPDATE_DATE_PROPERTY = "updateDate";
        private const string PUBLISH_TYPE = "publishType";
        private const string PUBLISH_SET_CODE = "code";
        private const string PUBLISH_DATE = "publishDate";
        private const string PUBLISH_STATUS = "status";
        

        /// <summary>
        /// Converts a SortingCollection for Product to a mozu services-compatible sort string.
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
                case "categoryids":
                    return CATEGORY_ID_PROPERTY;
                case "isactive":
                    return IS_ACTIVE_PROPERTY;
                case "productname":
                case "name":
                    return useSiteContext ? SITE_PRODUCT_NAME_PROPERTY : GLOBAL_PRODUCT_NAME_PROPERTY;
                case "saleprice":
                    return useSiteContext ? SITE_SALE_PRICE_PROPERTY : GLOBAL_SALE_PRICE_PROPERTY;
                case "price":
                    return useSiteContext ? SITE_PRICE_PROPERTY : GLOBAL_PRICE_PROPERTY;
                case "productcode":
                    return PRODUCT_CODE_PROPERTY;
                case "stockonhand":
                    return STOCK_ON_HAND_PROPERTY;
                case "stockavailable":
                    return STOCK_AVAILABLE_PROPERTY;
                case "lastmodifieddate":
                case "updatedate":
                    return UPDATE_DATE_PROPERTY;
                case "createdate":
                    return CREATE_DATE_PROPERTY;
                case "publishsetcode":
                case "code":
                    return PUBLISH_SET_CODE;
                case "publishdate":
                    return PUBLISH_DATE;
                case "status":
                    return PUBLISH_STATUS;
                default:
                    throw new InvalidOperationException("unknown sort.property " + item.property);
            }
        }
    }
}