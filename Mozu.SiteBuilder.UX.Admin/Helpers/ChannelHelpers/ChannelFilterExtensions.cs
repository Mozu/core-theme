using System;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.ChannelHelpers
{
    internal static class ChannelFilterExtensions
    {
        private const string CODE = "code";
        private const string GROUPCODE = "groupcode";
        private const string NAME = "name";

        /// <summary>
        /// Converts a FilterCollection for Channel to a mozu services-compatible filter string.
        /// </summary>
        public static string ToFilterString(this FilterCollection extFilter, bool? withVariations = null)
        {
            var statements = extFilter.Where(x => x.property != "all").Select(GetFilter).ToList();
            var allFilter = extFilter.FirstOrDefault(x => x.property == "all");
            if (allFilter != null)
                statements.Add( String.Format("({1} cont {0} or {2} cont {0} or {3} cont {0})", allFilter.value, CODE, GROUPCODE, NAME) );

            return string.Join(" and ", statements);
        }

        private static string GetFilter(FilterCollectionItem filter)
        {
            switch (filter.property.ToLowerInvariant())
            {
               
                case "code": 
                    return string.Format("({1} cont {0})", filter.value, CODE);
                case "groupcode":
                    return string.Format("({1} cont {0})", filter.value, GROUPCODE);
                case "name":
                    return string.Format("({1} cont {0})", filter.value, NAME);
                default:
                    throw new NotImplementedException("unable to filter on property " + filter.property);
            }
        }
    }
}