using System;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.OrderHelpers
{
    internal static class OrderFilterExtensions
    {
        private const string ORDERNUMBER = "OrderNumber";
        private const string BILLINGCONTACTFIRSTNAME = "billinginfo.billingcontact.firstname";
        private const string BILLINGCONTACTLASTNAMEORSURNAME = "billinginfo.billingcontact.lastnameorsurname";
        private const string BILLINGCONTACTADDRESS = "billinginfo.billingcontact.address";



        private const string ID = "Id";

        /// <summary>
        /// Converts a FilterCollection for Product to a mozu services-compatible filter string.
        /// </summary>
        public static string ToFilterString(this FilterCollection extFilter, bool? withVariations = null)
        {
            if (extFilter == null || extFilter.Count == 0)
                return "Status ne \"Created\"";

            // TODO: If the filter needs to include products with variations, do something with 'withVariations'
            // Note: this could change, we're waiting on changes to be applied from the services team and/or Britt G.

            // TODO: commenting out this next part. I can't find any way from EXT to make "query" happen.
            // if (!string.IsNullOrEmpty(extFilter.query))
            //     extFilter.Add(new FilterCollectionItem { comparison = "cont", field = PropertyGuy.Convert(x => x.Content.ProductName), value = extFilter.query });

            var stateMents = extFilter.Where(x=> x.property != "all").Select(GetFilter);
            if (!extFilter.Any(x => string.Equals(x.property, "status", StringComparison.OrdinalIgnoreCase)))
            {
                stateMents = stateMents.Concat(new string[] { "Status ne \"Created\"" });
            }
            return string.Join(" and ", stateMents);
        }
        public static string ToQString(this FilterCollection extFilter, bool? withVariations = null)
        {
            string allString;
            if (extFilter.TryGetValue<string>("all", out allString) && !string.IsNullOrWhiteSpace(allString))
            {
                return string.Join(" ", allString.Trim().Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Select(x => x + "*")).Trim();
            }
            return null;
        }

        private static string GetFilter(FilterCollectionItem filter)
        {

            switch (filter.property.ToLowerInvariant())
            {
               
                case "ordernumber": 
                    return string.Format("({1} eq {0})", filter.value, ORDERNUMBER);
                case "billingcontactfirstname":
                    return string.Format("({1} sw {0})", filter.value, BILLINGCONTACTFIRSTNAME);
                case "billingcontactlastname":
                    return string.Format("({1} sw {0})", filter.value, BILLINGCONTACTLASTNAMEORSURNAME);
                case "billingcontactaddress":
                    return string.Format("( {1} cont \"{0}\" )", filter.value, BILLINGCONTACTADDRESS);
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