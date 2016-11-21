using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.OrderHelpers
{
    internal static class OrderSortExtensions
    {
        /// <summary>
        /// Converts a SortingCollection for orders to a mozu services-compatible sort string.
        /// </summary>
        public static string ToSortString(this SortingCollection sortCollection)
        {
            if (sortCollection == null || sortCollection.Count == 0)
                return "ordernumber desc";

            return string.Join(" and ", sortCollection.Select(x => GetFilter(x) + (x.IsAscending ? " asc" : " desc")));
        }

        private static string GetFilter(SortingCollectionItem item)
        {
            switch (item.property.ToLowerInvariant())
            {
                case "ordertype":
                    return "type";

                default:
                    return item.property.ToLowerInvariant();
            }
        }
    }
}