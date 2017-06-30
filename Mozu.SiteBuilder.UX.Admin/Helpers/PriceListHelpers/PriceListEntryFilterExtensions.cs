using System;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using Mozu.Core;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.Tenant.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.PriceListHelpers
{
    internal static class PriceListEntryFilterExtensions
    {
        private const string CODE_PROPERTY = "priceListcode";
        private const string PRODUCT_CODE_PROPERTY = "productCode";
        private const string CURRENCY_CODE_PROPERTY = "currencyCode";
        private const string START_DATE_PROPERTY = "startDate";
        private const string END_DATE_PROPERTY = "endDate";
        private const string ENTRY_TYPE_PROPERTY = "entryType";
        private const string CREATE_DATE_PROPERTY = "auditinfo.createdate";
        private const string MODIFIED_DATE_PROPERTY = "auditinfo.updatedate";
        private const string CREATE_BY_PROPERTY = "auditinfo.createby";
        private const string UPDATE_BY_PROPERTY = "auditinfo.updateby";

        /// <summary>
        /// Converts a FilterCollection for Product to a mozu services-compatible filter string.
        /// </summary>
        public static string ToFilterEntryString(this FilterCollection extFilter)
        {
            if (extFilter == null || extFilter.Count == 0)
                return null;

            var sb = new StringBuilder();
            foreach (var filter in extFilter.Where(x => !string.IsNullOrEmpty(x.value?.ToString())))
            {

                var filterString = GetFilter(filter.value, filter);
                if (!string.IsNullOrWhiteSpace(filterString))
                {
                    if (sb.Length > 1)
                    {
                        sb.Append(" and ");
                    }
                    sb.Append(filterString);

                }

            }

            return sb.ToString().Trim();


            //return String.Join(" and ", extFilter./*.Where(f => !String.Equals(f.property, "validondate", StringComparison.InvariantCultureIgnoreCase)).*/Select(GetFilter));
        }


        private static string GetFilter(object value, FilterCollectionItem filter)
        {
            switch (filter.property.ToLowerInvariant())
            {
                case "all":
                    var str = "";
                    str += string.Join(" and ", filter.escapedValue.ToString().Trim().Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries)
                        .Select(searchString => $"({PRODUCT_CODE_PROPERTY} cont \"{searchString}\")"));
                    return str;
                case "code":
                case "productname":
                    return $"{PRODUCT_CODE_PROPERTY} cont \"{filter.escapedValue}\"";
                case "currencycode":
                    return $"{CURRENCY_CODE_PROPERTY} eq \"{filter.value}\"";
                case "entrytype":
                    return $"{ENTRY_TYPE_PROPERTY} eq \"{filter.value}\"";
                case "startdatefrom":
                    return $"{START_DATE_PROPERTY} ge \"{((DateTime)filter.value).ToUniversalTime().ToString("o")}\"";
                case "startdateto":
                    return $"{START_DATE_PROPERTY} le \"{((DateTime)filter.value).ToUniversalTime().ToString("o")}\"";
                case "enddatefrom":
                    return $"{END_DATE_PROPERTY} ge \"{((DateTime)filter.value).ToUniversalTime().ToString("o")}\"";
                case "enddateto":
                    return $"{END_DATE_PROPERTY} le \"{((DateTime)filter.value).ToUniversalTime().ToString("o")}\"";
                case "modifiedby":
                    return string.Format("(createby eq \"{0}\" or updateby eq \"{0}\")", filter.value);
                case "modifiedfrom":
                    return $"updatedate ge {((DateTime)filter.value).ToUniversalTime().ToString("o")}";
                case "modifiedto":
                    return
                        $"updatedate le {((DateTime)filter.value).AddDays(1).AddTicks(-1).ToUniversalTime().ToString("o")}";

                default:
                {
                    throw new NotImplementedException("unable to filter on property " + filter.property);
                }
            }
        }

    }
}
