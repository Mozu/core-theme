using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.ReturnHelpers
{
    internal static class ReturnSortExtensions
    {
        /// <summary>
        /// Converts a SortingCollection for Product to a mozu services-compatible sort string.
        /// </summary>
        public static string ToSortString(this SortingCollection sortCollection)
        {
            if (sortCollection == null || sortCollection.Count == 0)
            {
                return null;
            }

            return string.Join(" and ", sortCollection.Select(item => $"{GetFilter(item)} {GetDirection(item)}"));
        }

        private static string GetDirection(SortingCollectionItem item)
        {
            // doing this because IsAscending can be sent as true even if direction is desc
            return item.direction == "desc" ? "desc" : (item.IsAscending ? "asc" : "desc");
        }

        private static string GetFilter(SortingCollectionItem item)
        {
            switch (item.property.ToLowerInvariant())
            {
                default:
                    return item.property.ToLowerInvariant();
            }
        }
    }
}