using System;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.AttributeHelpers
{
    internal static class AttributeFilterExtensions
    {
        private const string ATTRIBUTE_ID_PROPERTY = "attributeid";
        private const string ATTRIBUTE_SET_ID_PROPERTY = "attributesetid";
        private const string ATTRIBUTE_NAME_PROPERTY = "internalname";
        private const string DATA_TYPE_PROPERTY = "datatype";
        private const string IS_CONFIGURABLE_PROPERTY = "isconfigurable";
        private const string IS_REQUIRED_PROPERTY = "isconfigurable";

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
                case "id":
                case "attributeid":
                    return String.Format("{2} {1} {0}", filter.value, filter.comparison, ATTRIBUTE_ID_PROPERTY);
                case "attributesetid":
                    return String.Format("{2} {1} {0}", filter.value, filter.comparison, ATTRIBUTE_SET_ID_PROPERTY);
                case "name":
                    return String.Format("{1} cont \"{0}\"", filter.value, ATTRIBUTE_NAME_PROPERTY);
                case "datatype":
                    return String.Format("{2} {1} {0}", filter.value, filter.comparison, DATA_TYPE_PROPERTY);
                case "isconfigurable":
                    return String.Format("{1} eq {0}", filter.value, IS_CONFIGURABLE_PROPERTY);
                case "isrequired":
                    return String.Format("{1} eq {0}", filter.value, IS_REQUIRED_PROPERTY);
            }
            return "";
        }
    }
}