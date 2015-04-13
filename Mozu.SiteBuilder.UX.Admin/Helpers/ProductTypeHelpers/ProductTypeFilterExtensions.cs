using System;
using System.Configuration;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.ProductTypeHelpers
{
    internal static class ProductTypeFilterExtensions
    {
        private const string PRODUCTTYPE_ID_PROPERTY = "id";
        private const string PRODUCTTYPE_NAME_PROPERTY = "name";
        private const string IS_BASE_PRODUCTTYPE_PROPERTY = "isbaseproducttype";

        /// <summary>
        /// Converts a FilterCollection for ProductType to a mozu services-compatible filter string.
        /// </summary>
        public static string ToFilterString(this FilterCollection extFilter)
        {
            if (extFilter == null || extFilter.Count == 0)
                return null;

            return String.Join(" and ", extFilter.Select(GetFilter));
        }

        private static string GetFilter(FilterCollectionItem filter)
        {
            int tmpInt;
            // if you pass a string as an id to the product type service it will throw an exception;
            var valueIsInt = int.TryParse(filter.value.ToString(), out tmpInt);
            switch (filter.property.ToLowerInvariant())
            {
                case "all":
                    var str = "";
                    str += String.Format("{1} cont {0}", filter.escapedValue, PRODUCTTYPE_NAME_PROPERTY);
                    if (valueIsInt)
                    {
                        str += String.Format(" or {1} eq '{0}'", filter.value, PRODUCTTYPE_ID_PROPERTY);    
                    }
                    return str;
                case "id":
                    return String.Format("{2} {1} {0}", filter.value, filter.comparison, PRODUCTTYPE_ID_PROPERTY);
                case "name":
                    return String.Format("{1} cont \"{0}\"", filter.escapedValue, PRODUCTTYPE_NAME_PROPERTY);
                case "isbase":
                    return String.Format("{1} eq {0}", filter.value, IS_BASE_PRODUCTTYPE_PROPERTY);
            }
            return "";
        }
    }
}