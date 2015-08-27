using System;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.LocalizedContentHelpers
{
    internal static class LocalizedContentFilterExtensions
    {
        private const string ATTRIBUTE_FQN = "attributefqn";
        private const string ATTRIBUTE_NAME = "name";
        private const string ATTRIBUTE_ADMIN_NAME = "adminname";

        private const string VARIANT_PARENT_PRODUCT_CODE = "parentproductcode";
        private const string VARIANT_PRODUCT_CODE = "variantproductcode";

        /// <summary>
        /// Converts a FilterCollection for Attribute to a mozu services-compatible filter string.
        /// </summary>
        public static string ToFilterString(this FilterCollection extFilter)
        {
            if (extFilter == null || extFilter.Count == 0)
                return null;

            return String.Join(" and ", extFilter.Select(GetFilter));
        }

        private static string GetFilter(FilterCollectionItem filter)
        {
            
            switch (filter.property.ToLowerInvariant())
            {
                case "all": // todo: how to handle across  - Greg Murray on 2014-07-18 
                case "name":
                    return String.Format("{1} cont \"{0}\"", filter.value, ATTRIBUTE_NAME);
                case "attributefqn":
                    return String.Format("{2} {1} {0}", filter.value, filter.comparison, ATTRIBUTE_FQN);
                case "localeexists":
                    return String.Format("localeexists eq {0}", filter.value);
                case "localenotexists":
                    return String.Format("localenotexists eq {0}", filter.value); 
                case "exists":
                    return String.Format("exists eq {0}", filter.value);

                case "adminname":
                    return String.Format("{1} cont \"{0}\"", filter.value, ATTRIBUTE_ADMIN_NAME);


                case "parentproductcode":
                    return String.Format("{2} {1} \"{0}\"", filter.value, filter.comparison, VARIANT_PARENT_PRODUCT_CODE);
                case "variantproductcode":
                    return String.Format("{2} {1} \"{0}\"", filter.value, filter.comparison, VARIANT_PRODUCT_CODE);
                
                case "productname":
                    return String.Format("{1} cont \"{0}\"", filter.value, filter.property.ToLowerInvariant());  //review const?

            }
            return "";
        }
    }
}