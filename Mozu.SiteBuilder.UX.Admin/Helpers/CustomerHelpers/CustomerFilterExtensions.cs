using System;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.CustomerHelpers
{
    internal static class CustomerFilterExtensions
    {
        private const string FIRSTNAME = "Contacts.FirstName";
        private const string LASTNAMEORSURNAME = "Contacts.LastNameOrSurname";
        private const string EMAIL = "Contacts.Email";
        

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
            var stateMents = extFilter.Where( x=> x.value != null && x.property != "all").Where( x=>!String.IsNullOrEmpty( x.value.ToString()) ).SelectMany(x=>  x.value.ToString().Split( ' ' ).Select( _=> GetFilter( _, x)) );
           
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
        private static string GetFilter(string value, FilterCollectionItem filter)
        {
            
            switch (filter.property.ToLowerInvariant())
            {
                default:
                    {
                        throw new NotImplementedException("unable to filter on property " + filter.property);
                    }
            }
        }
    }

 
  
}
