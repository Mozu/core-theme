using System;
using System.Linq;
using System.Text;
using Mozu.Content.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.FileManagerHelpers
{
    internal static class FileManagerHelpersFilterExtensions
    {
        /// <summary>
        ///     Converts a FilterCollection for Product to a mozu services-compatible filter string.
        /// </summary>
        public static string ToFilterString(this FilterCollection extFilter, bool? withVariations = null)
        {
           
            if (extFilter.Count == 0)
                return null;


            var sb = new StringBuilder();
            foreach (FilterCollectionItem filter in extFilter)
            {
               
                string filterString = GetFilter(filter.value, filter);
                if (!string.IsNullOrWhiteSpace(filterString))
                {
                    if (sb.Length > 1)
                    {
                        sb.Append(" and ");
                    }
                    sb.Append(filterString);
                }

                //}
            }

            return sb.ToString().Trim();
        }


        //public static string ToQString(this FilterCollection extFilter, bool? withVariations = null)
        //{
        //    string allString;
        //    if (extFilter.TryGetValue("all", out allString) && !string.IsNullOrWhiteSpace(allString))
        //    {
        //        return string.Join(" ", allString.Trim().Split(new[] {' '}, StringSplitOptions.RemoveEmptyEntries).Select(x => x + "*")).Trim();
        //    }
        //    if (!string.IsNullOrEmpty(extFilter.query))
        //    {
        //        return string.Join(" ", extFilter.query.Trim().Split(new[] {' '}, StringSplitOptions.RemoveEmptyEntries).Select(x => x + "*")).Trim();
        //    }
        //    return null;
           
        //}

        private static string GetFilter(object value, FilterCollectionItem filter)
        {
            switch (filter.property.ToLowerInvariant())
            {
                case "all":
                case "name":
                case "filename":
                    return string.Format("name cont \"{0}\"", filter.value);


                case "createdby":
                    return string.Format("(createby eq \"{0}\" or updateby eq \"{0}\")", filter.value);
                case "createdfrom":
                {
                    if (filter.value is DateTime)
                    {
                        return string.Format("InsertDate ge {0}", ((DateTime)filter.value).ToString("o"));
                    }
                    else
                    {
                        return string.Format("InsertDate ge {0}", filter.value);
                    }
                }
                  //  return string.Format("InsertDate ge {0}", filter.value);
                case "createdto":
                {
                    if (filter.value is DateTime)
                    {
                        return string.Format("InsertDate le {0}", ((DateTime) filter.value).ToString("o"));
                    }
                    else
                    {
                        return string.Format("InsertDate le {0}", filter.value);
                    }
                }
                    
                case "tags":
                case "tag":
                    return string.Format("Properties.tags eq \"{0}\"", filter.value);

                default:
                {
                    throw new NotImplementedException("unable to filter on property " + filter.property);
                }
            }
        }
    }
}