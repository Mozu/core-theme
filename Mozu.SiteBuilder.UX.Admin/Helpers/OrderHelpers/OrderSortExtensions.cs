using System;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.OrderHelpers
{
    internal static class OrderSortExtensions
    {
        private const string ORDER_ID_PROPERTY = "orderid";
        private const string ORDER_NUMBER_PROPERTY = "ordernumber";
        private const string FIRST_NAME_PROPERTY = "billingContact.firstName";
        private const string LAST_NAME_PROPERTY = "billingcontact.lastName";
        private const string CREATE_DATE_PROPERTY = "createDate";
        private const string TOTAL_PROPERTY = "total";
        private const string SHIPPING_STATUS_PROPERTY = "shipmentStatus";
        private const string ORDER_STATUS_PROPERTY = "status";

        /// <summary>
        /// Converts a SortingCollection for Product to a mozu services-compatible sort string.
        /// </summary>
        /// <param name="useSiteContext">
        /// By default, sort occurs on global-level content or price parameters.
        /// Pass true to force sort on content and price fields nested inside ProductInCatalogs.
        /// </param>
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