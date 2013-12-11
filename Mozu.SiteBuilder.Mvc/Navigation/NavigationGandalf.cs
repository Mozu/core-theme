using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using AutoMapper;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Models.Navigation;
using DCC = Mozu.Content.Contracts;

namespace Mozu.SiteBuilder.Mvc.Navigation
{
    /// <summary>
    /// The white wizard of navigation merges and formats the navigation list
    /// for his fellow traveler, NavigationController
    /// </summary>
    public class NavigationGandalf
    {
        // the top level name in EXT's tree thing (a root pseudo-node).
        public const string SUPER_ROOT_NODE_NAME = "root";

        // the top level name for items that exist in the navigation tree.
        public const string NAV_ROOT_NODE_NAME = "_navigation";

        // the special node to assign unlinked pages as a child of.
        public const string UNLINKED_PAGES_NODE_ID = "_unlinked";


        private INavigationRepository _navRepo;
        private ICategoryNavigationProvider _catClient;
        private ICmsServiceWrapper _cmsService;
        private Task<NavigationNodeCollection> _getCategoriesTask;
        private System.Web.Caching.Cache _navCache;
        private MD5 _md5;

        private ILogger _logger;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public NavigationGandalf(INavigationRepository navRepo, ICategoryNavigationProvider catClient, ICmsServiceWrapper cmsService, HttpContextBase httpContext, ILogger logger)
        {
            _navRepo = navRepo;
            _catClient = catClient;
            _cmsService = cmsService;
            _logger = logger;
            _navCache = httpContext.Cache;
            _md5 = MD5.Create();
        }

        public Task<NavigationNodeCollection> GetCategories()
        {
            if (_getCategoriesTask == null)
            {
                _getCategoriesTask = _catClient.GetCategories();
            }
            return _getCategoriesTask;
        }

        /// <summary>
        /// Build a flat list of NavigationNodes (which can have a ParentId to imply a hiearchy)
        /// This list can then be transformed to a List<NavigationRuntimeNode> or List<NavigationTreeNode>
        /// </summary>
        private Task<NavigationNodeCollection> GetListInternal()
        {
            var masterList = new List<NavigationNode>();

            masterList.Add(new NavigationNode {
                Name = "Navigation",
                NodeType = NavigationNodeType.Group,
                Id = NAV_ROOT_NODE_NAME,
                ParentId = SUPER_ROOT_NODE_NAME,
                Expandable = true,
                Index = 0
            });

            masterList.Add(new NavigationNode {
                Name = "Single Pages",
                NodeType = NavigationNodeType.Group,
                Id = UNLINKED_PAGES_NODE_ID,
                ParentId = SUPER_ROOT_NODE_NAME,
                Expandable = true,
                Index = 1
            });

            // get the list of categories
            var catTask = GetCategories();

            // get the list of pages
            var pageTask = _cmsService.GetList2(contentCollection: "pages", pageSize: 100);

            // get the list of blogs
            // var blogTask = _cmsService.GetList2(contentCollection: "blogs", pageSize: 1, filter: "DocumentType eq blog" );

            // get our navigation data authority
            var navTask = _navRepo.GetSetAsync();

            return Task.WhenAll(catTask, pageTask, /*blogTask,*/ navTask)
                .ContinueWith(_ =>
                {
                    NavigationNodeCollection cats = catTask.Result;
                    ServiceClientResponse<DCC.DocumentCollection> pagesRes = pageTask.Result;
                    //ServiceClientResponse<DCC.DocumentCollection> blogsRes = blogTask.Result;
                    NavigationSet navSet = navTask.Result;

                    string etag = CompositeETag(categoriesEtag: cats.ETag, pagesEtag: pagesRes.ETag(), navsetEtag: navSet.ETag);
                    List<NavigationNode> cachedResult = GetCachedNavigationList(etag);
                    Debug.WriteLine("Building list");
                    if (cachedResult != null)
                    {
                        return new NavigationNodeCollection {
                            ETag = etag,
                            Nodes = cachedResult
                        };
                    }

                    DCC.DocumentCollection pages = pagesRes.ReadAsSync();
                    //DCC.DocumentCollection blogs = blogsRes.ReadAsSync();
                    //pageTask.Result.ResponseMessage.Headers.ETag

                    // build the masterlist. Step 1: put the top level categories in.
                    var sortedCats = cats.Nodes.OrderBy(node => node.ParentId).ThenBy(node => node.Index).ToList();

                    // categories with a null ParentCategoryId should belong to the top level.
                    sortedCats.ForEach(n => n.ParentId = n.ParentId ?? NAV_ROOT_NODE_NAME);

                    masterList.AddRange(sortedCats);

                    // build the masterlist. Step 2: put in navigation items we know about.
                    foreach (var navmeta in (navSet.Nodes ?? new List<NavigationNode>()).OrderBy(n => n.ParentId).ThenBy(n => n.Index))
                    {
                        NavigationNode node;

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
                                node = Mapper.Map<NavigationNode>(page);
                                node.Index = navmeta.Index;
                                node.ParentId = navmeta.ParentId;
                            }
                            else
                            {
                                // ignore pages in the navigation document that don't exist in the cms.
                                continue;
                            }
                        }
                        else if (navmeta.NodeType.IsLink)
                        {
                            node = new NavigationNode
                            {
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
                        var nodesToChange = masterList.Where(n => n.ParentId == node.ParentId && n.Index == node.Index);
                        while (nodesToChange.Count() > 0)
                        {
                            int newIndex = nodesToChange.First().Index + 1;
                            var newNodesToChange = masterList.Where(n => n.ParentId == node.ParentId && n.Index == newIndex).ToList();
                            nodesToChange.Each(n => n.Index = newIndex);
                            nodesToChange = newNodesToChange;
                        }

                        masterList.Add(node);
                    }

                    // build the masterlist. Step 3: put in all the trash we don't know about.
                    var allUnassigned = (
                        from p in ((pages != null && pages.Items != null) ? pages.Items : new List<DCC.Document>())
                        // find pages not already included in another list
                        where !masterList.Any(mln => mln.OriginalId == p.Id)
                        // filter out these fucking autogenerated pages with a guid for a name.
                        where !Regex.IsMatch(p.Name, "^[0-9a-f]{8}-")
                        select Mapper.Map<NavigationNode>(p)
                    ).ToList();

                    allUnassigned.Each(n => n.ParentId = UNLINKED_PAGES_NODE_ID);
                    masterList.AddRange(allUnassigned);

                    var nodes = masterList.OrderBy(n => n.ParentId).ThenBy(n => n.Index).ToList();
                    if (etag != null)
                        SaveCachedNavigationList(etag, nodes);
                    return new NavigationNodeCollection {
                        ETag = etag,
                        Nodes = nodes
                    };
                });
        }

        /// <summary>
        /// Build a flat list of NavigationNodes (which can have a ParentId to imply a hiearchy)
        /// This list can then be transformed to a List<NavigationRuntimeNode> or List<NavigationTreeNode>
        /// </summary>
        public Task<List<NavigationTreeNode>> GetFlatList()
        {
            return GetListInternal()
                .ContinueWith(res =>
                {
                    var nodelist = res.Result;

                    var nodeTree = Mapper.Map<List<NavigationTreeNode>>(nodelist);

                    var root = nodeTree.First(n => n.Id == NAV_ROOT_NODE_NAME);
                    var unlinked = nodeTree.First(n => n.Id == UNLINKED_PAGES_NODE_ID);
                  
                    root.Expanded = unlinked.Expanded = true;

                    return nodeTree;
                });
        }

        /// <summary>
        /// Build a hierarchical list of navigation nodes, ideal for consumption by NDjango templates and front-end javascript.
        /// </summary>
        public Task<List<NavigationRuntimeNode>> GetTreeNavigation()
        {
            return GetListInternal()
                .ContinueWith(res =>
                {
                    var nodeCollection = res.Result;

                    var cachedTree = GetCachedTree(nodeCollection.ETag);
                    if (cachedTree != null)
                        return cachedTree;

                    var grouped =
                        from node in nodeCollection.Nodes
                        where node.Id != UNLINKED_PAGES_NODE_ID
                        where node.ParentId != UNLINKED_PAGES_NODE_ID
                        group node by node.ParentId into g
                        select g;

                    var rootLevel = grouped.FirstOrDefault(g => g.Key == NAV_ROOT_NODE_NAME);
                    if (rootLevel == null)
                        return null;
                    var rootLevelMapped = Mapper.Map<List<NavigationRuntimeNode>>(rootLevel.ToList());
                    int entries = 0, counter = 0;

                    Stopwatch stopwatch = Stopwatch.StartNew();
                    BuildTree(rootLevelMapped, grouped, ref entries, ref counter);
                    stopwatch.Stop();
                    _logger.Debug(String.Format("Navigation: Built tree. {0} entries. {1} loops. {1} ms elapsed.", entries, counter, stopwatch.ElapsedMilliseconds));

                    if (rootLevelMapped != null)
                    {
                        var homePage = rootLevelMapped.FirstOrDefault(node => !node.NodeType.IsLink && !String.IsNullOrEmpty(node.Url));
                        if (homePage != null)
                            homePage.IsHomePage = true;

                        if (nodeCollection.ETag != null)
                            SaveCachedTree(nodeCollection.ETag, rootLevelMapped);
                    }
                    return rootLevelMapped;
                });
        }

        /// <summary>
        /// Recursively build the navigation tree top-down.
        /// </summary>
        private void BuildTree(List<NavigationRuntimeNode> rootLevel, IEnumerable<IGrouping<string, NavigationNode>> allObjects, ref int entries, ref int counter)
        {
            if (rootLevel == null || rootLevel.Count == 0)
                return;

            entries++;
            foreach (var node in rootLevel)
            {
                counter++;

                var childItems = allObjects.FirstOrDefault(g => g.Key == node.Id);
                if (childItems != null)
                {
                    node.Items = childItems.Select(child => new NavigationRuntimeNode
                    {
                        Id = child.Id,
                        Parent = node,
                        Url = child.Url,
                        Name = child.Name,
                        Index = child.Index,
                        NodeType = child.NodeType,
                        IsHomePage = false
                    }).ToList();
                    BuildTree(node.Items, allObjects, ref entries, ref counter);
                }
            }
        }

        private string CompositeETag(string categoriesEtag, string pagesEtag, string navsetEtag)
        {
            // if any service didn't give us an etag, we can't depend on this cache.
            if (String.IsNullOrEmpty(categoriesEtag) || String.IsNullOrEmpty(pagesEtag) || String.IsNullOrEmpty(navsetEtag))
                return null;

            // smoosh all the etags together in one glorious byte array and then MD5 that byte array.
            byte[] allTheBytes = ASCIIEncoding.ASCII.GetBytes(categoriesEtag + pagesEtag + navsetEtag);
            string cacheKey = BitConverter.ToString(_md5.ComputeHash(allTheBytes));
            return cacheKey;
        }

        /// <summary>
        /// Retrieve a built navigation tree from local cache. Uses the ETags from all the services 
        /// that contribute data to ensure that the tree is fresh.
        /// </summary>
        private List<NavigationNode> GetCachedNavigationList(string cacheKey)
        {
            return cacheKey != null ? _navCache[cacheKey] as List<NavigationNode> : null;
        }

        /// <summary>
        /// Retrieve a built navigation tree from local cache. Uses the ETags from all the services 
        /// that contribute data to ensure that the tree is fresh.
        /// </summary>
        private void SaveCachedNavigationList(string etag, List<NavigationNode> nodes)
        {
            if (String.IsNullOrEmpty(etag))
                throw new ArgumentException("Cannot cache navigation set without an etag.");

            _navCache[etag] = nodes;
        }

        private List<NavigationRuntimeNode> GetCachedTree(string etag)
        {
            string cacheKey = etag != null ? String.Format("{0}.tree", etag) : null;
            return cacheKey != null ? _navCache[cacheKey] as List<NavigationRuntimeNode> : null;
        }

        private void SaveCachedTree(string etag, List<NavigationRuntimeNode> tree)
        {
            if (String.IsNullOrEmpty(etag))
                throw new ArgumentException("Cannot cache navigation set without an etag.");
            string cacheKey = String.Format("{0}.tree", etag);
            _navCache[cacheKey] = tree;
        }
    }
}
