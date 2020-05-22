using System;
using System.Linq;
using Magnum.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.AttributeHelpers
{
    internal static class AttributeFilterExtensions
    {
        private const string ATTRIBUTE_IS_OPTION = "isoption";
        private const string ATTRIBUTE_IS_EXTRA = "isextra";
        private const string ATTRIBUTE_IS_PROPERTY = "isproperty";
        private const string ATTRIBUTE_ISVALUEMAPPINGATTRIBUTE = "isvaluemappingattribute";
        private const string ATTRIBUTE_INPUT_TYPE = "inputtype";
        private const string ATTRIBUTE_ADMIN_NAME = "adminname";
        private const string ATTRIBUTE_CONTENT_NAME = "content.name";
        private const string ATTRIBUTE_CODE = "attributecode";
        private const string ATTRIBUTE_ID_PROPERTY = "attributeid";
        private const string ATTRIBUTE_SET_ID_PROPERTY = "attributesetid";
        //private const string ATTRIBUTE_NAME_PROPERTY = "internalname";
        private const string DATA_TYPE_PROPERTY = "datatype";
        private const string IS_CONFIGURABLE_PROPERTY = "isconfigurable";
        private const string IS_REQUIRED_PROPERTY = "isrequired";
        private const string IS_ACTIVE_PROPERTY = "isactive";
        private const string SITE_ID = "siteid";
        private const string CATALOG_ID = "catalogid";
        private const string PROCESS_STATUS = "processstatus";
        private const string STATUS_CODE = "eventdeliveryattempt.statuscode";
        private const string SUBSCRIPTION_ID = "subscriptionid";
        private const string EVENT_ID = "eventid";
        private const string ENTITY_ID = "entityid";
        private const string TOPIC = "topic";
        private const string IS_SORTABLE = "searchsettings.allowfilteringandsortinginstorefront";

        /// <summary>
        /// Converts a FilterCollection for Attribute to a mozu services-compatible filter string.
        /// </summary>
        public static string ToFilterString(this FilterCollection extFilter)
        {
            if (extFilter == null || extFilter.Count == 0)
            {
                return null;
            }

            return string.Join(" and ", extFilter.Select(GetFilter));
        }

        private static string GetFilter(FilterCollectionItem filter)
        {
            switch (filter.property.ToLowerInvariant())
            {
                case "all":
                    var strAll = "";
                    const string formatStr = "({1} cont {0} or {2} cont {0} or {3} cont {0})";
                    strAll += string.Join(" and ", filter.escapedValue.ToString().Trim()
                        .Split(new char[] {' '}, StringSplitOptions.RemoveEmptyEntries)
                        .Select(searchString => string.Format(formatStr, searchString, ATTRIBUTE_CONTENT_NAME,
                            ATTRIBUTE_ADMIN_NAME, ATTRIBUTE_CODE)));
                    return strAll;
                case "id":
                case "type":

                    var str = "";
                    var seperator = "";

                    var value = filter.value.ToString().ToLowerInvariant();

                    if (value.Contains("property"))
                    {
                        str += $"{ATTRIBUTE_IS_PROPERTY} eq true";
                        seperator = " or ";
                    }

                    if (value.Contains("isvaluemappingattribute"))
                    {
                        str += $" {seperator}{ATTRIBUTE_ISVALUEMAPPINGATTRIBUTE} eq true";
                        seperator = " or ";
                    }
                    

                    if (value.Contains("extra"))
                    {
                        str += $"{seperator}{ATTRIBUTE_IS_EXTRA} eq true";
                        seperator = " or ";
                    }

                    if (value.Contains("option"))
                    {
                        str += $"{seperator}{ATTRIBUTE_IS_OPTION} eq true";
                    }

                    if (str.IsNotEmpty())
                    {
                        str = "(" + str + ")";
                    }

                    return str;
                case "inputtype":
                    return $"{ATTRIBUTE_INPUT_TYPE} {filter.comparison} {filter.value}";
                case "code":
                    return $"{ATTRIBUTE_CODE} cont {filter.escapedValue}";
                case "adminname":
                    return $"{ATTRIBUTE_ADMIN_NAME} cont {filter.escapedValue}";
                case "name":
                    return $"{ATTRIBUTE_CONTENT_NAME} cont {filter.escapedValue}";
                case "attributeid":
                    return $"{ATTRIBUTE_ID_PROPERTY} {filter.comparison} {filter.value}";
                case "attributesetid":
                    return $"{ATTRIBUTE_SET_ID_PROPERTY} {filter.comparison} {filter.value}";
                //case "name":
                //return String.Format("{1} cont \"{0}\"", filter.value, ATTRIBUTE_NAME_PROPERTY);
                case "datatype":
                    return $"{DATA_TYPE_PROPERTY} {filter.comparison} {filter.value}";
                case "isconfigurable":
                    return $"{IS_CONFIGURABLE_PROPERTY} eq {filter.value}";
                case "isrequired":
                    return $"{IS_REQUIRED_PROPERTY} eq {filter.value}";
                case "isactive":
                    return $"{IS_ACTIVE_PROPERTY} eq {filter.value}";
                case "siteid":
                    return $"{SITE_ID} eq {filter.value}";
                case "catalogid":
                    return $"{CATALOG_ID} eq {filter.value}";
                case "statuscode":
                    return $"{STATUS_CODE} eq {filter.value}";
                case "subscriptionid":
                    return $"{SUBSCRIPTION_ID} eq {filter.value}";
                case "processstatus":
                    return $"{PROCESS_STATUS} eq {filter.value}";
                case "eventid":
                    return $"{EVENT_ID} eq {filter.value}";
                case "entityid":
                    return $"{ENTITY_ID} eq {filter.value}";
                case "eventtopic":
                    return $"{TOPIC} cont {filter.value}";
                case "allowfilteringandsortinginstorefront":
                    return $"{IS_SORTABLE} eq {filter.value}";
            }
            return "";
        }
    }
}