using System;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.CategoryHelpers
{
    internal static class CategorySortExtensions
    {
        private const string PARENT_ID = "parentcategoryid";
        private const string ID = "id";
        private const string SEQUENCE = "sequence";
        private const string CATEGORY_CODE = "categorycode";
        private const string CREATE_DATE = "createdate";
        private const string UPDATE_DATE = "updatedate";

        /// <summary>
        /// Converts a SortingCollection for Product to a mozu services-compatible sort string.
        /// </summary>
        /// <param name="useSiteContext">
        /// By default, sort occurs on global-level content or price parameters.
        /// Pass true to force sort on content and price fields nested inside ProductInCatalogs.
        /// </param>
        public static string ToSortString(this SortingCollection sortCollection, bool useSiteContext = false)
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
                case "id":
                    return ID;
                case "categorycode":
                    return CATEGORY_CODE;
                case "parentcode":
                    return PARENT_ID;
                case "sequence":
                    return SEQUENCE;
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