using System;
using System.Diagnostics.Eventing.Reader;
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
        private const string SUPPORTSINVENTORY = "supportsinventory";
        private const string FULFILLMENT_TYPE = "fulfillmenttype.code";
        //private const string IS_DISABLED = "isdisabled";

        // sort VARS
        private const string NAME_PROPERTY = "name";
        private const string CODE_PROPERTY = "code";
        private const string SUPPORTS_INVENTORY_PROPERTY = "supportsinventory";



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
                return "name desc";

            return string.Join(" and ", sortCollection.Select(x => GetFilter(x) + (x.IsAscending ? " asc" : " desc")));
        }



        private static string GetFilter(SortingCollectionItem item)
        {
            switch (item.property.ToLowerInvariant())
            {
                case "name":
                    return NAME_PROPERTY;
                case "code":
                    return CODE_PROPERTY;
                case "supportsinventory":
                    return SUPPORTS_INVENTORY_PROPERTY;
                default:
                    return item.property.ToLowerInvariant();
            }
        }


        /// <summary>
        /// Converts a FilterCollection for Location to a mozu services-compatible filter string.
        /// </summary>
        public static string ToFilterString(this FilterCollection extFilter, bool? withVariations = null)
        {
            var statements = extFilter.Where(x => x.property != "all" && !string.IsNullOrEmpty((x.value ?? "").ToString()) ).Select(GetFilter).ToList();
            var allFilter = extFilter.FirstOrDefault(x => x.property == "all" && !string.IsNullOrEmpty( (x.value ?? "").ToString() ));
            
            //added new if to handle 'OR' condition in location filters. previously we are adding 'and' to all the filters.
            if (extFilter.Where(x => x.property == "any").FirstOrDefault() != null)
                return string.Join(" or ", statements);

            if (allFilter == null) 
                return string.Join(" and ", statements);
            
            var escapedAllValue = allFilter.value.ToString();
                
            if (!escapedAllValue.StartsWith("\""))
            {
                escapedAllValue = "\"" + escapedAllValue;
            }
            if (!escapedAllValue.EndsWith("\""))
            {
                escapedAllValue += "\"";
            }

            statements.Add(String.Format("({1} cont {0} or {2} eq {0} or {3} eq {0} or {4} eq {0} or {5} eq {0} or {6} eq {0})",
                escapedAllValue, NAME, STATE, COUNTRYCODE, ZIPCODE, CODE, LOCATIONTYPECODE));

            return string.Join(" and ", statements);
        }

        private static string GetFilter(FilterCollectionItem filter)
        {
            switch (filter.property.ToLowerInvariant())
            {
                case "name":
                    return string.Format("({1} cont '{0}')", filter.value, NAME);
                case "state":
                    return string.Format("({1} eq {0})", filter.value, STATE);
                case "countrycode":
                    return string.Format("({1} eq {0})", filter.value, COUNTRYCODE);
                case "postalorzipcode":
                case "zipcode":
                    return string.Format("({1} eq {0})", filter.value, ZIPCODE);
                case "code":
                    return string.Format("({1} eq '{0}')", filter.value, CODE);
                case "codene":
                    return string.Format("({1} ne '{0}')", filter.value, CODE);
                case "locationtype":
                    return string.Format("({1} eq '{0}')", filter.value, LOCATIONTYPECODE);
                case "supportsinventory":
                    return string.Format("({1} eq {0})", filter.value, SUPPORTSINVENTORY);
                case "fulfillmenttype":
                    return string.Format("({1} eq '{0}')", filter.value, FULFILLMENT_TYPE);
                case "status":
                    if (filter.value.ToString().ToLowerInvariant() == "all")
                        return "(isdisabled ne true or isdisabled eq true)";
                    return filter.value.ToString().ToLowerInvariant() == "disabled" 
                        ? "(isdisabled eq true)" 
                        : "(isdisabled ne true)";

                default:
                    throw new NotImplementedException("unable to filter on property " + filter.property);
            }
        }

        /// <summary>
        /// Converts a SortingCollection for Location to a mozu services-compatible sort string.
        /// </summary>
        //public static string ToSortString(this SortingCollection sortCollection)
        //{
        //    if (sortCollection.IsNullOrEmpty())
        //        return string.Empty;
        //    return string.Join(" and ", sortCollection.Select(x => GetFilter(x) + (x.IsAscending ? " asc" : " desc")));
        //}

        //private static string GetFilter(SortingCollectionItem item)
        //{
        //    switch (item.property.ToLowerInvariant())
        //    {
        //        case "name":
        //            return NAME;
        //        case "state":
        //            return STATE;
        //        case "countrycode":
        //            return COUNTRYCODE;
        //        case "postalorzipcode":
        //        case "zipcode":
        //            return ZIPCODE;
        //        case "code":
        //            return CODE;
        //        case "locationtype":
        //            return LOCATIONTYPECODE;
        //        case "supportsinventory":
        //            return SUPPORTSINVENTORY;
        //        case "fulfillmenttype":
        //            return FULFILLMENT_TYPE;
        //        case "status":
        //            return IS_DISABLED;
        //        default:
        //            throw new InvalidOperationException("unknown sort.property " + item.property);
        //    }
        //}
    }
}
