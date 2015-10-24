using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using Mozu.Core.Exceptions;
using Mozu.SiteBuilder.Mvc.Filters;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.SearchTuningHelpers
{
    public interface ISearchTuningRuleFilterBuilder
    {
        string ToFilterString(FilterCollection filterCollection);
    }

    public class SearchTuningRuleFilterBuilder : ISearchTuningRuleFilterBuilder
    {
        public string ToFilterString(FilterCollection filterCollection)
        {
            if (filterCollection == null || filterCollection.Count == 0)
                return null;

            StringBuilder sb = new StringBuilder();
            foreach (
                var filter in 
                filterCollection.Where(x => x.value != null && !string.IsNullOrEmpty(x.value.ToString())))
            {
                var filterString = GetFilter(filter);
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
        }

        private string GetFilter(FilterCollectionItem filterItem)
        {
            switch (filterItem.property.ToLowerInvariant())
            {
                case "code":
                {
                    return String.Format("code cont \"{0}\"", filterItem.escapedValue);
                }
                case "name":
                {
                    return String.Format("name cont \"{0}\"", filterItem.escapedValue);
                }
                case "status":
                {
                        var v = ((string)filterItem.value);
                        if(v.Equals("active",StringComparison.OrdinalIgnoreCase))
                            return "active eq true";

                        if (v.Equals("disabled", StringComparison.OrdinalIgnoreCase))
                            return "active eq false";

                        return String.Empty;
                }
                case "default":
                {
                        return String.Format("isdefault eq \"{0}\"", filterItem.value);
                   }
                case "activestartdatefrom":
                {
                        return String.Format("startdate ge \"{0}\"", ((DateTime)filterItem.value).ToUniversalTime().ToString("o"));
                    }

                case "activestartdateto":
                    {
                        return String.Format("startdate le \"{0}\"", ((DateTime)filterItem.value).ToUniversalTime().ToString("o"));
                    }
                case "createdatefrom":
                {
                        return String.Format("createdate ge \"{0}\"", ((DateTime)filterItem.value).ToUniversalTime().ToString("o"));
                    }
                case "createdateto":
                {
                        return String.Format("createdate le \"{0}\"", ((DateTime)filterItem.value).ToUniversalTime().ToString("o"));
                    }
                case "createbyuser":
                {
                        return String.Format("createby eq \"{0}\"", filterItem.value);
                    }
                case "modifieddatefrom":
                    {
                        return String.Format("updatedate ge \"{0}\"", ((DateTime)filterItem.value).ToUniversalTime().ToString("o"));
                    }
                case "modifieddateto":
                    {
                        return String.Format("updatedate le \"{0}\"", ((DateTime)filterItem.value).ToUniversalTime().ToString("o"));
                    }
                case "lastmodifiedbyuser":
                {
                        return String.Format("updateby eq \"{0}\"", filterItem.value);
                    }

                default:
                {
                    throw new VaeMissingOrInvalidParameterException(filterItem.property,
                        "Not a valid filterable property");
                }
            }
        }
    }
}