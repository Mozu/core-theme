using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Helpers.ProductRuntimeHelpers
{
    public interface IProductRuntimeSortExpressionBuilder : ISortExpressionBuilder
    {
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
                    return "price.CatalogSalePrice";
                case "price":
                    return "price.CatalogListPrice";
                case "name":
                    return "name";
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
    }
}