using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.UX.Models.Navigation;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;

namespace Mozu.SiteBuilder.Mvc.Contexts
{


    public class NavigationContext 
    {
        private readonly NavigationGandalf _navigationGandalf;
        private readonly ISiteBuilderApiContext _apiContext;

        public NavigationContext(NavigationGandalf navigationGandalf, ICategoryNavigationProvider categoryNavigationProvider, ISiteBuilderApiContext apiContext)
        {
            _navigationGandalf = navigationGandalf;
            _apiContext = apiContext;
            
        }

        private List<NavigationRuntimeNode> __navigationTree;

        public List<NavigationRuntimeNode> Tree
        {
            get
            {
                var task = Init();
                if (!task.IsCompleted)
                {
                    task.Wait();
                }

                return __navigationTree;
            }
        }

        private Task _initTask;
        public Task Init()
        {
            if (_initTask == null)
            {
                if (_apiContext.SiteId == null)
                {
                    throw new NotSupportedException("Navigation requires a context with a siteid");
                }
                _initTask = _navigationGandalf.GetTreeNavigation().ContinueWith(_ =>
                    {
                        __navigationTree = _.Result;
                    });
                
            }
            return _initTask; 
        }


        public Task<List<NavigationNode>> GetCategories()
        {
            return _navigationGandalf.GetCategories();
        }

        public List<NavigationNode> RootCategories
        {
            get { return GetCategories().Result; }
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
            get
            {
                Init();
                return GetBreadcrumbs(CurrentNode);
            }
        }

        /// <summary>
        /// In the case of a product belonging to multiple categories, there are multiple breadcrumbs possible.
        /// This enumerates all of those breadcrumbs lists.
        /// </summary>
        public IEnumerable<IEnumerable<NavigationRuntimeNode>> Breadcrumbses
        {
            get
            {
                Init();
                if (CurrentNode.NodeType == "product")
                {
                    // only product has multiple parents
                    var parents = new List<NavigationRuntimeNode> { new NavigationRuntimeNode(), new NavigationRuntimeNode() };

                    foreach (var p in parents)
                    {
                        var seed = new Stack<NavigationRuntimeNode>(new NavigationRuntimeNode[] { CurrentNode });
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
            var productNode = Tree.FindByProduct(product);

            if (productNode == null)
            {
                productNode = Mapper.Map<NavigationRuntimeNode>(Mapper.Map<NavigationNode>(product));

                if (product.Categories != null && product.Categories.Count > 0)
                {
                    var parent = Tree.FindByCategory(product.Categories.First());
                    if (parent != null)
                    {
                        productNode.Parent = parent;
                        parent.Items.Add(productNode);
                    }
                }
                else
                {
                    Tree.Add(productNode);
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
                categoryNode = Mapper.Map<NavigationRuntimeNode>(Mapper.Map<NavigationNode>(category));
                Tree.Add(categoryNode);
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
                docNode = Mapper.Map<NavigationRuntimeNode>(Mapper.Map<NavigationNode>(doc));
            }

            CurrentNode = docNode;
        }

      
    }
}
