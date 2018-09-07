using System;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.ProductSortDefinitionHelpers
{
    internal static class ProductSortDefinitionSortExtensions
    {
        private const string CATEGORY_ID = "categoryid";
        private const string NAME = "name";
        private const string START_DATE = "startdate";
        private const string END_DATE = "enddate";
        private const string CREATE_DATE = "createdate";
        private const string UPDATE_DATE = "updatedate";

        /// <summary>
        /// Converts a SortingCollection for ProductSortDefinition to a mozu services-compatible sort string.
        /// </summary>
        /// <param name="useSiteContext">
        /// By default, sort occurs on global-level content or price parameters.
        /// Pass true to force sort on content and price fields nested inside ProductInCatalogs.
        /// </param>
        public static string ToSortString(this SortingCollection sortCollection, bool useSiteContext = false)
        {
            return sortCollection == null
                ? null
                : string.Join(" and ",
                    sortCollection.Select(item => GetFilter(item) + (item.IsAscending ? " asc" : " desc")));
        }

        private static string GetFilter(SortingCollectionItem item)
        {
            switch (item.property.ToLowerInvariant())
            {
                case "categoryid":
                    return CATEGORY_ID;
                case "name":
                    return NAME;
                case "startdate":
                    return START_DATE;
                case "enddate":
                    return END_DATE;
                case "createdate":
                    return CREATE_DATE;
                case "lastmodifieddate":
                    return UPDATE_DATE;

                default:
                    throw new InvalidOperationException("unknown sort.property " + item.property);
            }
        }
    }
}