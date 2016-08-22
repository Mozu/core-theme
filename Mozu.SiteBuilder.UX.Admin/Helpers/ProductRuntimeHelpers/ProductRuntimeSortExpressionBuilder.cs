using System;
using System.IO;
using System.Runtime.Serialization.Json;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.ProductRuntimeHelpers
{
    public interface IProductRuntimeSortExpressionBuilder : ISortExpressionBuilder
    {
        string GetFromSortString(string input);
    }

    /// <summary>
    /// Singleton class that maps sort keys to Mozu API sort keys
    /// </summary>
    public class ProductRuntimeSortExpressionBuilder : AbstractSortExpressionBuilder,
        IProductRuntimeSortExpressionBuilder
    {
        protected override string GetFilter(SortingCollectionItem item, bool useSiteContext)
        {
            switch (item.property.ToLowerInvariant())
            {
                case "productcode":
                    return "productCode";
                case "saleprice":
                    return "price.SalePrice";
                case "price": 
                    return "price";
                case "name":
                    return "productname";
                case "createdate":
                    return "createdate";
                case "producttypeid":
                    return "producttypeid";
                case "daysavailableincatalog":
                    return "DaysAvailableInCatalog";

                default:
                    throw new InvalidOperationException("unknown sort.property " + item.property);
            }
        }

        protected override string GetDefaultSort()
        {
            return string.Empty;
        }

        public string GetFromSortString(string input)
        {
            var returnString = "";

            if (!string.IsNullOrWhiteSpace(input))
            {
                var serializer = new DataContractJsonSerializer(typeof(SortingCollection));
                var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(input)) { Position = 0 };
                var sortObj = (SortingCollection)serializer.ReadObject(stream);
                if (sortObj.Count > 0)
                    returnString = this.ToSortString(sortObj);
            }

            return returnString;
        }
    }
}