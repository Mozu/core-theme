using System;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.ReturnHelpers
{
    internal static class ReturnFilterExtensions
    {
        private const string CONTACT_FIRSTNAME = "contact.firstname";
        private const string CONTACT_LASTNAMEORSURNAME = "contact.lastnameorsurname";
        private const string CONTACT_EMAIL = "contact.email";

        /// <summary>
        /// Converts a FilterCollection for Product to a mozu services-compatible filter string.
        /// </summary>
        public static string ToFilterString(this FilterCollection extFilter, bool? withVariations = null)
        {
            if (extFilter == null || extFilter.Count == 0)
                return string.Empty;

            // "all" filter is for keyword search.
            var statements = extFilter.Where(x => x.property != "all").Select(GetFilter).Where(x => !string.IsNullOrWhiteSpace(x));

            return string.Join(" and ", statements);
        }

        public static string ToQString(this FilterCollection extFilter, bool? withVariations = null)
        {
            string allString;
            if (extFilter.TryGetValue("all", out allString) && !string.IsNullOrWhiteSpace(allString))
            {
                return string.Join(" ", allString.Trim().Split(new[] {' '}, StringSplitOptions.RemoveEmptyEntries).Select(x => x + "*")).Trim();
            }
            return null;
        }

        private static string GetFilter(FilterCollectionItem filter)
        {
            switch (filter.property.ToLowerInvariant())
            {
                // TODO: This case was pulled from the ReturnController. Need to make sure it still works as expected.
                case "originalorderid":
                {
                    return string.Format("originalorderid eq \"{0}\" and status ne \"{1}\"", filter.value, "null");
                }
                case "channel":
                {
                    return "channelcode eq " + filter.value;
                }
                //case "site":
                //{
                //    return string.IsNullOrEmpty(filter.value?.ToString()) ? "" : "siteid eq " + filter.value;
                //}
                //case "customerset":
                //{
                //    return string.IsNullOrEmpty(filter.value?.ToString()) ? "" : "customerset eq " + filter.value;
                //}
                case "id":
                {
                    return "id eq " + filter.value;
                }
                case "returnnumber":
                {
                    return "returnnumber eq " + filter.value;
                }
                case "returnstatus":
                {
                    if (filter.value.ToString().ToLower() == "created,authorized")
                    {
                        return "(returnstatus.in eq \"Created,Authorized\")";
                    }
                    return "returnstatus eq " + filter.value;
                }
                case "receivestatus":
                {
                    if (filter.value.ToString().ToLower() == "waiting,partiallyreceived")
                    {
                        return "(receivestatus.in eq \"Waiting,PartiallyReceived\")";
                    }
                    return "receivestatus eq " + filter.value;
                }
                case "refundstatus":
                {
                    if (filter.value.ToString().ToLower() == "notrefunded,partiallyrefunded")
                    {
                        return "(refundstatus.in eq \"NotRefunded,PartiallyRefunded\")";
                    }
                        return "refundstatus eq " + filter.value;
                }
                case "replacestatus":
                    {
                        if (filter.value.ToString().ToLower() == "notreplaced,partiallyreplaced")
                        {
                            return "(replacestatus.in eq \"NotReplaced,PartiallyReplaced\")";
                        }
                        return "replacestatus eq " + filter.value;
                }
                //case "modifiedby":
                //    return string.Format("(updateby eq {0} or createby eq {0})", filter.value);
                //case "modifiedfrom":
                //    return string.Format("updatedate ge {0}", ((DateTime) filter.value).ToUniversalTime().ToString("o"));
                //case "modifiedto":
                //    return string.Format("updatedate le {0}",
                //        ((DateTime) filter.value).AddDays(1).AddTicks(-1).ToUniversalTime().ToString("o"));
                //case "contactaddress":
                //    return string.Format("( {1} sw \"{0}\" )", filter.value, BILLINGCONTACTADDRESS);
                case "firstname":
                    return string.Format("({1} sw {0})", filter.value, CONTACT_FIRSTNAME);
                case "lastname":
                    return string.Format("({1} sw {0})", filter.value, CONTACT_LASTNAMEORSURNAME);
                case "email":
                    return string.Format("({1} sw {0})", filter.value, CONTACT_EMAIL);
                case "customerid":
                    return string.Format("( CustomerAccountId  eq {0} )", filter.value);
                default:
                {
                    throw new NotImplementedException("unable to filter on property " + filter.property);
                }
            }
        }
    }
}