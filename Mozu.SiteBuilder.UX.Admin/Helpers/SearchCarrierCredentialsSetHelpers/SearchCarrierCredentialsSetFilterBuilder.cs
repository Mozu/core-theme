using Mozu.Core.Exceptions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.SearchCarrierCredentialsSetHelpers
{

   
    public static class CarrierCredentialsSetFilterBuilder
    {
        private const string CARRIERID = "carrierid";
        private const string NAME = "name";

        public static string ToFilterCarrierString( this FilterCollection filterCollection)
        {
            if (filterCollection == null || filterCollection.Count == 0)
                return null;

            StringBuilder sb = new StringBuilder();
            foreach (
                var filter in
                filterCollection.Where(x => x.value != null && !string.IsNullOrEmpty(x.value.ToString())))
            {
                var filterString = GetFilter(filter);
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

        private static string GetFilter(FilterCollectionItem filterItem)
        {
            switch (filterItem.property.ToLowerInvariant())
            {
                case NAME:
                    {
                        return string.Format("name cont \"{0}\"", filterItem.value);
                       
                    }
                case CARRIERID:
                    {
                        return string.Format("carrierid cont \"{0}\"", filterItem.value);
                    }
                default:
                    {
                        throw new VaeMissingOrInvalidParameterException(filterItem.property,
                            "Not a valid filterable property");
                    }
            }
        }

        public static string ToSortString(this SortingCollection sortCollection, bool useSiteContext = false)
        {
            if (sortCollection == null)
                return null;
            
            return string.Join(" and ", sortCollection.Select(x => GetFilter(x, useSiteContext) + (x.IsAscending ? " asc" : " desc")));
        }

        private static string GetFilter(SortingCollectionItem item, bool useSiteContext)
        {
            switch (item.property.ToLowerInvariant())
            {
                case "carrierid":
                    return "carrierid";
                case "name":
                    return "name";
                default:
                    throw new InvalidOperationException("unknown sort.property " + item.property);
            }
        }


        public static string ToFilterCarriers(string CarrierId,string query)
        {
            if (CarrierId != null && !string.IsNullOrEmpty(query))
            {
                return string.Format("carrierid eq {0} AND name cont \"{1}\"", CarrierId,query);

            }
            else
            {
                return string.Format("carrierid eq {0}", CarrierId);
            }

        }


    }
}