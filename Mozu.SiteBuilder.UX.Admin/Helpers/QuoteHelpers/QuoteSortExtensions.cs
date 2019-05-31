using System;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.QuoteHelpers
{
    internal static class QuoteSortExtensions
    {
        /// <summary>
        /// Converts a SortingCollection for wishlist to a mozu services-compatible sort string.
        /// </summary>
        public static string ToSortString(this SortingCollection sortCollection)
        {
            if (sortCollection == null || sortCollection.Count == 0)
                return "createDate desc";

            return string.Join(" and ", sortCollection.Select(x => GetFilter(x) + (x.IsAscending ? " asc" : " desc")));
        }

        private static string GetFilter(SortingCollectionItem item)
        {
            switch (item.property.ToLowerInvariant())
            {
                case "name":
                    return "name";

                case "createDate":
                    return "createDate";

                default:
                    return item.property.ToLowerInvariant();
            }
        }
    }
}