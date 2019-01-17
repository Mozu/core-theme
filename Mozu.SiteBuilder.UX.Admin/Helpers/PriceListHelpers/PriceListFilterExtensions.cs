using System;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using Mozu.Core;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.Tenant.Contracts.Clients;
using System.Collections;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.PriceListHelpers
{
    internal static class PriceListFilterExtensions
    {
        private const string NAME_PROPERTY = "name";
        private const string CODE_PROPERTY = "priceListcode";
        private const string PARENT_CODE_PROPERTY = "parentPriceListCode";
        private const string ENABLED_PROPERTY = "enabled";
        private const string SEGMENTS_PROPERTY = "mappedcustomersegments";

        private const string CREATE_DATE_PROPERTY = "auditinfo.createdate";
        private const string MODIFIED_DATE_PROPERTY = "auditinfo.updatedate";
        private const string CREATE_BY_PROPERTY = "auditinfo.createby";
        private const string UPDATE_BY_PROPERTY = "auditinfo.updateby";

        /// <summary>
        /// Converts a FilterCollection for Product to a mozu services-compatible filter string.
        /// </summary>
        public static string ToFilterString(this FilterCollection extFilter)
        {
            if (extFilter == null || extFilter.Count == 0)
                return null;

            StringBuilder sb = new StringBuilder();
            foreach (var filter in extFilter.Where(x => x.value != null && !string.IsNullOrEmpty(x.value.ToString())))
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
                        .Select(searchString => string.Format("(({0} cont \"{2}\") or ({1} eq \"{2}\"))", NAME_PROPERTY, CODE_PROPERTY, searchString)));
                    return str;
                case "codes":
                    var codes = filter.escapedValue.ToString().Split(',');
                    var codeList = codes.Select(x => string.Format("{0} eq \"{1}\"", CODE_PROPERTY, x)).ToArray();
                    return String.Join(" or ", codeList);
                case "name":
                    return String.Format("{0} cont \"{1}\"", NAME_PROPERTY, filter.escapedValue);
                case "code":
                    return String.Format("{0} eq \"{1}\"", CODE_PROPERTY, filter.value);
                case "parentcode":
                    return String.Format("{0} eq \"{1}\"", PARENT_CODE_PROPERTY, filter.value);
                case "segments":
                    return String.Format("{0} eq \"{1}\"", SEGMENTS_PROPERTY, filter.value);

                case "modifiedby":
                    return string.Format("(createby eq \"{0}\" or updateby eq \"{0}\")", filter.value);
                case "modifiedfrom":
                    return string.Format("updatedate ge {0}", ((DateTime)filter.value).ToUniversalTime().ToString("o"));
                case "modifiedto":
                    return string.Format("updatedate le {0}", ((DateTime)filter.value).AddDays(1).AddTicks(-1).ToUniversalTime().ToString("o"));

                case "status":
                    if (filter.value == null)
                    {
                        return "";
                    }
                    switch (filter.value.ToString().ToLowerInvariant())
                    {
                        case "active":
                            return String.Format("{0} eq \"true\"", ENABLED_PROPERTY);
                        case "disabled":
                            return String.Format("{0} eq \"false\"", ENABLED_PROPERTY);
                        default:
                            return "";
                    }
                default:
                    {
                        throw new NotImplementedException("unable to filter on property " + filter.property);
                    }
            }
        }
    }
}
