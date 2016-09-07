using System;
using System.Linq;
using Magnum.Extensions;
using Mozu.Core.Collections.Filtering;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.CategoryHelpers
{
    internal static class CategoryFilterExtensions
    {
        private const string PARENT_ID = "parentcategoryid";
        private const string ID = "id";
        private const string CATEGORY_CODE = "categorycode";
        private const string IS_DISPLAYED = "isdisplayed";
        private const string CATALOG_ID = "catalogid";
        private const string CATEGORY_TYPE = "categorytype";
        private const string IS_ACTIVE = "isactive";
        private const string CREATE_DATE = "createdate";
        private const string UPDATE_DATE = "updatedate";
        private const string CREATE_BY = "createby";
        private const string UPDATE_BY = "updateby";
        
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
                case "parentid":
                    return String.Format("{2} {1} {0}", filter.value, filter.comparison, PARENT_ID);

                case "id":
                    return String.Format("{2} {1} {0}", filter.value, filter.comparison, ID);

                case "all":
                    return String.Format("( content.name cont \"{0}\" or content.slug cont \"{0}\" or categorycode eq \"{0}\")", filter.escapedValue);

                case "categorycode":
                    return String.Format("{2} {1} {0}", filter.escapedValue, filter.comparison, CATEGORY_CODE);

                case "categorycodes":
                    var codes = filter.escapedValue.ToString().Split(',');
                    var codeList = codes.Select(x => string.Format("{0} eq {1}", CATEGORY_CODE, x)).ToArray();
                    return String.Join(" or ", codeList);

                // dc contract is isDisplay, mvc & js is isHidden, therefore have to switch comparison.
                case "ishidden":
                    return String.Format("{2} {1} {0}", filter.value, 
                        (filter.comparison.Equals(ComparisonFilterType.EQ.ToString()) 
                            ? "ne" 
                            : "eq"), 
                        IS_DISPLAYED);

                case "catalogid":
                    return String.Format("{2} {1} {0}", filter.value, filter.comparison, CATALOG_ID);

                case "type":
                    return String.Format("{2} {1} {0}", filter.value, filter.comparison, CATEGORY_TYPE);

                case "isactive":
                    return string.Format("{2} {1} {0}", filter.value, filter.comparison, IS_ACTIVE);

                case "status":
                    if (filter.value == null)
                    {
                        return "";
                    }
                    switch (filter.value.ToString().ToLowerInvariant())
                    {
                        case "active":
                            return String.Format("{0} eq \"true\"", IS_ACTIVE);
                        case "disabled":
                            return String.Format("{0} eq \"false\"", IS_ACTIVE);
                        default:
                            return "";
                    }

                case "hiddenonstorefront":
                    if (filter.value == null)
                    {
                        return "";
                    }
                    switch (filter.value.ToString().ToLowerInvariant())
                    {
                        case "yes":
                            return String.Format("{0} eq \"false\"", IS_DISPLAYED);
                        case "no":
                            return String.Format("{0} eq \"true\"", IS_DISPLAYED);
                        default:
                            return "";
                    }

                case "createdfrom":
                    return $"{CREATE_DATE} ge {((DateTime) filter.value).ToUniversalTime().ToString("o")}";
                case "createdto":
                    return
                        $"{CREATE_DATE} le {((DateTime) filter.value).AddDays(1).AddTicks(-1).ToUniversalTime().ToString("o")}";
                case "modifiedfrom":
                    return $"{UPDATE_DATE} ge {((DateTime) filter.value).ToUniversalTime().ToString("o")}";
                case "modifiedto":
                    return
                        $"{UPDATE_DATE} le {((DateTime) filter.value).AddDays(1).AddTicks(-1).ToUniversalTime().ToString("o")}";
  
                case "createby":
                    return String.Format("{2} {1} {0}", filter.escapedValue, filter.comparison, CREATE_BY);

                case "updateby":
                    return String.Format("{2} {1} {0}", filter.escapedValue, filter.comparison, UPDATE_BY);

                default:
                    return "";
            }
        }
    }
}