using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using AutoMapper;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.UX.Models.Navigation;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;

namespace Mozu.SiteBuilder.Mvc
{
    /// <summary>
    /// Provides a rich navigation object for SiteBuilderContext.
    /// Accessible at runtime via SiteContext.Navigation.
    /// </summary>
    public class NavigationContext : IEnumerable<NavigationRuntimeNode>
    {
        private List<NavigationRuntimeNode> _navigationTree;

        public List<NavigationRuntimeNode> Tree { get { return _navigationTree; } }

        /// <summary>
        /// Public constructor.
        /// </summary>
        public NavigationContext(List<NavigationRuntimeNode> navigationTree)
        {
            _navigationTree = navigationTree ?? new List<NavigationRuntimeNode>();
        }

        /// <summary>
        /// Contains the current node in the navigation tree.
        /// </summary>
        public NavigationRuntimeNode CurrentNode { get; private set; }
        
        /// <summary>
        /// Returns a collection of NavigationRuntimeNodes representing the path from the site root to the current node.
        /// </summary>
        public IEnumerable<NavigationRuntimeNode> Breadcrumbs
        {
            get {
                return GetBreadcrumbs(CurrentNode);
            }
        }

        /// <summary>
        /// In the case of a product belonging to multiple categories, there are multiple breadcrumbs possible.
        /// This enumerates all of those breadcrumbs lists.
        /// </summary>
        public IEnumerable<IEnumerable<NavigationRuntimeNode>> Breadcrumbses
        {
            get {
                if (CurrentNode.NodeType == "product")
                {
                    // only product has multiple parents
                    List<NavigationRuntimeNode> parents = new List<NavigationRuntimeNode> { new NavigationRuntimeNode(), new NavigationRuntimeNode() };

                    foreach (var p in parents)
                    {
                        var seed = new Stack<NavigationRuntimeNode>( new NavigationRuntimeNode[] { CurrentNode } );
                        yield return GetBreadcrumbs(p, seed);
                    }
                }
                else
                {
                    yield return GetBreadcrumbs(CurrentNode);
                }
            }
        }

        /// <summary>
        /// Recursively build a breadcrumbs list by traversing from the leaf given up its parents.
        /// </summary>
        private IEnumerable<NavigationRuntimeNode> GetBreadcrumbs(NavigationRuntimeNode leaf, Stack<NavigationRuntimeNode> stack = null)
        {
            // build a stack from current node up
            if (stack == null)
                stack = new Stack<NavigationRuntimeNode>();

            if (leaf != null)
            {
                stack.Push(leaf);
                GetBreadcrumbs(leaf.Parent, stack);
            }

            return stack;
        }

        /// <summary>
        /// Allows a controller to set the current node.
        /// </summary>
        public void SetContext(Product product)
        {
            var productNode = _navigationTree.FindByProduct(product);

            if (productNode == null)
            {
                productNode = Mapper.Map<NavigationRuntimeNode>( Mapper.Map<NavigationNode>(product) );

                if (product.Categories != null && product.Categories.Count > 0)
                {
                    var parent = _navigationTree.FindByCategory(product.Categories.First());
                    if (parent != null)
                        productNode.Parent = parent;

                    parent.Items.Add(productNode);
                }
                else
                {
                    _navigationTree.Add(productNode);
                }
            }

            CurrentNode = productNode;
        }

        /// <summary>
        /// Allows a controller to set the current node.
        /// </summary>
        public void SetContext(Category category)
        {
            var categoryNode = _navigationTree.FindByCategory(category);

            if (categoryNode == null)
            {
                categoryNode = Mapper.Map<NavigationRuntimeNode>( Mapper.Map<NavigationNode>(category) );
                _navigationTree.Add(categoryNode);
            }

            CurrentNode = categoryNode;
        }

        public void SetContext(Document doc)
        {
            var docNode = _navigationTree.FindByDocument(doc);

            if (docNode == null)
            {
                docNode = Mapper.Map<NavigationRuntimeNode>( Mapper.Map<NavigationNode>(doc) );
            }

            CurrentNode = docNode;
        }

        #region IEnumerable interface crap
        public IEnumerator<NavigationRuntimeNode> GetEnumerator()
        {
            return _navigationTree.GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return (IEnumerator)GetEnumerator();
        }
        #endregion
    }
}
