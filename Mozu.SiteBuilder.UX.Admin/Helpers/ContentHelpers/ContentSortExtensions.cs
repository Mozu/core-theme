using System;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.ContentHelpers
{
    internal static class ContentSortExtensions
    {

        private const string CONTENT_NAME = "name";
        private const string UPDATE_DATE = "updateDate";

        /// <summary>
        /// Converts a SortingCollection for Content to a mozu services-compatible sort string.
        /// </summary>
        /// <param name="useSiteContext">
        /// By default, sort occurs on global-level content or price parameters.
        /// Pass true to force sort on content and price fields nested inside ProductInCatalogs.
        /// </param>
        public static string ToContentSortString(this SortingCollection sortCollection, bool useSiteContext = false)
        {
            if (sortCollection == null)
                return null;
            //Mozu.ProductAdmin.Contracts.Product p;
            //p.AuditInfo.UpdateDate 
            return string.Join(" and ", sortCollection.Select(x => GetFilter(x, useSiteContext) + (x.IsAscending ? " asc" : " desc")));
        }



        private static string GetFilter(SortingCollectionItem item, bool useSiteContext)
        {
            switch (item.property.ToLowerInvariant())
            {
                case "name":
                    return CONTENT_NAME;
                case "draftupdatedate":
                    return UPDATE_DATE;

                default:
                    throw new InvalidOperationException("unknown sort.property " + item.property);
            }
        }
    }
}