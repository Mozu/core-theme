using System;
using System.Linq;
using System.Text;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.CustomerHelpers
{
    internal static class CustomerFilterExtensions
    {
        private const string FIRSTNAME = "Contacts.FirstName";
        private const string LASTNAMEORSURNAME = "Contacts.LastNameOrSurname";
        private const string EMAIL = "Contacts.Email";
        
        // Store Credit constants
        private const string CODE_PROPERTY = "Code";
        private const string CUSTOMERID_PROPERTY = "CustomerId";
        private const string ACTIVATEDATE_PROPERTY = "ActivationDate";
        private const string EXPIRATIONDATE_PROPERTY = "ExpirationDate";
        private const string CREATEDATE_PROPERTY = "CreateDate";
        private const string UPDATEDATE_PROPERTY = "UpdateDate";
        private const string CREDITTYPE_PROPERTY = "CreditType";
        private const string INITIALBALANCE_PROPERTY = "InitialBalance";
        private const string CURRENTBALANCE_PROPERTY = "CurrentBalance";
        private const string CURRENCYCODE_PROPERTY = "CurrencyCode";
        private const string CREATEBY_PROPERTY = "CreateBy";
        private const string UPDATEBY_PROPERTY = "UpdateBy";
        private const string USER_ID = "UserId";

        /// <summary>
        /// Converts a FilterCollection for Product to a mozu services-compatible filter string.
        /// </summary>
        public static string ToFilterString(this FilterCollection extFilter, bool? withVariations = null)
        {
            if (extFilter == null || extFilter.Count ==0 )
            {
                return null;
            }
 
            var sb = new StringBuilder();
            foreach (var filter in extFilter.Where(x =>
                x.value != null && x.property != "all" && !string.IsNullOrEmpty(x.value.ToString())))
            {
                var filterString = GetFilter(filter.value, filter);
                if (!string.IsNullOrWhiteSpace(filterString))
                {
                    if (sb.Length > 1)
                    {
                        sb.Append(" and ");
                    }
                    sb.Append(filterString);
                }
            }

            return sb.ToString().Trim();
        }

        public static string ToQString(this FilterCollection extFilter, bool? withVariations = null)
        {
            string allString;
            if (extFilter.TryGetValue("all", out allString) && !string.IsNullOrWhiteSpace(allString))
            {
                return string.Join(" ", allString.Trim().Split(new[] {' '}, StringSplitOptions.RemoveEmptyEntries)
                    .Select(x =>
                    {
                        int temp;
                        if (int.TryParse(x, out temp))
                        {
                            extFilter.Add(new FilterCollectionItem
                            {
                                field = "customeraccountid",
                                property = "customeraccountid",
                                value = temp
                            });

                            return null;
                        }

                        return x + "*";
                    })).Trim();
            }

            return null;
        }

        private static string GetFilter(object value, FilterCollectionItem filter)
        {
            switch (filter.property.ToLowerInvariant())
            {
                case "excludeanonymous":
                    return string.Empty;
                // return string.Format("excludeAnonymous eq {0}", filter.value);
                case "groups":
                    return $"groups eq {filter.value}";
                case "segments":
                    return $"segments.id eq {filter.value}";
                case "notsegments":
                    return $"segments.id ne {filter.value}";
                case "segment":
                    return $"segments.id eq {filter.value}";
                case "notsegment":
                    return $"segments.id ne {filter.value}";
                case "customerset":
                    return $"customerset eq {filter.value}";
                case "accounttype":
                    return $"accounttype eq {filter.value}";
                case "isactive":
                    return $"isactive eq {filter.value}";
                case "isremoved":
                    return $"isremoved eq {filter.value}";
                case "userid":
                    var userIds = value.ToString().Split(',');
                    if (userIds.Length > 1)
                    {
                        var filters = userIds.Select(v => $"userId eq {v}").ToArray();
                        return "(" + string.Join(" or ", filters) + ")";
                    }
                    else
                    {
                        return $"userId eq {value}";
                    }
                case "customeraccountid":
                    var accountIds = value.ToString().Split(',');
                    if (accountIds.Length > 1)
                    {
                        var filters = accountIds.Select(v => $"customeraccountid eq {v}").ToArray();
                        return "(" + string.Join(" or ", filters) + ")";
                    }
                    else
                    {
                        return $"customeraccountid eq {value}";
                    }
                case "code":
                    return $"code {filter.comparison} {filter.value}";
                case "nameorcode":
                    return $"name {filter.comparison} {filter.value} or code {filter.comparison} {filter.value}";
                default:
                {
                    throw new NotImplementedException($"Unable to filter on property {filter.property}");
                }
            }
        }

        // store credit search
        /// <summary>
        /// Converts a FilterCollection for Product to a mozu services-compatible filter string.
        /// </summary>
        public static string ToCreditFilterString(this FilterCollection extFilter, bool? withVariations = null)
        {
            if (extFilter == null || extFilter.Count == 0)
            {
                return null;
            }

            var sb = new StringBuilder();
            foreach (var filter in extFilter.Where(item => !string.IsNullOrEmpty(item.value?.ToString())))
            {
                var filterString = GetCreditFilter(filter);
                if (!string.IsNullOrWhiteSpace(filterString))
                {
                    if (sb.Length > 1)
                    {
                        sb.Append(" and ");
                    }
                    sb.Append(filterString);
                }
            }

            return sb.ToString().Trim();
        }
        
        private static string GetCreditFilter(FilterCollectionItem filter)
        {
            switch (filter.property.ToLowerInvariant())
            {
                case "all":
                    var retVal =
                        $"{CODE_PROPERTY} sw '{filter.escapedValue}' or {CUSTOMERID_PROPERTY} eq '{filter.escapedValue}'";
                    return retVal;
                case "code":
                    return $"{CODE_PROPERTY} \"{filter.comparison}\" \"{filter.escapedValue}\"";
                case "customerid":                   
                    return $"{CUSTOMERID_PROPERTY} eq \"{filter.escapedValue}\"";
                case "customer":
                    //this is the value coming from the customer picker field. Display value varies but it maps to a customerId
                    // the store credit dropdown gives customerid as accountId-userId, but we only want to filter on accountId
                    var customerId = filter.escapedValue.ToString();
                    var separatorIndex = customerId.IndexOf('-');
                    if (separatorIndex > 0)
                    {
                        customerId = customerId.Substring(0, separatorIndex);
                    }
                    return $"{CUSTOMERID_PROPERTY} eq \"{customerId}\"";
                case "activatedatefrom":
                    return
                        $"{ACTIVATEDATE_PROPERTY} ge \"{((DateTime) filter.value).ToUniversalTime().ToString("o")}\"";
                case "activatedateto":
                    return
                        $"{ACTIVATEDATE_PROPERTY} le \"{((DateTime) filter.value).ToUniversalTime().ToString("o")}\"";
                case "expirationdatefrom":
                    return
                        $"{EXPIRATIONDATE_PROPERTY} ge \"{((DateTime) filter.value).ToUniversalTime().ToString("o")}\"";
                case "expirationdateto":
                    return
                        $"{EXPIRATIONDATE_PROPERTY} le \"{((DateTime) filter.value).ToUniversalTime().ToString("o")}\"";
                case "createdatefrom":
                    return $"{CREATEDATE_PROPERTY} ge \"{((DateTime) filter.value).ToUniversalTime().ToString("o")}\"";
                case "createdateto":
                    return $"{CREATEDATE_PROPERTY} le \"{((DateTime) filter.value).ToUniversalTime().ToString("o")}\"";
                case "updatedatefrom":
                    return $"{UPDATEDATE_PROPERTY} ge \"{((DateTime) filter.value).ToUniversalTime().ToString("o")}\"";
                case "updatedateto":
                    return $"{UPDATEDATE_PROPERTY} le \"{((DateTime) filter.value).ToUniversalTime().ToString("o")}\"";
                case "credittype":
                    return $"{CREDITTYPE_PROPERTY} eq \"{filter.value}\"";
                case "initialbalancefrom":
                    return $"{INITIALBALANCE_PROPERTY} ge \"{filter.value}\"";
                case "initialbalanceto":
                    return $"{INITIALBALANCE_PROPERTY} le \"{filter.value}\"";
                case "currentbalancefrom":
                    return $"{CURRENTBALANCE_PROPERTY} ge \"{filter.value}\"";
                case "currentbalanceto":
                    return $"{CURRENTBALANCE_PROPERTY} le \"{filter.value}\"";
                case "currencycode":
                    return $"{CURRENCYCODE_PROPERTY} eq \"{filter.value}\"";
                case "createby":
                    return $"{CREATEBY_PROPERTY} eq \"{filter.value}\"";
                case "updateby":
                    return $"{UPDATEBY_PROPERTY} eq \"{filter.value}\"";
                case "modifiedby":
                    return $"({UPDATEBY_PROPERTY} eq \"{filter.value}\" or {CREATEBY_PROPERTY} eq \"{filter.value}\")";
                case "currentlyactiveonly":
                    if((bool)filter.value)
                    {
                         return
                             $"{ACTIVATEDATE_PROPERTY} le \"{DateTime.UtcNow.ToString("o")}\" and {EXPIRATIONDATE_PROPERTY} ge {DateTime.UtcNow.ToString("o")}";
                    }
                    return null;
               
                // need service to add support for user name and user email address
                //case "name":
                //    return String.Format("{0} eq \"{1}\"", NAME_PROPERTY, filter.value);
                //case "email":
                //    return String.Format("{0} eq \"{1}\"", EMAIL_PROPERTY, filter.value);
                default:
                    {
                        throw new NotImplementedException($"Unable to filter on property {filter.property}");
                    }
            }
        }
    }
}
