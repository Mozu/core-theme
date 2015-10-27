using System;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.PublishSetHelpers
{
    internal static class PublishSetSortExtensions
    {

        private const string CODE_PROPERTY = "code";
        private const string NAME_PROPERTY = "name";        
        private const string PUBLISH_DATE_PROPERTY = "publishdate";
        private const string STATUS_PROPERTY = "status";        
        private const string CREATE_DATE_PROPERTY = "createdate";        
        private const string UPDATE_DATE_PROPERTY = "updatedate";


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
                return NAME_PROPERTY + " desc";

            return string.Join(" and ", sortCollection.Select(x => GetFilter(x) + (x.IsAscending ? " asc" : " desc")));
        }

        private static string GetFilter(SortingCollectionItem item)
        {
            switch (item.property.ToLowerInvariant())
            {

                case "code":
                    return CODE_PROPERTY;
                case "publishsetname":
                    return NAME_PROPERTY;
                case "name":
                    return NAME_PROPERTY;
                case "publishDate":
                    return PUBLISH_DATE_PROPERTY;
                case "status":
                    return STATUS_PROPERTY;
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