using System;
using System.Collections.Generic;
using System.Linq;
using Mozu.SiteBuilder.UX.Models.Navigation;

namespace Mozu.SiteBuilder.UX.Admin.Navigation
{
    public static class NavigationNodeExtensions
    {
        /// <summary>
        /// Gets the order of just categories in a NavigationNode list.
        /// </summary>
        public static IEnumerable<CategoryOrderInformation> GetCategoryOrder(this List<NavigationTreeNode> nodes)
        {
            return
                from n in nodes
                where n.NodeType.IsCategory
                let canonicalIndex = nodes.Where(no => no.NodeType.IsCategory && no.ParentId == n.ParentId).OrderBy(no => no.Index).ToList().IndexOf(n)
                select new CategoryOrderInformation { Id = n.Id, ParentId = n.ParentId, Index = n.Index.HasValue ? n.Index.Value : 0, CanonicalIndex = canonicalIndex, Node = n };
        }

        /// <summary>
        /// Gets the order of just pages in a NavigationNode list.
        /// </summary>
        public static IEnumerable<CategoryOrderInformation> GetPagesOrder(this List<NavigationTreeNode> nodes)
        {
            return
                from n in nodes
                where n.NodeType.IsPage
                select new CategoryOrderInformation { Id = n.Id, ParentId = n.ParentId, Index = n.Index.HasValue ? n.Index.Value : 0, Node = n };
        }
    }

    public class CategoryOrderInformation
    {
        public string Id { get; set; }
        public string ParentId { get; set; }

        /// <summary>
        /// The index according to the NavigationNode
        /// </summary>
        public int Index { get; set; }

        /// <summary>
        /// The index of this category among other categories.
        /// </summary>
        public int CanonicalIndex { get; set; }

        /// <summary>
        /// The original NavigationTreeNode for this element.
        /// </summary>
        public NavigationTreeNode Node { get; set; }
    }
}