using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Mozu.Content.Contracts.Clients;
using Mozu.Core.Api.Client;
using Mozu.Core.Logging;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.UX.Models.Navigation;
using Mozu.SiteBuilder.Mvc.Extensions;

namespace Mozu.SiteBuilder.Mvc.Navigation
{
    /// <summary>
    /// After his defeat by the Balrog of Performance Testing, Gandalf the Grey has
    /// returned to the magical world of Mozu Sitebuilder as Gandalf The White.
    /// </summary>
    public sealed class NavigationGandalfTheWhite : INavigationGandalf
    {
        private IProductCategoryRuntimeWebApiClient _productCategoryRuntimeWebApiClient;
        private IDocumentListWebApiClient _documentClient;
        private INavigationRepository _navRepo;
        private ILogger _logger;

        // the top level name in EXT's tree thing (a root pseudo-node).
        private const string SUPER_ROOT_NODE_NAME = "root";

        // the top level name for items that exist in the navigation tree.
        private const string NAV_ROOT_NODE_NAME = "_navigation";

        // the special node to assign unlinked pages as a child of.
        private const string UNLINKED_PAGES_NODE_ID = "_unlinked";


        /// <summary>
        /// Public constructor.
        /// </summary>
        public NavigationGandalfTheWhite(IProductCategoryRuntimeWebApiClient productCategoryRuntimeWebApiClient, IDocumentListWebApiClient documentClient, INavigationRepository navRepo, ILogger logger)
        {
            _productCategoryRuntimeWebApiClient = productCategoryRuntimeWebApiClient.CloneWithoutUserClaims();
            _documentClient = documentClient.CloneWithoutUserClaims();
            _navRepo = navRepo;
            _logger = logger;
        }

        /// <summary>
        /// Gets all navigation nodes in a flat list.
        /// Flat list is used by Admin.
        /// </summary>
        public Task<List<ITreeNavigationNode>> GetFlatList()
        {
            return GetListInternal().ContinueWith(t =>
            {
                return t.Result.OrderBy(n => n.ParentId).ThenBy(n => n.Index).ToList<ITreeNavigationNode>();
                // TODO: replace this .Cast() call
//                return t.Result.Cast<ITreeNavigationNode>().ToList();
            });
        }

        /// <summary>
        /// Get navigation as a tree. This is used by themes in storefront.
        /// </summary>
        /// <returns></returns>
        public Task<List<IRuntimeNavigationNode>> GetTreeNavigation()
        {
            return GetListInternal().ContinueWith(t =>
            {
                return BuildTree(t.Result).Cast<IRuntimeNavigationNode>().ToList();
            });
        }

        private Task<List<SuperNavigationNode>> GetListInternal()
        {
            // get the list of categories
            var catTask = _productCategoryRuntimeWebApiClient.GetCategoryTree();

            // get the list of pages
            var pageTask = _documentClient.GetDocuments(documentListName: "pages", pageSize: 250);

            // get the list of blogs
            // var blogTask = _cmsService.GetList2(contentCollection: "blogs", pageSize: 1, filter: "DocumentType eq blog" );

            // get our navigation data authority
            var navTask = _navRepo.GetNavigationSetAsync();

            return Task.WhenAll(catTask, pageTask, navTask).ContinueWith(t =>
            {
                var pages = pageTask.Result.ReadAsSync();
                var categories = catTask.Result.ReadAsSync();
                var navset = navTask.Result;

                int numpages = pages != null && pages.Items != null ? pages.Items.Count : 0;
                int numcats = categories != null && categories.Items != null ? categories.Items.Count : 0;
                int numNavset = navset != null ? navset.Count : 0;
                var masterList = new List<SuperNavigationNode>(numpages + numcats + numNavset + 2);

                masterList.Add(new SuperNavigationNode
                {
                    Name = "Navigation",
                    NodeType = NavigationNodeType.Group,
                    Id = NAV_ROOT_NODE_NAME,
                    ParentId = SUPER_ROOT_NODE_NAME,
                    IsSystemNode = true,
                    AllowDrop = true,
                    Index = 0
                });

                masterList.Add(new SuperNavigationNode
                {
                    Name = "Single Pages",
                    NodeType = NavigationNodeType.Group,
                    Id = UNLINKED_PAGES_NODE_ID,
                    ParentId = SUPER_ROOT_NODE_NAME,
                    IsSystemNode = true,
                    AllowDrop = true,
                    Index = 1
                });

                // build the masterlist. Step 1: put the top level categories in.
                var allCats = GetAllCategoriesFromTree(categories.Items);
                EnsureAllNodesHaveUniqueIndex(allCats);

                masterList.AddRange(allCats);

                // build the masterlist. Step 2: put in navigation items we know about.
                foreach (var navmeta in (navset ?? Enumerable.Empty<INavigationNode>()))
                {
                    SuperNavigationNode node;

                    if (navmeta.NodeType == null)
                    {
                        continue;
                    }
                    else if (navmeta.NodeType.IsPage)
                    {
                        string pageId = navmeta.OriginalId;
                        var page = (pages != null && pages.Items != null) ? pages.Items.FirstOrDefault(p => p.Id == pageId) : null;

                        if (page != null)
                        {
                            node = new SuperNavigationNode {
                                Name = (string)page.Get("link_title") ?? page.Name,
                                NodeType = NavigationNodeType.Page,
                                Id = "page^^" + page.DocumentListName + "^^" + page.Id,
                                ParentId = navmeta.ParentId,
                                OriginalId = page.Id,
                                OriginalCollection = page.DocumentListName,
                                Index = navmeta.Index,
                                Url = String.Equals(page.DocumentListName, "pages", StringComparison.OrdinalIgnoreCase) ? "/" + page.Name : "/" + page.DocumentListName + "/" + page.Name
                            };
                        }
                        else
                        {
                            // ignore pages in the navigation document that don't exist in the cms.
                            continue;
                        }
                    }
                    else if (navmeta.NodeType.IsLink)
                    {
                        node = new SuperNavigationNode {
                            Id = navmeta.Id,
                            OriginalId = navmeta.OriginalId,
                            Name = navmeta.Name,
                            Url = navmeta.Url,
                            Index = navmeta.Index,
                            ParentId = navmeta.ParentId,
                            NodeType = NavigationNodeType.Link
                        };
                    }
                    else
                    {
                        continue;
                    }

                    // if we want to insert a node with an index that's already taken, we need to move the others
                    var nodesToChange = masterList.Where(n => n.ParentId == node.ParentId && n.Index == node.Index).ToList();
                    int newIndex = node.Index + 1;

                    while (nodesToChange.Count > 0)
                    {
                        // find all the nodes at index+1
                        var newNodesToChange = masterList.Where(n => n.ParentId == node.ParentId && n.Index == newIndex).ToList();

                        // update all the nodes at our index to index+1
                        nodesToChange.ForEach(n => n.Index = newIndex);

                        // loop, changing all the nodes at index+1 to index+2
                        nodesToChange = newNodesToChange;
                        newIndex++;
                    }

                    masterList.Add(node);
                }

                // build the masterlist. Step 3: put in all the trash we don't know about.
                var allUnassigned =
                    from p in (pages != null && pages.Items != null) ? pages.Items : Enumerable.Empty<Mozu.Content.Contracts.Document>()
                    // find pages not already included in another list
                    where !masterList.Any(node => node.OriginalId == p.Id)
                    // filter out these fucking autogenerated pages with a guid for a name.
                    where !Regex.IsMatch(p.Name, "^[0-9a-f]{8}-")
                    select new SuperNavigationNode {
                        Name = (string)p.Get("link_title") ?? p.Name,
                        NodeType = NavigationNodeType.Page,
                        Id = "page^^" + p.DocumentListName + "^^" + p.Id,
                        ParentId = UNLINKED_PAGES_NODE_ID,
                        OriginalId = p.Id,
                        OriginalCollection = p.DocumentListName,
                        Index = 0,
                        Url = String.Equals(p.DocumentListName, "pages", StringComparison.OrdinalIgnoreCase) ? "/" + p.Name : "/" + p.DocumentListName + "/" + p.Name,
                    };
                masterList.AddRange(allUnassigned);

                return masterList;
            });
        }

        /// <summary>
        /// Flattens the category tree returned by the service into a list of NavigationNodes.
        /// </summary>
        /// <param name="inputList"></param>
        /// <returns></returns>
        private List<SuperNavigationNode> GetAllCategoriesFromTree(List<ProductRuntime.Contracts.Category> inputList)
        {
            if (inputList == null)
                return null;

            List<SuperNavigationNode> returnList = new List<SuperNavigationNode>(inputList.Count * 2);
            foreach (var cat in inputList)
            {
                returnList.Add(
                    new SuperNavigationNode {
                        NodeType = NavigationNodeType.Category,
                        Id = "cat^^" + cat.CategoryId,
                        ParentId = cat.ParentCategory != null ? "cat^^" + cat.ParentCategory.CategoryId : NAV_ROOT_NODE_NAME,
                        OriginalId = cat.CategoryId.ToString(),
                        Url = cat.Content == null || String.IsNullOrEmpty(cat.Content.Slug) ? "/c/" + cat.CategoryId : "/" + cat.Content.Slug + "/c/" + cat.CategoryId,
                        Name = cat.Content.Name,
                        // category "Sequence" is 1-indexed, but our navigation list is 0-indexed.. so we -1.
                        Index = cat.Sequence.GetValueOrDefault(1) - 1,
                        IsHidden = !cat.IsDisplayed
                    });

                // recursively deal with children
                if (cat.ChildrenCategories != null)
                    returnList.AddRange( GetAllCategoriesFromTree(cat.ChildrenCategories) );
            }

            return returnList;
        }

        private class NavigationNodeIndexComparer : IComparer<IRuntimeNavigationNode>
        {
            public int Compare(IRuntimeNavigationNode node1, IRuntimeNavigationNode node2)
            {
                return node1.Index.CompareTo(node2.Index);
            }
        }
        private NavigationNodeIndexComparer _navigationNodeIndexComparer = new NavigationNodeIndexComparer();

        private List<SuperNavigationNode> BuildTree(List<SuperNavigationNode> flat)
        {
            SuperNavigationNode root = null;

            // step 1. index all items.
            Dictionary<string, SuperNavigationNode> lookupTable = new Dictionary<string, SuperNavigationNode>(flat.Count);
            foreach (var n in flat)
            {
                lookupTable[n.Id] = n;
            }

            // step 2. put each item under its owner.
            foreach (var n in flat)
            {
                if (n.Id == NAV_ROOT_NODE_NAME)
                    root = n;

                if (n.ParentId == null || n.ParentId == SUPER_ROOT_NODE_NAME)
                    continue;

                var parent = lookupTable[n.ParentId];

                if (n.ParentId != NAV_ROOT_NODE_NAME)
                    n.Parent = parent;

                if (parent.Items == null)
                    parent.Items = new SortedSet<IRuntimeNavigationNode>(_navigationNodeIndexComparer);

                parent.Items.Add(n);
            }

            var topLevelNav = root.Items != null ? root.Items.Cast<SuperNavigationNode>().ToList() : new List<SuperNavigationNode>(0);
            var homePage = topLevelNav.OrderBy(n => n.Index).FirstOrDefault(node => !node.NodeType.IsLink && !String.IsNullOrEmpty(node.Url));
            if (homePage != null)
                homePage.IsHomePage = true;
            return topLevelNav;
        }

        private void EnsureAllNodesHaveUniqueIndex(IEnumerable<SuperNavigationNode> inputList)
        {
            // this function is intended to operate on lists of SuperNavigationNodes with a common ParentId
            if (inputList.Select(snn => snn.ParentId).Distinct().Count() > 1) {
                foreach (IEnumerable<SuperNavigationNode> group in inputList.GroupBy(snn => snn.ParentId))
                {
                    EnsureAllNodesHaveUniqueIndex(group);
                }
                return;
            }

            int lowestIndex = -1;
            foreach (var node in inputList.OrderBy(snn => snn.Index))
            {
                if (node.Items != null && node.Items.Count > 0)
                {
                    EnsureAllNodesHaveUniqueIndex(node.Items.Cast<SuperNavigationNode>());
                }

                // ensure anything with a null or negative index has a minimum index value of 1.
                int nodeIndex = Math.Max(node.Index, 1);
                if (nodeIndex <= lowestIndex)
                {
                    nodeIndex = node.Index = lowestIndex + 1;
                }

                lowestIndex = nodeIndex;
            }
        }
    }
}
