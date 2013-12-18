using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Mozu.ProductRuntime.Contracts;
using Mozu.SiteBuilder.Mvc.Models.CMS;
//using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;

namespace Mozu.SiteBuilder.UX.Models.Navigation
{
    public static class NavigationRuntimeExtensions
    {
        public static NavigationRuntimeNode FindNode(this List<NavigationRuntimeNode> nodes, string nodeType, string id)
        {
            var queue = new Queue<NavigationRuntimeNode>( nodes);
            while (queue.Count > 0)
            {
                var node = queue.Dequeue();
                if ((string.IsNullOrEmpty(nodeType) || node.NodeType == nodeType) && string.Equals(node.OriginalId, id, StringComparison.OrdinalIgnoreCase))
                    return node;
                if (node.Items != null)
                {
                    node.Items.ForEach(queue.Enqueue);
                    
                }
            }

            return null;
        }

        public static NavigationRuntimeNode FindByCategory(this List<NavigationRuntimeNode> nodes, Category category)
        {
            return FindNode(nodes, "category", category.CategoryId.ToString());
        }

      

        public static NavigationRuntimeNode FindByProduct(this List<NavigationRuntimeNode> nodes, Product product)
        {
            return FindNode(nodes, "product", product.ProductCode);
        }

        public static NavigationRuntimeNode FindByDocument(this List<NavigationRuntimeNode> nodes, Document document)
        {
            return FindNode(nodes, "page", document.Id);
        }
    }
}
