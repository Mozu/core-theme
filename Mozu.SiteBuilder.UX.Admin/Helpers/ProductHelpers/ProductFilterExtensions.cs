using System;
using System.Collections;
using System.Linq;
using System.Text;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.ProductHelpers
{
    public static class ProductFilterExtensions
    {       
        private const string PRODUCT_NAME_PROPERTY = "productincatalogs.content.productName";
        private const string PRODUCT_CODE_PROPERTY = "productCode";
        private const string PRICE_PROPERTY = "productsincatalog.price.price";
        private const string PRICE_MSRP_PROPERTY = "price.msrp";
        private const string PRICE_MAP_PROPERTY = "price.map";
        private const string CATEGORY_ID_PROPERTY = "productincatalogs.productcategories.categoryId";
        private const string IS_ACTIVE_PROPERTY = "productincatalogs.isActive";
        private const string IS_CURRENTLY_ACTIVE_PROPERTY = "productincatalogs.iscurrentlyactive";
        private const string IS_VARIATION = "isVariation";
        private const string STOCK_ON_HAND_PROPERTY = "stockOnHand";
        private const string SITE_ID_PROPERTY = "productincatalogs.siteId";
        private const string PRODUCT_FULL_DESCRIPTION = "productincatalogs.content.productFullDescription";
        private const string PRODUCT_PUBLISHED_STATE = "publishinginfo.publishedstate";
        private const string PRODUCT_UPC_PROPERTY = "upc";
        private const string PRODUCT_MFG_PART_NUM_PROPERTY = "supplierInfo.mfgPartNumber";
        private const string PRODUCT_DIST_PART_NUM_PROPERTY = "supplierInfo.distPartNumber";
        private const string PUBLISH_SET_CODE = "publishsetcode";
        private const string PRODUCT_USAGE = "productUsage";
        private const string BASE_PRODUCT_CODE = "baseProductCode";
        private const string ATTRIBUTE_CODE = "attributecode";
        private const string ATTRIBUTE= "attribute";
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

            if (extFilter.Count == 0)
            {
                return null;
            }

            if (withVariations.GetValueOrDefault(false))
            {
                var item = extFilter.FirstOrDefault(x => string.Equals(x.field, "productcode", StringComparison.OrdinalIgnoreCase)
                                                         || string.Equals(x.property, "productcode", StringComparison.OrdinalIgnoreCase));
                if (item != null)
                {
                    item.property = item.field = "productinventorycode";
                }
            }

            var sb = new StringBuilder();

            foreach (var filter in extFilter.Where(x =>
                x.value != null && x.property != "all" && !string.IsNullOrEmpty(x.value.ToString())))
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
                 return string.Join(" ", allString.Trim().Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Select(x => x + (x.Length > 3 ? "*" : ""))).Trim();
             }
             if (!string.IsNullOrEmpty( extFilter.query) )
             {
                 return string.Join(" ", extFilter.query.Trim().Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Select(x => x + (x.Length > 3 ? "*" : ""))).Trim();
             }
             return null;
         }
        private static string GetFilter(object value , FilterCollectionItem filter)
        {
            switch (filter.property.ToLowerInvariant())
            {
                case "categoryid":
                case "category":
                case "categoryids":
                    return string.Format("productincatalogs.productcategories.categoryid eq {0}", filter.value);
                case "isactive":
                    return string.Format("{1} eq {0}", filter.value , IS_ACTIVE_PROPERTY);
                case "iscurrentlyactive":
                    return string.Format("{1} eq {0}", filter.value , IS_CURRENTLY_ACTIVE_PROPERTY);
                case "productname":
                case "name":
                    return string.Format("{1} cont \"{0}\"", filter.value, PRODUCT_NAME_PROPERTY);
                case "productfulldescription":
                    return string.Format("{1} cont \"{0}\"", filter.value, PRODUCT_FULL_DESCRIPTION);
                case "productcode" :
                    return string.Format("(productCode in [{0}])",
                        value.ToString().Split(',')
                            .Select(code => string.Format("\"{0}\"", code.Trim()))
                            .Aggregate((a, b) => a + "," + b));
                case "productinventorycode":
                    var filterString = value.ToString()
                        .Split(',')
                        .Select(code => string.Format("\"{0}\"", code.Trim()))
                        .Aggregate((a, b) => a + "," + b);
                    return string.Format("(IsVariation eq true or IsVariation eq false) and (productCode in [{0}] or baseProductCode in [{0}])",filterString);
                case "producttypeid":
                case "producttype":
                    return string.Format("productTypeId eq {0}", value);
                case "minprice":
                    return string.Format("{1} ge {0}", filter.value,  PRICE_PROPERTY);
                case "maxprice":
                    return string.Format("{1} le {0}", filter.value, PRICE_PROPERTY);
                case "excludebundles":
                    return value.ToString().ToLower() == "true"
                        ? string.Format("{0} ne bundle and {0} ne component", PRODUCT_USAGE)
                        : "";
                case "productusage":
                {
                    if (!(value is string) && value is IEnumerable)
                    {
                        var filters = ((IEnumerable)value).Cast<object>().Select(v => "productUsage eq " + v).ToArray();
                        return "(" + String.Join(" or ", filters) + ")";
                    }
                    else
                    {
                        return string.Format("productUsage eq {0}", value);
                    }
                }
                case "modifiedby":
                    return string.Format("(createby eq \"{0}\" or updateby eq \"{0}\")", filter.value );
                case "modifiedfrom" :
                    return string.Format("updatedate ge {0}", ((DateTime)filter.value).ToUniversalTime().ToString("o"));
                case "modifiedto":
                    return string.Format("updatedate le {0}", ((DateTime)filter.value).AddDays(1).AddTicks(-1).ToUniversalTime().ToString("o"));
                case "price":
                    return string.Format("{2} {1} {0}", filter.value, filter.comparison, PRICE_PROPERTY);
                case "stockonhand":
                    return string.Format("{2} {1} {0}", filter.value, filter.comparison, STOCK_ON_HAND_PROPERTY);
                case "siteid":
                    return string.Format("{1} eq {0}", filter.value, SITE_ID_PROPERTY);
                case "publishedstate":
                    return string.Format("{1} ne Live", filter.value, PRODUCT_PUBLISHED_STATE);
                case "publishedstatefilter":
                    return string.Format("{1} eq {0}", filter.value, PRODUCT_PUBLISHED_STATE);
                case "upc":
                    return string.Format("{1} eq \"{0}\"", filter.value, PRODUCT_UPC_PROPERTY);
                case "mfgpartnumber":
                    return string.Format("{1} eq \"{0}\"", filter.value, PRODUCT_MFG_PART_NUM_PROPERTY);
                case "distpartnumber":
                    return string.Format("{1} eq \"{0}\"", filter.value, PRODUCT_DIST_PART_NUM_PROPERTY);
                case "msrp":
                    return string.Format("{1} eq {0}", filter.value, PRICE_MSRP_PROPERTY);
                case "map":
                    return string.Format("{1} eq {0}", filter.value, PRICE_MAP_PROPERTY);
                case "publishsetcode":
                    return string.Format("{1} eq {0}", filter.value, PUBLISH_SET_CODE);
                case "includevariations":
                        if (value.ToString().ToLower() == "true")
                        {
                            return string.Format("({0} eq true or {0} eq false)", IS_VARIATION);
                        }
                        return string.Format("({0} eq false)", IS_VARIATION);
                case "excludevariations":
                    if (value.ToString().ToLower() == "true")
                    {
                        return string.Format("({0} eq false)", IS_VARIATION);
                    }
                    return string.Format("({0} eq true or {0} eq false)", IS_VARIATION);
                case "excludebase":
                    return string.Format("({0} eq standard or {0} eq component or ({0} eq configurable and {1} eq true))", PRODUCT_USAGE, IS_VARIATION);
                case "baseproductcode":
                    return string.Format("({0} eq \"{1}\")", BASE_PRODUCT_CODE, filter.value);
                case "attributecode":
                    return string.Format("({0} eq \"{1}\")", ATTRIBUTE_CODE, filter.value);
                case "attribute":

                    //allow for multiple 
                    var splitOnSemiColon = filter.value.ToString().Split(';');

                    var formattedString = "(";
                    for(int i = 0; i < splitOnSemiColon.Length; i++)
                    {
                        if(i > 0)
                        {
                            formattedString += " and ";
                        }
                        formattedString +=  string.Format("{0} eq \"{1}\"", ATTRIBUTE, splitOnSemiColon[i]);
                    }
                    formattedString += ')';

                    return formattedString;
                default:
                    {
                        throw new NotImplementedException("unable to filter on property " + filter.property);
                    }
            }
        }
    }
}