using System;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.CustomerHelpers
{
    internal static class CustomerFilterExtensions
    {
        private const string FIRSTNAME = "Contact.FirstName";
        private const string LASTNAMEORSURNAME = "Contact.LastNameOrSurname";
        private const string EMAIL = "Contact.Email";
        

        /// <summary>
        /// Converts a FilterCollection for Product to a mozu services-compatible filter string.
        /// </summary>
        public static string ToFilterString(this FilterCollection extFilter, bool? withVariations = null)
        {
            if (extFilter == null || extFilter.Count == 0)
                return null;

            // TODO: If the filter needs to include products with variations, do something with 'withVariations'
            // Note: this could change, we're waiting on changes to be applied from the services team and/or Britt G.

            // TODO: commenting out this next part. I can't find any way from EXT to make "query" happen.
            // if (!string.IsNullOrEmpty(extFilter.query))
            //     extFilter.Add(new FilterCollectionItem { comparison = "cont", field = PropertyGuy.Convert(x => x.Content.ProductName), value = extFilter.query });
            var stateMents = extFilter.Where( x=> x.value != null ).Where( x=>!String.IsNullOrEmpty( x.value.ToString()) ).SelectMany(x=>  x.value.ToString().Split( ' ' ).Select( _=> GetFilter( _, x)) );
           
            return string.Join(" and ", stateMents);
        }

        private static string GetFilter(string value, FilterCollectionItem filter)
        {
            
            switch (filter.property.ToLowerInvariant())
            {
                case "all": //commenting out full desc till supported by service


                    return string.Format("({1} sw \"{0}\" or {2} sw \"{0}\" or {3} sw \"{0}\")", value, FIRSTNAME, LASTNAMEORSURNAME, EMAIL);
                 
                default:
                    {
                        throw new NotImplementedException("unable to filter on property " + filter.property);
                    }
            }
        }
    }
}