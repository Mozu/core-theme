using System;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.CouponCodeHelpers
{
    internal static class CouponCodeSortExtensions
    {
        private const string COUPONSET_ID_PROPERTY = "couponsetid";
        private const string CODE_PROPERTY = "code";
        private const string CREATE_DATE_PROPERTY = "createdate";
        private const string UPDATE_DATE_PROPERTY = "updatedate";
        private const string CREATE_BY_PROPERTY = "createby";
        private const string UPDATE_BY_PROPERTY = "updateby";


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
                return CREATE_DATE_PROPERTY + " desc";

            return string.Join(" and ", sortCollection.Select(x => GetFilter(x) + (x.IsAscending ? " asc" : " desc")));
        }

        private static string GetFilter(SortingCollectionItem item)
        {
            switch (item.property.ToLowerInvariant())
            {

                /*
                 { name: 'couponSetCode', type: 'string' },
    { name: 'couponCode', type: 'string' },
    { name: 'canBeDeleted', type: 'boolean' },
    { name: 'redemptionCount', type: 'int' }
                 */
                
                case "couponcode":
                    return CODE_PROPERTY;
                case "createDate":
                    return CREATE_DATE_PROPERTY;
                case "updateDate":
                    return UPDATE_DATE_PROPERTY;
                default:
                   return item.property.ToLowerInvariant();
            }
        }
    }
}