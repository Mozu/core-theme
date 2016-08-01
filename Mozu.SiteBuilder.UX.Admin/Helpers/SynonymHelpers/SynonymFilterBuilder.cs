using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using Mozu.Core.Exceptions;
using Mozu.SiteBuilder.Mvc.Filters;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.SynonymHelpers
{
    public interface ISynonymFilterBuilder
    {
        string ToFilterString(FilterCollection filterCollection);
    }

    public class SynonymFilterBuilder : ISynonymFilterBuilder
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
                case "all":
                    {
                        return String.Format("key cont \"{0}\" or synonyms cont \"{0}\"", filterItem.escapedValue);
                    }
                case "key":
                    {
                        return String.Format("key cont \"{0}\"", filterItem.escapedValue);
                    }
                case "synonyms":
                    {
                        return String.Format("synonyms cont \"{0}\"", filterItem.escapedValue);
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