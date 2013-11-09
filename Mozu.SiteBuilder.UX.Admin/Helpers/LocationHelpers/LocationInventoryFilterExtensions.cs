using System;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.LocationHelpers
{
    public static class LocationInventoryFilterExtensions
    {
        private const string PRODUCT_NAME = "productname";
        private const string PRODUCT_CODE = "productcode";
        private const string LOCATION_NAME = "locationname";
        private const string LOCATION_CODE = "locationcode";

        /// <summary>
        /// Converts a FilterCollection for LocationInventory to a mozu services-compatible filter string.
        /// </summary>
        public static string ToFilterString(this FilterCollection extFilter)
        {
            var statements = extFilter.Where(x => x.property != "all").Select(GetFilter).ToList();
            var allFilter = extFilter.FirstOrDefault(x => x.property == "all");
            //if (allFilter != null)
            //    statements.Add(String.Format("({1} cont {0} or {2} cont {0} or {3} cont {0} or {4} cont {0} or {5} cont {0} or {6} cont {0})", allFilter.value, NAME, STATE, COUNTRYCODE, ZIPCODE, CODE, LOCATIONTYPECODE));

            return string.Join(" and ", statements);
        }

        private static string GetFilter(FilterCollectionItem filter)
        {
            switch (filter.property.ToLowerInvariant())
            {
                case "productname":
                    return string.Format("({1} cont {0})", filter.value, PRODUCT_NAME);
                case "productcode":
                    return string.Format("({1} eq {0})", filter.value, PRODUCT_CODE);
                case "locationname":
                    return string.Format("({1} cont {0})", filter.value, LOCATION_NAME);
                case "locationcode":
                    return string.Format("({1} eq {0})", filter.value, LOCATION_CODE);
                default:
                    throw new NotImplementedException("unable to filter on property " + filter.property);
            }
        }
    }
}
