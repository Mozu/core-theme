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
        private const string PRODUCT_CAT_STATUS = "catalog.isactive";
        private const string LOCATION_CODE = "locationcode";
        private const string STOCK_ON_HAND = "stockonhand";
        private const string STOCK_AVAILABLE = "stockavailable";
        private const string STOCK_ON_BACKORDER = "stockonbackorder";
        private const string SKU = "sku";
        private const string PARTNUMBER = "mfgPartNumber";

        private const string CREATE_DATE_PROPERTY = "createdate"; 
        private const string CREATED_BY_PROPERTY = "createby";
        private const string UPDATE_DATE_PROPERTY = "updatedate"; 
        private const string UPDATE_BY_PROPERTY = "updateby"; 


        /// <summary>
        /// Converts a FilterCollection for LocationInventory to a mozu services-compatible filter string.
        /// </summary>
        public static string ToFilterString(this FilterCollection extFilter)
        {
            var statements = extFilter.Where(x => x.property != "all").Select(GetFilter).ToList();
            var allFilter = extFilter.FirstOrDefault(x => x.property == "all");
            if (allFilter != null)
                statements.Add(String.Format("({1} sw {0} or {2} sw {0} or {3} sw {0} or {4} eq {0})", allFilter.value, PRODUCT_CODE, LOCATION_CODE, PRODUCT_NAME, BASE_PRODUCT_CODE));

            return string.Join(" and ", statements);
        }

        private static string GetFilter(FilterCollectionItem filter)
        {
            switch (filter.property.ToLowerInvariant())
            {
                case "productname":
                    return string.Format("({1} eq {0})", filter.value, PRODUCT_NAME);
                case "productcode":
                    return string.Format("({1} eq {0})", filter.value, PRODUCT_CODE);
                case "productcodefilter":
                    return $"({PRODUCT_CODE} eq \"{filter.value}\")";
                case "productstatus":
                    if (filter.value == null)
                        return string.Empty;
                    var status = filter.value.ToString().ToLower();
                    if (status.Equals("active"))
                    {
                        return $"({PRODUCT_CAT_STATUS} eq true)";
                    }
                    if (status.Equals("disabled"))
                    {
                        return $"({PRODUCT_CAT_STATUS} eq false)";
                    }
                    return string.Empty;   

                case "locationcode":
                    return string.Format("({1} {2} {0})", filter.value, LOCATION_CODE, filter.comparison == "sw" ? "sw" : "eq");

                case "onhandfrom":
                    return $"{STOCK_ON_HAND} ge \"{filter.value}\"";
                case "onhandto":
                    return $"{STOCK_ON_HAND} le \"{filter.value}\"";

                case "availablefrom":
                    return $"{STOCK_AVAILABLE} ge \"{filter.value}\"";
                case "availableto":
                    return $"{STOCK_AVAILABLE} le \"{filter.value}\"";

                case "backorderfrom":
                    return $"{STOCK_ON_BACKORDER} ge \"{filter.value}\"";
                case "backorderto":
                    return $"{STOCK_ON_BACKORDER} le \"{filter.value}\"";

                case "createdate":
                    return String.Format("{0} eq \"{1}\"", CREATE_DATE_PROPERTY, ((DateTime)filter.value).ToUniversalTime().ToString("o"));
                case "createdfrom":
                    return string.Format("{0} ge {1}", CREATE_DATE_PROPERTY, ((DateTime)filter.value).ToUniversalTime().ToString("o"));
                case "createdto":
                    return string.Format("{0} le {1}", CREATE_DATE_PROPERTY, ((DateTime)filter.value).AddDays(1).AddTicks(-1).ToUniversalTime().ToString("o"));
                case "createby":
                    return String.Format("{0} eq \"{1}\"", CREATED_BY_PROPERTY, filter.value);
                case "updatedate":
                    return String.Format("{0} eq \"{1}\"", UPDATE_DATE_PROPERTY, ((DateTime)filter.value).ToUniversalTime().ToString("o"));
                case "modifiedfrom":
                    return string.Format("{0} ge {1}", UPDATE_DATE_PROPERTY, ((DateTime)filter.value).ToUniversalTime().ToString("o"));
                case "modifiedto":
                    return string.Format("{0} le {1}", UPDATE_DATE_PROPERTY, ((DateTime)filter.value).AddDays(1).AddTicks(-1).ToUniversalTime().ToString("o"));
                case "updateby":
                case "lastmodifiedby":
                    return String.Format("{0} eq \"{1}\"", UPDATE_BY_PROPERTY, filter.value);
                case "sku":
                    return $"({SKU} eq \"{filter.value}\")";
                case "mfgpartnumber":
                    return $"({PARTNUMBER} eq \"{filter.value}\")";
                default:
                    throw new NotImplementedException("unable to filter on property " + filter.property);
            }
        }
    }
}
