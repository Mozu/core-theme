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

        private const string BILLINGPHONENUMBER = "billinginfo.billingcontact.phonenumber";
        private const string FULFILLMENTPHONENUMBER = "fulfillmentinfo.fulfillmentcontact.phonenumber";



        private const string ID = "Id";

        /// <summary>
        ///     Converts a FilterCollection for Product to a mozu services-compatible filter string.
        /// </summary>
        public static string ToFilterString(this FilterCollection extFilter, bool? withVariations = null)
        {
            const string defaultStatus = "(status ne 'Null' and status ne 'Pending' and status ne 'Abandoned')";

            if (extFilter == null || extFilter.Count == 0)
                return defaultStatus;

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

            // HACK: If you've specified a return number, you're searching for 1 particular order. Ignore all other filters.
            // TODO: Once we have a return grid, searching by return number should be removed as a "filter" from the order grid.
            var returnNumberQuery = extFilter.FirstOrDefault( x => string.Equals(x.property, "returnnumber", StringComparison.OrdinalIgnoreCase));
            if (returnNumberQuery != null)
            {
                statements = new[] { GetFilter(returnNumberQuery) };
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
                case "customerset":
                    {
                        if (filter.value == null || string.IsNullOrEmpty(filter.value.ToString()))
                        {
                            return "";
                        }
                        return "customerset eq " + filter.value;
                    }
                case "paymentstatus":
                {
                    switch (filter.value.ToString().ToLower())
                    {
                        case "unpaid,pending,errored":
                            return "(paymentstatus.in  eq \"Unpaid,Pending,Errored,PendingAndErrored\")";
                        case "pending":
                            return "(paymentstatus.in  eq \"Pending,PendingAndErrored\")";
                        case "errored":
                            return "(paymentstatus.in  eq \"Errored,PendingAndErrored\")";
                        case "unpaid,pending":
                            return "(paymentstatus.in  eq \"Unpaid,Pending,PendingAndErrored\")";
                        default:
                            return "paymentstatus eq " + filter.value;
                    }
                }
                case "fulfillmentstatus":
                {
                    return "fulfillmentStatus eq " + filter.value;
                }
                case "returnstatus":
                {
                    return "returnStatus eq " + filter.value;
                }
                // TODO: Remove this filter
                // The Order Grid allows you to search orders by child return number. This was a stop-gap until we had the Returns Grid in place.
                // The service-side implementation for this is hackish and should probably be removed at some point.
                case "returnnumber":
                {
                    return "returnNumber eq " + filter.value;
                }
                case "parentreturnid":
                {
                    return $"parentReturnId eq {filter.value}";
                }
                case "orderreferencenumber":
                {
                    return "parentCheckoutNumber eq " + filter.value;
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
                    return string.Format("updatedate ge {0}", ((DateTime)filter.value).ToUniversalTime().ToString("o"));
                case "modifiedto":
                    return string.Format("updatedate le {0}", ((DateTime)filter.value).AddDays(1).AddTicks(-1).ToUniversalTime().ToString("o"));
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
                    return string.Format("( {1} sw \"{0}\" )", filter.value, BILLINGCONTACTADDRESS);
                case "firstname":
                    return string.Format("(({1} sw {0}) or ({2} sw {0}))", filter.value, BILLINGCONTACTFIRSTNAME, FULFILLMENTCONTACTFIRSTNAME);
                case "lastname":
                    return string.Format("(({1} sw {0}) or ({2} sw {0}))", filter.value, BILLINGCONTACTLASTNAMEORSURNAME, FULFILLMENTCONTACTLASTNAMEORSURNAME);
                case "emailaddress":
                    return string.Format("(({1} sw {0}) or ({2} sw {0}) or ({3} sw {0}))", filter.value, EMAIL, FULFILLMENTCONTACTEMAIL, BILLINGCONTACTEMAIL);
                case "phonenumber":
                    return string.Format("( ({1} eq {0}) or ({2} eq {0}) )", filter.value, BILLINGPHONENUMBER, FULFILLMENTPHONENUMBER);
                case "customerid":
                    return string.Format("( CustomerAccountId  eq {0} )", filter.value);
                case "ordertype":
                    return string.Format("type eq {0}", filter.value);
                case "submittedfrom":
                    return string.Format("submittedDate ge {0}", ((DateTime)filter.value).ToUniversalTime().ToString("o"));
                case "submittedto":
                    return string.Format("submittedDate le {0}", ((DateTime)filter.value).AddDays(1).AddTicks(-1).ToUniversalTime().ToString("o"));
                case "attributename":
                    return string.Format("(attributes.name eq {0} or attributes.name eq tenant~{0})", filter.value);
                case "shippingmethod":
                    return string.Format("(itemFulfillmentMethod eq {0} )", filter.value);
                case "cardnumber":
                    return string.Format("(cardnumber eq {0} )", filter.value);
                case "externalid":
                    return "externalid eq " + filter.value;
                case "shipmentstatuses":
                    return string.Format("shipmentstatuses eq {0}", filter.value);
                default:
                {
                    throw new NotImplementedException("unable to filter on property " + filter.property);
                }
            }
        }
    }
}


