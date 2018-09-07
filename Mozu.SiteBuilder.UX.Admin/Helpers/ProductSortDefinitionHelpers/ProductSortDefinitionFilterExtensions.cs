using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.ProductSortDefinitionHelpers
{
    internal static class ProductSortDefinitionFilterExtensions
    {
        private const string CATEGORY_ID = "categoryid";
        private const string CREATE_DATE = "createdate";
        private const string UPDATE_DATE = "updatedate";
        private const string CREATE_BY = "createby";
        private const string UPDATE_BY = "updateby";

        /// <summary>
        /// Converts a FilterCollection for a ProductSortDefinition to a mozu services-compatible filter string.
        /// </summary>
        public static string ToFilterString(this FilterCollection extFilter)
        {
            if (extFilter == null || extFilter.Count == 0)
            {
                return null;
            }

            return string.Join(" and ", extFilter.Select(GetFilter).Where(s => !string.IsNullOrEmpty(s)));
        }

        private static string GetFilter(FilterCollectionItem filter)
        {
            switch (filter.property.ToLowerInvariant())
            {
                case "categoryid":
                    return $"{CATEGORY_ID} {filter.comparison} \"{filter.escapedValue}\"";

                case "createby":
                    return $"{CREATE_BY} {filter.comparison} \"{filter.escapedValue}\"";

                case "updateby":
                    return $"{UPDATE_BY} {filter.comparison} \"{filter.escapedValue}\"";

                case "createdate":
                    return $"{CREATE_DATE} {filter.comparison} \"{filter.escapedValue}\"";

                case "updatedate":
                    return $"{UPDATE_DATE} {filter.comparison} \"{filter.escapedValue}\"";

                default:
                    return "";
            }
        }
    }
}