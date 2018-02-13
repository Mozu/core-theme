using System;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.AttributeHelpers
{
    internal static class AttributeSortExtensions
    {

        private const string ADMIN_NAME = "adminname";
        private const string CONTENT_NAME = "content.name";
        private const string ATTRIBUTE_CODE = "attributecode";
        private const string IS_ACTIVE = "isactive";
        private const string CREATE_DATE = "createDate";
        private const string DELIVERY_STATUS = "processStatus";



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
                case "adminname":
                    return ADMIN_NAME;
                case "name":
                    return CONTENT_NAME;
                case "code":
                    return ATTRIBUTE_CODE;
                case "isactive":
                    return IS_ACTIVE;
                case "createdate":
                    return CREATE_DATE;
                case "executiondate":
                    return CREATE_DATE;
                case "deliverystatus":
                    return DELIVERY_STATUS;
                default:
                    throw new InvalidOperationException("unknown sort.property " + item.property);
            }
        }
    }
}