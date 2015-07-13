using System;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.AttributeHelpers
{
    internal static class AttributeFilterExtensions
    {
        private const string ATTRIBUTE_IS_OPTION = "isoption";
        private const string ATTRIBUTE_IS_EXTRA = "isextra";
        private const string ATTRIBUTE_IS_PROPERTY = "isproperty";
        private const string ATTRIBUTE_INPUT_TYPE = "inputtype";
        private const string ATTRIBUTE_ADMIN_NAME = "adminname";
        private const string ATTRIBUTE_CONTENT_NAME = "content.name";
        private const string ATTRIBUTE_CODE = "attributecode";

        private const string ATTRIBUTE_ID_PROPERTY = "attributeid";
        private const string ATTRIBUTE_SET_ID_PROPERTY = "attributesetid";
        //private const string ATTRIBUTE_NAME_PROPERTY = "internalname";
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
                case "all":
                    return String.Format("({1} cont {0} or {2} cont {0} or {3} cont {0})", filter.escapedValue, ATTRIBUTE_CONTENT_NAME, ATTRIBUTE_ADMIN_NAME, ATTRIBUTE_CODE);
                case "id":
                case "type":
                    switch (filter.value.ToString().ToLowerInvariant())
                    {
                        case "property":
                            return String.Format("{0} eq true", ATTRIBUTE_IS_PROPERTY);
                        case "extra":
                            return String.Format("{0} eq true", ATTRIBUTE_IS_EXTRA);
                        case "option":
                            return String.Format("{0} eq true", ATTRIBUTE_IS_OPTION);
                    }
                    return "";
                case "inputtype":
                    return String.Format("{2} {1} {0}", filter.value, filter.comparison, ATTRIBUTE_INPUT_TYPE);
                case "code":
                    return String.Format("{1} cont {0}", filter.escapedValue, ATTRIBUTE_CODE);
                case "adminname":
                    return String.Format("{1} cont {0}", filter.escapedValue, ATTRIBUTE_ADMIN_NAME);
                case "name":
                    return String.Format("{1} cont {0}", filter.escapedValue, ATTRIBUTE_CONTENT_NAME);
                case "attributeid":
                    return String.Format("{2} {1} {0}", filter.value, filter.comparison, ATTRIBUTE_ID_PROPERTY);
                case "attributesetid":
                    return String.Format("{2} {1} {0}", filter.value, filter.comparison, ATTRIBUTE_SET_ID_PROPERTY);
                //case "name":
                    //return String.Format("{1} cont \"{0}\"", filter.value, ATTRIBUTE_NAME_PROPERTY);
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