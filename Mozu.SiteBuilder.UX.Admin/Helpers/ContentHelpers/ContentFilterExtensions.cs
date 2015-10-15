using System;
using System.Collections.Generic;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.ContentHelpers
{
    internal static class ContentFilterExtensions
    {
        private const string CONTENT_NAME = "name";

        /// <summary>
        ///     Converts a FilterCollection for Product to a mozu services-compatible filter string.
        /// </summary>
        public static string ToContentFilterString(this FilterCollection extFilter, bool? withVariations = null)
        {

            //IEnumerable<string> statements = extFilter.Where(x => x.property != "all").Select(GetContentFilter).Where(x => !string.IsNullOrWhiteSpace(x));

            IEnumerable<string> statements = extFilter.Select(GetContentFilter).Where(x => !string.IsNullOrWhiteSpace(x));

            return string.Join(" and ", statements);
        }

        public static string ToContentQString(this FilterCollection extFilter, bool? withVariations = null)
        {
            string allString;
            if (extFilter.TryGetValue("all", out allString) && !string.IsNullOrWhiteSpace(allString))
            {
                return string.Join(" ", allString.Trim().Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Select(x => x + "*")).Trim();
            }
            return null;
        }

        private static string GetContentFilter(FilterCollectionItem filter)
        {
            switch (filter.property.ToLowerInvariant())
            {
                case "name":
                    return String.Format("{0} {1} {2}", CONTENT_NAME, filter.comparison, filter.escapedValue);
                default:
                    {
                        throw new NotImplementedException("unable to filter on property " + filter.property);
                    }
            }
        }
    }
}


