using System;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.PriceListHelpers
{
    internal static class PriceListSortExtensions
    {
        private const string NAME_PROPERTY = "name";
        private const string CODE_PROPERTY = "priceListcode";
        private const string PARENT_CODE_PROPERTY = "parentPriceListCode";
        private const string ENABLED_PROPERTY = "enabled";
        private const string CREATE_DATE_PROPERTY = "auditinfo.createdate";
        private const string UPDATE_DATE_PROPERTY = "auditinfo.updatedate";


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
                case "code":
                    return CODE_PROPERTY;
                case "parentcode":
                    return PARENT_CODE_PROPERTY;
                case "name":
                    return NAME_PROPERTY;
                case "status":
                    return ENABLED_PROPERTY;
                case "createdate":
                    return CREATE_DATE_PROPERTY;
                case "lastmodifieddate":
                    return UPDATE_DATE_PROPERTY;

                default:
                    throw new InvalidOperationException("unknown sort.property " + item.property);
            }
        }
    }
}