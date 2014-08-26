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
    }

 
  
}
