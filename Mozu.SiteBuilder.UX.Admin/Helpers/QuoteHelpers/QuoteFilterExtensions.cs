using System;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using System.Collections.Generic;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.QuoteHelpers
{
    internal static class QuoteFilterExtensions
    {
        private const string CUSTOMERACCOUNTID = "customeraccountid";
        private const string USERID = "userid";

        /// <summary>
        /// Converts a FilterCollection for wishlist to a mozu services-compatible filter string.
        /// </summary>
        public static string ToFilterString(this FilterCollection extFilter, bool? withVariations = null)
        {
            IEnumerable<string> statements = extFilter.Where(x => x.property != "all").Select(GetFilter)
                .Where(x => !string.IsNullOrWhiteSpace(x));

            return string.Join(" and ", statements);
        }

        public static string ToQString(this FilterCollection extFilter, bool? withVariations = null)
        {
            string allString;
            if (extFilter.TryGetValue("all", out allString) && !string.IsNullOrWhiteSpace(allString))
            {
                return string.Join(" ",
                        allString.Trim().Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Select(x => x + "*"))
                    .Trim();
            }

            return null;
        }

        private static string GetFilter(FilterCollectionItem filter)
        {
            switch (filter.property.ToLowerInvariant())
            {
                case CUSTOMERACCOUNTID:
                    return "customerAccountId eq " + filter.value;
                case USERID:
                    return "userId eq " + filter.value;
                default:
                    throw new NotImplementedException("unable to filter on property " + filter.property);
            }
        }
    }
}