using System.Linq;
using Mozu.Core.Extensions;
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
            return sortCollection.IsNullOrEmpty()
                ? "ordernumber desc" // default sort
                : string.Join(" and ", sortCollection.Select(item => $"{GetFilter(item)} {GetDirection(item)}"));
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
                case "ordertype":
                    return "type";

                default:
                    return item.property.ToLowerInvariant();
            }
        }
    }
}