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
        private const string ACTIVATEDATE_PROPERTY = "ActivateDate";
        private const string EXPIRATIONDATE_PROPERTY = "ExpirationDate";
        private const string CREATEDATE_PROPERTY = "CreateDate";
        private const string UPDATEDATE_PROPERTY = "UpdateDate";
        private const string CREDITTYPE_PROPERTY = "CreditType";
        private const string INITIALBALANCE_PROPERTY = "InitialBalance";
        private const string CURRENTBALANCE_PROPERTY = "CurrentBalance";
        private const string CURRENCYCODE_PROPERTY = "CurrencyCode";
        private const string CREATEBY_PROPERTY = "CreateBy";
        private const string UPDATEBY_PROPERTY = "UpdateBy";
        private const string NAME_PROPERTY = "Name";
        private const string EMAIL_PROPERTY = "Email";



        /// <summary>
        /// Converts a FilterCollection for Product to a mozu services-compatible filter string.
        /// </summary>
        public static string ToFilterString(this FilterCollection extFilter, bool? withVariations = null)
        {
            if (extFilter == null || extFilter.Count ==0 )
            {
                return null;
            }
          
            // TODO: If the filter needs to include products with variations, do something with 'withVariations'
            // Note: this could change, we're waiting on changes to be applied from the services team and/or Britt G.

            // TODO: commenting out this next part. I can't find any way from EXT to make "query" happen.
            // if (!string.IsNullOrEmpty(extFilter.query))
            //     extFilter.Add(new FilterCollectionItem { comparison = "cont", field = PropertyGuy.Convert(x => x.Content.ProductName), value = extFilter.query });
            StringBuilder sb = new StringBuilder();
            foreach (var filter in extFilter.Where(x => x.value != null && x.property != "all" && !string.IsNullOrEmpty(x.value.ToString())))
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
            if (extFilter.TryGetValue<string>("all", out allString) && !string.IsNullOrWhiteSpace(allString))
            {
                return string.Join(" ", allString.Trim().Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Select(x =>
                {
                    int tmp;
                    if (int.TryParse(x, out tmp))
                    {
                        extFilter.Add(new FilterCollectionItem()
                                             {
                                                 field = "id",
                                                 property = "id",
                                                 value = tmp
                                             });
                        return null;
                    }
                    else
                    {
                        return x + "*";
                    }
                
                   
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
                    return string.Format("groups eq {0}", filter.value);
                case "segments":
                    return string.Format("segments.id eq {0}", filter.value);
                case "notsegments":
                    return string.Format("segments.id ne {0}", filter.value);
                case "segment":
                    return string.Format("segments.id eq {0}", filter.value);
                case "notsegment":
                    return string.Format("segments.id ne {0}", filter.value);
                default:
                    {
                        throw new NotImplementedException("unable to filter on property " + filter.property);
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
                return null;


            StringBuilder sb = new StringBuilder();
            foreach (var filter in extFilter.Where(x => x.value != null && !string.IsNullOrEmpty(x.value.ToString())))
            {

                var filterString = GetCreditFilter(filter.value, filter);
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
        
        private static string GetCreditFilter(object value, FilterCollectionItem filter)
        {
           /*
            // Store Credit constants
        private const string CODE_PROPERTY = "Code";
        private const string CUSTOMERID_PROPERTY = "CustomerId";
        private const string ACTIVATEDATE_PROPERTY = "ActivateDate";
        private const string EXPIRATIONDATE_PROPERTY = "ExpirationDate";
        private const string CREATEDATE_PROPERTY = "CreateDate";
        private const string UPDATEDATE_PROPERTY = "UpdateDate";
        private const string CREDITTYPE_PROPERTY = "CreditType";
        private const string INITIALBALANCE_PROPERTY = "InitialBalance";
        private const string CURRENTBALANCE_PROPERTY = "CurrentBalance";
        private const string CURRENCYCODE_PROPERTY = "CurrencyCode";
        private const string CREATEBY_PROPERTY = "CreateBy";
        private const string UPDATEBY_PROPERTY = "UpdateBy";
            */

            switch (filter.property.ToLowerInvariant())
            {
                case "all":
                    var retVal = String.Format("{0} eq '{2}' or {1} eq '{2}'", CODE_PROPERTY, CUSTOMERID_PROPERTY, filter.escapedValue);
                    return retVal;
                case "code":
                    return String.Format("{0} eq \"{1}\"", CODE_PROPERTY, filter.escapedValue);
                case "customerid":
                    return String.Format("{0} eq \"{1}\"", CUSTOMERID_PROPERTY, filter.escapedValue);
                case "activatedatefrom":
                    return String.Format("{0} gt \"{1}\"", ACTIVATEDATE_PROPERTY, filter.value);
                case "activatedateto":
                    return String.Format("{0} lt \"{1}\"", ACTIVATEDATE_PROPERTY, filter.value);
                case "expirationdatefrom":
                    return String.Format("{0} gt \"{1}\"", EXPIRATIONDATE_PROPERTY, filter.value);
                case "expirationdateto":
                    return String.Format("{0} lt \"{1}\"", EXPIRATIONDATE_PROPERTY, filter.value);
                case "createdatefrom":
                    return String.Format("{0} gt \"{1}\"", CREATEDATE_PROPERTY, filter.value);
                case "createdateto":
                    return String.Format("{0} lt \"{1}\"", CREATEDATE_PROPERTY, filter.value);
                case "updatedatefrom":
                    return String.Format("{0} gt \"{1}\"", UPDATEDATE_PROPERTY, filter.value);
                case "updatedateto":
                    return String.Format("{0} lt \"{1}\"", UPDATEDATE_PROPERTY, filter.value);
                case "credittype":
                    return String.Format("{0} eq \"{1}\"", CREDITTYPE_PROPERTY, filter.value);
                case "initialbalance":
                    return String.Format("{0} eq \"{1}\"", INITIALBALANCE_PROPERTY, filter.value);
                case "currentbalance":
                    return String.Format("{0} eq \"{1}\"", CURRENTBALANCE_PROPERTY, filter.value);
                case "currencycode":
                    return String.Format("{0} eq \"{1}\"", CURRENCYCODE_PROPERTY, filter.value);
                case "createby":
                    return String.Format("{0} eq \"{1}\"", CREATEBY_PROPERTY, filter.value);
                case "updateby":
                    return String.Format("{0} eq \"{1}\"", UPDATEBY_PROPERTY, filter.value);

                // need service to add support for user name and user email address
                //case "name":
                //    return String.Format("{0} eq \"{1}\"", NAME_PROPERTY, filter.value);
                //case "email":
                //    return String.Format("{0} eq \"{1}\"", EMAIL_PROPERTY, filter.value);

                default:
                    {
                        throw new NotImplementedException("unable to filter on property " + filter.property);
                    }
            }
        }

    }
}
