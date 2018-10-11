using System;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.CustomerHelpers
{
    internal static class CustomerSortExtensions
    {
        /// <summary>
        /// Converts a SortingCollection for Product to a mozu services-compatible sort string.
        /// </summary>
        /// <param name="useSiteContext">
        /// By default, sort occurs on global-level content or price parameters.
        /// Pass true to force sort on content and price fields nested inside ProductInCatalogs.
        /// </param>
        public static string ToSortString(this SortingCollection sortCollection, bool useSiteContext = false)
        {
            return sortCollection == null
                ? null
                : string.Join(" and ", sortCollection.Select(x => $"{GetFilter(x)} {GetDirection(x)}"));
        }

        private static string GetDirection(SortingCollectionItem item)
        {
            var direction = item.direction.ToLower();
            if (direction == "desc" || direction == "asc")
            {
                return direction;
            }

            return item.IsAscending ? " asc" : " desc";
        }

        private static string GetFilter(SortingCollectionItem item)
        {
            if (item.property.StartsWith("primary", StringComparison.OrdinalIgnoreCase))
            {
                return "contact." + item.property.Substring("primary".Length);
            }
            var propName = item.property.ToLowerInvariant().Replace("safe", "");
            switch (propName)
            {
                case "id":
                    return "id";
                case "externalid":
                    return "id";
                case "userid":
                    return "userid";
                case "isactive":
                    return "isactive";
                case "companyororganization":
                    return "companyororganization";
                case "wishlistcount":
                    return "commercesummary.wishlistcount";
                case "ordercount":
                    return "commercesummary.ordercount";
                case "totalspent":
                    return "commercesummary.totalorderamount";
                case "createdate":
                    return "createdate";
                case "commercesummary.lastorderdate":
                    return "lastorderdate";
                default:
                    return propName;
            }
        }
    }
}