using System;
using System.Linq.Expressions;
using System.ServiceModel;
using System.Text;
using System.Web.Mvc;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using DC = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.ProductHelpers
{
    internal static class ProductFilterExtensions
    {
        private const string PRODUCT_NAME_PROPERTY = "productinsites.content.productName";
        private const string PRODUCT_CODE_PROPERTY = "productCode";
        private const string PRICE_PROPERTY = "productinsites.price.price";
        private const string CATEGORY_ID_PROPERTY = "productinsites.productcategories.categoryId";
        private const string IS_ACTIVE_PROPERTY = "productinsites.isActive";
        private const string STOCK_ON_HAND_PROPERTY = "stockOnHand";

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

            var sb = new StringBuilder();

            foreach (var filter in extFilter)
            {
                if (sb.Length > 0)
                {
                    sb.Append(" and ");
                }

                switch (filter.property.ToLowerInvariant())
                {
                    case "categoryids":
                        sb.AppendFormat("{2} {1} {0}", filter.value, filter.comparison);
                        break;
                    case "isactive":
                        sb.AppendFormat("{2} {1} {0}", filter.value, filter.comparison, IS_ACTIVE_PROPERTY);
                        break;
                    case "productname":
                    case "name":
                        sb.AppendFormat("({2} cont \"{0}\" or {3} cont \"{0}\")", filter.value, PRODUCT_NAME_PROPERTY, PRODUCT_CODE_PROPERTY);
                        break;
                    case "price":
                        sb.AppendFormat("{2} {1} {0}", filter.value, filter.comparison, PRICE_PROPERTY);
                        break;
                    case "stockonhand":
                        sb.AppendFormat("{2} {1} {0}", filter.value, filter.comparison, STOCK_ON_HAND_PROPERTY);
                        break;
                }
            }
            
            return sb.ToString();
        }
    }
}