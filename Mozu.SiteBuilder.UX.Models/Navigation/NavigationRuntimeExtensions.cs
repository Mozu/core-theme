using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Mozu.Content.Contracts;
using Mozu.ProductRuntime.Contracts;
using Mozu.SiteBuilder.Mvc.Models.CMS;
//using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;

namespace Mozu.SiteBuilder.UX.Models.Navigation
{
    public static class NavigationRuntimeExtensions
    {
        public static IRuntimeNavigationNode FindNode(this List<IRuntimeNavigationNode> nodes, string nodeType, string id)
        {
            var queue = new Queue<IRuntimeNavigationNode>(nodes);
            while (queue.Count > 0)
            {
                var node = queue.Dequeue();
                if (
                    (string.Equals(node.Id , id, StringComparison.OrdinalIgnoreCase))
                ||
                    ((string.IsNullOrEmpty(nodeType) || node.NodeType == nodeType) && string.Equals(node.OriginalId, id, StringComparison.OrdinalIgnoreCase)))
                {
                    return node;
                }
                    
                if (node.Items != null)
                {
                    foreach (var child in node.Items)
                        queue.Enqueue(child);
                }
            }

            return null;
        }

        public static IRuntimeNavigationNode FindByCategory(this List<IRuntimeNavigationNode> nodes, Category category)
        {
            return FindNode(nodes, "category", category.CategoryId.ToString());
        }



        public static IRuntimeNavigationNode FindByProduct(this List<IRuntimeNavigationNode> nodes, Product product)
        {
            return FindNode(nodes, "product", product.ProductCode);
        }

        public static IRuntimeNavigationNode FindByDocument(this List<IRuntimeNavigationNode> nodes, Document document)
        {
            return FindNode(nodes, "page", document.Id);
        }
    }
}
