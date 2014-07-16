using System;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.LocalizedContentHelpers
{
    internal static class LocalizedContentFilterExtensions
    {
        private const string ATTRIBUTE_FQN_PROPERTY = "attributefqn";
        private const string ATTRIBUTE_NAME_PROPERTY = "name";

        /// <summary>
        /// Converts a FilterCollection for Attribute to a mozu services-compatible filter string.
        /// </summary>
        public static string ToFilterString(this FilterCollection extFilter)
        {
            if (extFilter == null || extFilter.Count == 0)
                return null;

            return String.Join(" and ", extFilter.Select(GetFilter));
        }

        private static string GetFilter(FilterCollectionItem filter)
        {
            
            switch (filter.property.ToLowerInvariant())
            {
                case "all":
                case "name":
                    return String.Format("{1} cont \"{0}\"", filter.value, ATTRIBUTE_NAME_PROPERTY);
                case "attributeFQN":
                    return String.Format("{2} {1} {0}", filter.value, filter.comparison, ATTRIBUTE_FQN_PROPERTY);
                case "localeexists":
                    return String.Format("localeexists eq {0}", filter.value);
                case "localenotexists":
                    return String.Format("localenotexists eq {0}", filter.value);
            }
            return "";
        }
    }
}