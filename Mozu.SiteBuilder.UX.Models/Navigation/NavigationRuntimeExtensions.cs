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
            foreach (var n in nodes)
            {
                if (n.NodeType.IsCategory && n.Id == "category^^" + category.CategoryId)
                    return n;
                if (n.Items != null && n.Items.Count > 0)
                {
                    NavigationRuntimeNode foundCat = FindByCategory(n.Items, category);
                    if (foundCat != null)
                        return foundCat;
                }
            }

            return null;
        }

        public static NavigationRuntimeNode FindByProduct(this List<NavigationRuntimeNode> nodes, Product product)
        {
            foreach (var n in nodes)
            {
                if (n.NodeType.IsProduct && n.Id == "product^^" + product.ProductCode)
                    return n;
                if (n.Items != null && n.Items.Count > 0)
                {
                    NavigationRuntimeNode foundProduct = FindByProduct(n.Items, product);
                    if (foundProduct != null)
                        return foundProduct;
                }
            }

            return null;
        }
    }
}
