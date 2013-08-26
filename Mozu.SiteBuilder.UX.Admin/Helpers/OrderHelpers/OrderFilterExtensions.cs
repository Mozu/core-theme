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

            var stateMents = extFilter.Select(GetFilter);
            if (!extFilter.Any(x => string.Equals(x.property, "status", StringComparison.OrdinalIgnoreCase)))
            {
                stateMents = stateMents.Concat(new string[] { "Status ne \"Created\"" });
            }
            return string.Join(" and ", stateMents);
        }

        private static string GetFilter(FilterCollectionItem filter)
        {

            switch (filter.property.ToLowerInvariant())
            {
                case "all": //commenting out full desc till supported by service
                    int i;
                    if (int.TryParse(filter.value as string, out i))
                    {
                        return string.Format("({1} eq {0})", filter.value, ORDERNUMBER);
                    }
                    else
                    {
                        return string.Format("( {1} cont \"{0}\" or {2} sw \"{0}\" or {3} sw \"{0}\" or {4} sw \"{0}\" )", filter.value, BILLINGCONTACTADDRESS, BILLINGCONTACTFIRSTNAME, BILLINGCONTACTFIRSTNAME, BILLINGCONTACTLASTNAMEORSURNAME);   
                    }
                case "ordernumber":
                    return string.Format("({1} eq {0})", filter.value, ORDERNUMBER);
                default:
                    {
                        throw new NotImplementedException("unable to filter on property " + filter.property);
                    }
            }
        }
    }
}