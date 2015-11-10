using System;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.PublishSetHelpers
{
    internal static class PublishSetSortExtensions
    {

        private const string CODE_PROPERTY = "code";
        private const string NAME_PROPERTY = "name";
        private const string PRODUCT_NAME = "content.productname";    
        private const string PUBLISH_DATE_PROPERTY = "publishdate";
        private const string STATUS_PROPERTY = "status";        
        private const string CREATE_DATE_PROPERTY = "createdate";        
        private const string UPDATE_DATE_PROPERTY = "updatedate";
        private const string PUBLISH_LAST_PUBLISHED_DATE = "lastpublisheddate";
        private const string PUBLISH_SET_CODE = "publishsetcode";

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
                return null;

            return string.Join(" and ", sortCollection.Select(x => GetFilter(x) + (x.IsAscending ? " asc" : " desc")));
        }

        private static string GetFilter(SortingCollectionItem item)
        {
            switch (item.property.ToLowerInvariant())
            {
                case "code":
                    return CODE_PROPERTY;
                case "publishsetcode":
                    return PUBLISH_SET_CODE;
                case "name":
                case "publishsetname":
                    return NAME_PROPERTY;
                case "publishdate":
                    return PUBLISH_DATE_PROPERTY;
                case "status":
                    return STATUS_PROPERTY;
                case "createdate":
                    return CREATE_DATE_PROPERTY;
                case "updatedate":
                    return UPDATE_DATE_PROPERTY;
                case "productname":
                    return PRODUCT_NAME;
                case "lastpublishdate":
                    return PUBLISH_LAST_PUBLISHED_DATE;

                default:
                   return item.property.ToLowerInvariant();
            }
        }
    }
}