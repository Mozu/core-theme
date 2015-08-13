using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.Content.Contracts;
using Mozu.SiteBuilder.Mvc.Filters;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.UX.Models.Navigation;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;

namespace Mozu.SiteBuilder.Mvc.Contexts
{


    public class NavigationContext : ITagFilterFindable
    {
        private readonly INavigationGandalf _navigationGandalf;
        private readonly ISiteBuilderApiContext _apiContext;

        public NavigationContext(INavigationGandalf gandalf, ISiteBuilderApiContext apiContext)
        {
            _navigationGandalf = gandalf;
            _apiContext = apiContext;
        }

       // private List<NavigationRuntimeNode> __navigationTree;

        public List<IRuntimeNavigationNode> Tree
        {
            get
            {
                var tree = ASyncGetTree().Result;
                return tree;
            }
        }


        object ITagFilterFindable.Filter(IEnumerable<object> parameter)
        {
            var count = parameter == null ? 0 : parameter.Count();
            if (count == 0)
            {
                return null;
            }
            if (count == 1)
            {
                var key = parameter.FirstOrDefault();
                if (key == null)
                {
                    return null;
                }
                return this.Tree.FindNode(null, key.ToString());
            }
            else
            {
                return parameter.Where(x => x != null).Select(key => this.Tree.FindNode(null, key.ToString())).ToList();
            }
        }


        private Task<List<IRuntimeNavigationNode>> _initTask;
        public Task<List<IRuntimeNavigationNode>> ASyncGetTree()
        {
            if (_initTask == null)
            {
                _initTask = _navigationGandalf.GetTreeNavigation().ContinueWith(_ => {
                    return _.Result ?? new List<IRuntimeNavigationNode>();
                });
            }
            return _initTask; 
        }


        private List<IRuntimeNavigationNode> _rootCategoryList;

        public List<IRuntimeNavigationNode> RootCategories
        {
            get
            {
                if (_rootCategoryList == null)
                {
                    _rootCategoryList = Tree.OrderBy(x => x.Name).Where( x=> x.NodeType ==NavigationNodeType.Category ).ToList();
                }
                return _rootCategoryList;
            }
        }


        /// <summary>
        /// Contains the current node in the navigation tree.
        /// </summary>
        public IRuntimeNavigationNode CurrentNode { get; private set; }

        List<object> _breadCrumbs;

        /// <summary>
        /// Returns a collection of NavigationRuntimeNodes representing the path from the site root to the current node.
        /// </summary>
        public List<object> Breadcrumbs
        {
            get { return _breadCrumbs ?? (_breadCrumbs = GetBreadcrumbs(CurrentNode).Cast<object>().ToList()); }
            set { _breadCrumbs = value; }
        }

        /// <summary>
        /// In the case of a product belonging to multiple categories, there are multiple breadcrumbs possible.
        /// This enumerates all of those breadcrumbs lists.
        /// </summary>
        //public IEnumerable<IEnumerable<IRuntimeNavigationNode>> Breadcrumbses
        //{
        //    get
        //    {
        //
        //        if (CurrentNode == null)
        //        {
        //            yield break; 
        //        }
        //        if (CurrentNode.NodeType == "product")
        //        {
        //            // only product has multiple parents
        //            var parents = new List<IRuntimeNavigationNode> { new NavigationRuntimeNode(), new NavigationRuntimeNode() };
        //
        //            foreach (var p in parents)
        //            {
        //                var seed = new Stack<IRuntimeNavigationNode>();
        //                seed.Push(CurrentNode);
        //                yield return GetBreadcrumbs(p, seed);
        //            }
        //        }
        //        else
        //        {
        //            yield return GetBreadcrumbs(CurrentNode);
        //        }
        //    }
        //}

        /// <summary>
        /// Recursively build a breadcrumbs list by traversing from the leaf given up its parents.
        /// </summary>
        private static IEnumerable<IRuntimeNavigationNode> GetBreadcrumbs(IRuntimeNavigationNode leaf, Stack<IRuntimeNavigationNode> stack = null)
        {
            // build a stack from current node up
            if (stack == null)
                stack = new Stack<IRuntimeNavigationNode>();

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
            var productNode = Tree.FindByProduct(product);

            if (productNode == null)
            {
                productNode = Mapper.Map<SimpleRuntimeNavigationNode>(product);
              


                if (product.Categories != null && product.Categories.Count > 0)
                {
                    var parent = Tree.FindByCategory(product.Categories.First());
                    if (parent != null)
                    {
                        productNode.Parent = parent;
                        //parent.Items.Add(productNode);
                    }
                }
                else
                {
                    //Tree.Add(productNode);
                }
            }

            CurrentNode = productNode;
        }

        /// <summary>
        /// Allows a controller to set the current node.
        /// </summary>
        public void SetContext(Category category)
        {
            var categoryNode = Tree.FindByCategory(category);

            if (categoryNode == null)
            {
                categoryNode = Mapper.Map<SimpleRuntimeNavigationNode>(category);
                //Tree.Add(categoryNode);
            }

            CurrentNode = categoryNode;
        }

        /// <summary>
        /// Allows a controller to set the current node.
        /// </summary>
        public void SetContext(Document doc)
        {
            var docNode = Tree.FindByDocument(doc);

            if (docNode == null)
            {
                docNode = Mapper.Map<SimpleRuntimeNavigationNode>(doc);
            }

            CurrentNode = docNode;
        }



       
    }
}
