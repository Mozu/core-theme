using System;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.LocationHelpers
{
    public static class LocationFilterExtensions
    {
        private const string NAME = "name";
        private const string STATE = "state";
        private const string COUNTRYCODE = "countrycode";
        private const string ZIPCODE  = "postalorzipcode";
        private const string CODE = "code";
        private const string LOCATIONTYPECODE = "locationtype.code";


        /// <summary>
        /// Converts a FilterCollection for Location to a mozu services-compatible filter string.
        /// </summary>
        public static string ToFilterString(this FilterCollection extFilter, bool? withVariations = null)
        {
            var statements = extFilter.Where(x => x.property != "all").Select(GetFilter).ToList();
            var allFilter = extFilter.FirstOrDefault(x => x.property == "all");
            if (allFilter != null)
                statements.Add(String.Format("({1} cont {0} or {2} cont {0} or {3} cont {0} or {4} cont {0} or {5} cont {0} or {6} cont {0})", allFilter.value, NAME, STATE, COUNTRYCODE, ZIPCODE, CODE, LOCATIONTYPECODE));

            return string.Join(" and ", statements);
        }

        private static string GetFilter(FilterCollectionItem filter)
        {
            switch (filter.property.ToLowerInvariant())
            {
                case "name":
                    return string.Format("({1} cont {0})", filter.value, NAME);
                case "state":
                    return string.Format("({1} cont {0})", filter.value, STATE);
                case "countrycode":
                    return string.Format("({1} cont {0})", filter.value, COUNTRYCODE);
                case "zipcode":
                    return string.Format("({1} cont {0})", filter.value, ZIPCODE);
                case "code":
                    return string.Format("({1} cont {0})", filter.value, CODE);
                case "locationtypecode":
                    return string.Format("({1} cont {0})", filter.value, LOCATIONTYPECODE);
                default:
                    throw new NotImplementedException("unable to filter on property " + filter.property);
            }
        }
    }
}
