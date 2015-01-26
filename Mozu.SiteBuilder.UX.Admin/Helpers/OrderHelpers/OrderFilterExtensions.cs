using System;
using System.Collections.Generic;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.OrderHelpers
{
    internal static class OrderFilterExtensions
    {
        private const string ORDERNUMBER = "OrderNumber";
        private const string EMAIL = "email";
        private const string BILLINGCONTACTFIRSTNAME = "billinginfo.billingcontact.firstname";
        private const string BILLINGCONTACTLASTNAMEORSURNAME = "billinginfo.billingcontact.lastnameorsurname";
        private const string FULFILLMENTCONTACTFIRSTNAME = "fulfillmentinfo.fulfillmentcontact.firstname";
        private const string FULFILLMENTCONTACTLASTNAMEORSURNAME = "fulfillmentinfo.fulfillmentcontact.lastnameorsurname";
        private const string BILLINGCONTACTEMAIL = "billinginfo.billingcontact.email";
        private const string FULFILLMENTCONTACTEMAIL = "fulfillmentinfo.fulfillmentcontact.email";
        private const string BILLINGCONTACTADDRESS = "billinginfo.billingcontact.address";


        private const string ID = "Id";

        /// <summary>
        ///     Converts a FilterCollection for Product to a mozu services-compatible filter string.
        /// </summary>
        public static string ToFilterString(this FilterCollection extFilter, bool? withVariations = null)
        {
            const string defaultStatus = "(status eq 'Submitted' or status eq 'Processing' or status eq 'Completed' or status eq 'Cancelled' or status eq 'Validated' or status eq 'Accepted' or status eq 'PendingReview')";
                //"status in['Submitted','Processing','Completed','Cancelled','Validated','Accepted','PendingReview']";
            if (extFilter == null || extFilter.Count == 0)
                return defaultStatus; //"status.in eq \"Submitted,Processing,Completed,Cancelled,Validated,Accepted,PendingReview\"";

            // TODO: If the filter needs to include products with variations, do something with 'withVariations'
            // Note: this could change, we're waiting on changes to be applied from the services team and/or Britt G.

            // TODO: commenting out this next part. I can't find any way from EXT to make "query" happen.
            // if (!string.IsNullOrEmpty(extFilter.query))
            //     extFilter.Add(new FilterCollectionItem { comparison = "cont", field = PropertyGuy.Convert(x => x.Content.ProductName), value = extFilter.query });

            IEnumerable<string> statements = extFilter.Where(x => x.property != "all").Select(GetFilter).Where(x => !string.IsNullOrWhiteSpace(x));
            if (!extFilter.Any(x => string.Equals(x.property, "status", StringComparison.OrdinalIgnoreCase) || string.Equals(x.property, "orderstatus", StringComparison.OrdinalIgnoreCase)))
            {
                statements = statements.Concat(new[] { string.Format("({0})", defaultStatus) });
            }

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
                case "channel":
                    return "channelcode eq " + filter.value;
                case "site":
                {
                    if (filter.value == null || string.IsNullOrEmpty(filter.value.ToString()))
                    {
                        return "";
                    }
                    return "siteid eq " + filter.value;
                }
                case "paymentstatus":
                {
                    if (filter.value.ToString().ToLower() == "unpaid,pending")
                    {
                        return "(paymentstatus.in  eq \"Unpaid,Pending\")";
                    }
                    return "paymentstatus eq " + filter.value;;
                }
                case "fulfillmentstatus":
                {
                    return "fulfillmentStatus eq " + filter.value; ;
                }
                case "id":
                {
                    return "id eq " + filter.value; ;
                }
                case "mintotal":
                    return "total GE " + filter.value;
                case "maxtotal":
                    return "total LE " + filter.value;
                case "modifiedby":
                    return string.Format("(updateby eq {0} or createby eq {0})", filter.value);
                case "modifiedfrom":
                    return string.Format("updatedate gt {0}", ((DateTime)filter.value).ToUniversalTime().ToString("s") + "Z");
                    case "modifiedto":
                    return string.Format("updatedate lt {0}", ((DateTime)filter.value).ToUniversalTime().ToString("s") + "Z");
                case "orderstatus":
                    if (filter.value.ToString().ToLower() == "open")
                    {
                    
                        return "(status.in  eq \"Submitted,Processing,Validated,Accepted,PendingReview\")";
                    }
                    return string.Format("status eq {0}", filter.value);
                case "billingcontactfirstname":
                    return string.Format("({1} sw {0})", filter.value, BILLINGCONTACTFIRSTNAME);
                case "billingcontactlastname":
                    return string.Format("({1} sw {0})", filter.value, FULFILLMENTCONTACTLASTNAMEORSURNAME);
                case "billingcontactaddress":
                    return string.Format("( {1} cont \"{0}\" )", filter.value, BILLINGCONTACTADDRESS);
                case "firstname":
                    return string.Format("(({1} cont {0}) or ({2} cont {0}))", filter.value, BILLINGCONTACTFIRSTNAME, BILLINGCONTACTFIRSTNAME);
                case "lastname":
                    return string.Format("(({1} cont {0}) or ({2} cont {0}))", filter.value, FULFILLMENTCONTACTLASTNAMEORSURNAME, FULFILLMENTCONTACTLASTNAMEORSURNAME);
                case "emailaddress":
                    return string.Format("(({1} cont {0}) or ({2} cont {0}) or ({3} cont {0}))", filter.value, EMAIL, FULFILLMENTCONTACTEMAIL, BILLINGCONTACTEMAIL);
                case "customerid":
                    return string.Format("( CustomerAccountId  eq {0} )", filter.value);
                case "ordertype":
                    return string.Format("type eq {0}", filter.value);
                default:
                {
                    throw new NotImplementedException("unable to filter on property " + filter.property);
                }
            }
        }
    }
}


