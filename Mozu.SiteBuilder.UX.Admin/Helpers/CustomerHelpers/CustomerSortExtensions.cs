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
            switch (item.property.ToLowerInvariant())
            {
                default:
                    throw new InvalidOperationException("unknown sort.property " + item.property);
            }
        }
    }
}