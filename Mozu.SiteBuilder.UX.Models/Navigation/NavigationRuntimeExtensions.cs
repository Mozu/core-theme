using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;

namespace Mozu.SiteBuilder.UX.Models.Navigation
{
    public static class NavigationRuntimeExtensions
    {
        public static NavigationRuntimeNode FindByCategory(this List<NavigationRuntimeNode> nodes, Category category)
        {
            return (from n in nodes
             where n.NodeType.IsCategory
             where n.Id == "category^^" + category.CategoryId
             select n).FirstOrDefault();
        }

        public static NavigationRuntimeNode FindByProduct(this List<NavigationRuntimeNode> nodes, Product product)
        {
            return (from n in nodes
             where n.NodeType.IsProduct
             where n.Id == "product^^" + product.ProductCode
             select n).FirstOrDefault();
        }
    }
}
