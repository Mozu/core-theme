using System;
using System.Linq;
using System.Text;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.ProductHelpers
{
    internal static class ProductFilterExtensions
    {
        private const string PRODUCT_NAME_PROPERTY = "productinsites.content.productName";
        private const string PRODUCT_CODE_PROPERTY = "productCode";
        private const string PRICE_PROPERTY = "productinsites.price.price";
        private const string CATEGORY_ID_PROPERTY = "productinsites.productcategories.categoryId";
        private const string IS_ACTIVE_PROPERTY = "productinsites.isActive";
        private const string STOCK_ON_HAND_PROPERTY = "stockOnHand";
        private const string SITE_ID_PROPERTY = "productinsites.siteId";
        private const string PRODUCT_FULL_DESCRIPTION = "productinsites.content.productFullDescription";
        private const string PRODUCT_PUBLISHED_STATE = "publishinginfo.publishedstate";

        /// <summary>
        /// Converts a FilterCollection for Product to a mozu services-compatible filter string.
        /// </summary>
        public static string ToFilterString(this FilterCollection extFilter, bool? withVariations = null)
        {
           

            // TODO: If the filter needs to include products with variations, do something with 'withVariations'
            // Note: this could change, we're waiting on changes to be applied from the services team and/or Britt G.

            // TODO: commenting out this next part. I can't find any way from EXT to make "query" happen.
            // if (!string.IsNullOrEmpty(extFilter.query))
            //     extFilter.Add(new FilterCollectionItem { comparison = "cont", field = PropertyGuy.Convert(x => x.Content.ProductName), value = extFilter.query });
            
            if (!string.IsNullOrWhiteSpace(extFilter.QueryString["productCode"]))
            {
                extFilter.Add(new FilterCollectionItem()
                                  {
                                      comparison ="eq", 
                                      property  ="productCode", 
                                      value = extFilter.QueryString["productCode"]
                                  });
            }
            ;

            if ( extFilter.Count == 0)
                return null;



            StringBuilder sb = new StringBuilder();
            foreach (var filter in extFilter.Where(x => x.value != null && x.property != "all" && !string.IsNullOrEmpty(x.value.ToString())))
            {
                var values = filter.value.ToString().Trim().Split(new char[] {','}, StringSplitOptions.RemoveEmptyEntries).Select(x => x.Trim()).ToArray();
                if (values.Length > 1)
                {
                    if (sb.Length > 1)
                    {
                        sb.Append(" and ");
                    }
                    sb.Append("( ");
                    for ( int  i = 0; i < values.Length ;i++)
                    {
                        var filterString = GetFilter(values[i], filter);
                        if (!string.IsNullOrWhiteSpace(filterString))
                        {
                            if (i > 0)
                            {
                                sb.Append(" or ");
                            }
                            sb.Append(filterString);
                        }

                    }
                    sb.Append(" ) ");
                }
                else
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
            }

            return sb.ToString().Trim();
        }


         public static string ToQString(this FilterCollection extFilter, bool? withVariations = null)
         {
             string allString;
             if (extFilter.TryGetValue<string>("all", out allString) && !string.IsNullOrWhiteSpace(allString))
             {
                 return string.Join(" ", allString.Trim().Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Select(x=> x+"*")).Trim();
             }
             if (!string.IsNullOrEmpty( extFilter.query) )
             {
                 return string.Join(" ", extFilter.query.Trim().Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Select(x => x + "*")).Trim();
             }
             return null;
         }
        private static string GetFilter(object value , FilterCollectionItem filter)
        {
            switch (filter.property.ToLowerInvariant())
            {
                case "categoryids":
                    return string.Format("productinsites.productcategories.categoryid eq {0}", filter.value);
                case "isactive":
                    return string.Format("{1} eq {0}", filter.value , IS_ACTIVE_PROPERTY);
                case "productname":
                case "name":
                    return string.Format("{1} cont \"{0}\"", filter.value, PRODUCT_NAME_PROPERTY);
                case "productfulldescription":
                    return string.Format("{1} cont \"{0}\"", filter.value, PRODUCT_FULL_DESCRIPTION);
                case "productcode" :
                    {
                       return string.Format("ProductCode eq \"{0}\"", value);    
                    }
                    
                case "producttypeid":
                    return string.Format("productTypeId eq {0}", value);
               
                case "price":
                    return string.Format("{2} {1} {0}", filter.value, filter.comparison, PRICE_PROPERTY);
                case "stockonhand":
                    return string.Format("{2} {1} {0}", filter.value, filter.comparison, STOCK_ON_HAND_PROPERTY);
                case "siteid":
                    return string.Format("{1} eq {0}", filter.value, SITE_ID_PROPERTY);
                case "publishedstate":
                    return String.Format("{1} ne Live", filter.value, PRODUCT_PUBLISHED_STATE);
                default:
                    {
                        throw new NotImplementedException("unable to filter on property " + filter.property);
                    }
            }
        }
    }
}