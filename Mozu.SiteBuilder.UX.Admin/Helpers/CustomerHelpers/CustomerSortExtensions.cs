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
            if (sortCollection == null)
                return null;

            return string.Join(" and ", sortCollection.Select(x => GetFilter(x, useSiteContext) + (x.IsAscending ? " asc" : " desc")));
        }

        private static string GetFilter(SortingCollectionItem item, bool useSiteContext)
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
                //case "firstname":
                //    return "contact.firstname";
                //case "lastname":
                //    return "contact.lastname";
                //case "emailaddress":
                //    return "contact.emailaddress";
                default:
                    return propName;
            }
        }
    }
}