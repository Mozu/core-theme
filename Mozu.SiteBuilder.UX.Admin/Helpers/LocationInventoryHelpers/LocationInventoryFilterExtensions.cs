using System;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.LocationInventoryHelpers
{
    public static class LocationInventoryFilterExtensions
    {
        private const string PRODUCT_NAME = "productname";
        private const string BASE_PRODUCT_CODE = "baseproductcode";
        private const string PRODUCT_CODE = "productcode";
        private const string LOCATION_CODE = "locationcode";

        /// <summary>
        /// Converts a FilterCollection for LocationInventory to a mozu services-compatible filter string.
        /// </summary>
        public static string ToFilterString(this FilterCollection extFilter)
        {
            var statements = extFilter.Where(x => x.property != "all").Select(GetFilter).ToList();
            var allFilter = extFilter.FirstOrDefault(x => x.property == "all");
            if (allFilter != null)
                statements.Add(String.Format("({1} sw {0} or {2} sw {0} or {3} sw {0})", allFilter.value, PRODUCT_CODE, LOCATION_CODE, PRODUCT_NAME));

            return string.Join(" and ", statements);
        }

        private static string GetFilter(FilterCollectionItem filter)
        {
            switch (filter.property.ToLowerInvariant())
            {
                case "productname":
                    return string.Format("({1} sw {0})", filter.value, PRODUCT_NAME);
                case "baseproductcode":
                    return string.Format("({1} {2} {0})", filter.value, BASE_PRODUCT_CODE, filter.comparison == "sw" ? "sw" : "eq");
                case "productcode":
                    return string.Format("({1} {2} {0})", filter.value, PRODUCT_CODE, filter.comparison == "sw" ? "sw" : "eq");
                case "locationcode":
                    return string.Format("({1} {2} {0})", filter.value, LOCATION_CODE, filter.comparison == "sw" ? "sw" : "eq");
                default:
                    throw new NotImplementedException("unable to filter on property " + filter.property);
            }
        }
    }
}
