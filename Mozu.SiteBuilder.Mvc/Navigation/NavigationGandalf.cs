using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Models.Navigation;
using DC = Mozu.ProductAdmin.Contracts;
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

        /// <summary>
        /// Public constructor.
        /// </summary>
        public NavigationGandalf(INavigationRepository navRepo, ICategoryNavigationProvider catClient, ICmsServiceWrapper cmsService)
        {
            _navRepo = navRepo;
            _catClient = catClient;
            _cmsService = cmsService;
        }

        /// <summary>
        /// Build a flat list of NavigationNodes (which can have a ParentId to imply a hiearchy)
        /// This list can then be transformed to a List<NavigationRuntimeNode> or List<NavigationTreeNode>
        /// </summary>
        private Task<List<NavigationNode>> GetListInternal(bool draft = true)
        {
            var masterList = new List<NavigationNode>();

            masterList.Add(new NavigationNode {
                Name = "Navigation",
                NodeType = NavigationNodeType.Group,
                Id = NAV_ROOT_NODE_NAME,
                ParentId = SUPER_ROOT_NODE_NAME,
                Index = 0
            });

            masterList.Add(new NavigationNode {
                Name = "Single Pages",
                NodeType = NavigationNodeType.Group,
                Id = UNLINKED_PAGES_NODE_ID,
                ParentId = SUPER_ROOT_NODE_NAME,
                Index = 1
            });

            // get the list of categories
            var catTask = _catClient.GetCategories();

            // get the list of pages
            var pageTask = _cmsService.GetList(new CmsListRequest() { Collection = "pages", PageSize = 100, DocumentStatus = (draft ? "draft" : "active") });

            // get the list of blogs
            var blogTask = _cmsService.GetList(new CmsListRequest() { Collection = "blogs", PageSize = 1, DocumentType = "blog" });

            // get our navigation data authority
            var navTask = _navRepo.GetSetAsync();

            return Task.WhenAll(catTask, pageTask, blogTask, navTask)
                .ContinueWith(_ =>
                {
                    List<NavigationNode> cats = catTask.Result;
                    DCC.PagedCollection<DCC.Document> pages = pageTask.Result.ReadAsSync();
                    DCC.PagedCollection<DCC.Document> blogs = blogTask.Result.ReadAsSync();
                    NavigationSet navSet = navTask.Result;

                    // build the masterlist. Step 1: put the top level categories in.
                    var sortedCats = cats.OrderBy(node => node.ParentId).ThenBy(node => node.Index).ToList();

                    // categories with a null ParentCategoryId should belong to the top level.
                    sortedCats.ForEach(n => n.ParentId = n.ParentId ?? NAV_ROOT_NODE_NAME);

                    masterList.AddRange(sortedCats);

                    // build the masterlist. Step 2: put in navigation items we know about.
                    foreach (var navmeta in (navSet.Nodes ?? new List<NavigationNode>()))
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
                        var nodesToChange = masterList.Where(n => n.ParentId == node.ParentId && n.Index.HasValue && n.Index == node.Index);
                        while (nodesToChange.Count() > 0)
                        {
                            int newIndex = nodesToChange.First().Index.Value + 1;
                            var newNodesToChange = masterList.Where(n => n.ParentId == node.ParentId && n.Index.HasValue && n.Index == newIndex).ToList();
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

                    return masterList.OrderBy(n => n.ParentId).ThenBy(n => n.Index).ToList();
                });
        }

        /// <summary>
        /// Build a flat list of NavigationNodes (which can have a ParentId to imply a hiearchy)
        /// This list can then be transformed to a List<NavigationRuntimeNode> or List<NavigationTreeNode>
        /// </summary>
        public Task<List<NavigationTreeNode>> GetFlatList(bool draft = true)
        {
            return GetListInternal(draft)
                .ContinueWith(res =>
                {
                    var nodelist = res.Result;

                    var nodeTree = Mapper.Map<List<NavigationTreeNode>>(nodelist);

                    var root = nodeTree.First(n => n.Id == NAV_ROOT_NODE_NAME);
                    var unlinked = nodeTree.First(n => n.Id == UNLINKED_PAGES_NODE_ID);
                    root.Expandable = unlinked.Expandable = false;
                    root.Expanded = unlinked.Expanded = true;

                    return nodeTree;
                });
        }

        /// <summary>
        /// Build a hierarchical list of navigation nodes, ideal for consumption by NDjango templates and front-end javascript.
        /// </summary>
        public Task<List<NavigationRuntimeNode>> GetTreeNavigation(bool draft = false)
        {
            return GetListInternal(draft)
                .ContinueWith(res =>
                {
                    var flatlist = res.Result;

                    var grouped =
                        from node in flatlist
                        where node.Id != UNLINKED_PAGES_NODE_ID
                        where node.ParentId != UNLINKED_PAGES_NODE_ID
                        group node by node.ParentId into g
                        select g;

                    var rootLevel = grouped.FirstOrDefault(g => g.Key == NAV_ROOT_NODE_NAME);
                    if (rootLevel == null)
                        return null;

                    var rootLevelMapped = Mapper.Map<List<NavigationRuntimeNode>>(rootLevel.ToList());
                    BuildTree(rootLevelMapped, grouped);

                    if (rootLevelMapped != null)
                    {
                        var homePage = rootLevelMapped.FirstOrDefault(node => !node.NodeType.IsLink && !String.IsNullOrEmpty(node.Url));
                        if (homePage != null)
                            homePage.IsHomePage = true;
                    }
                    return rootLevelMapped;
                });
        }

        /// <summary>
        /// Recursively build the navigation tree top-down.
        /// </summary>
        private void BuildTree(List<NavigationRuntimeNode> rootLevel, IEnumerable<IGrouping<string, NavigationNode>> allObjects)
        {
            if (rootLevel == null || rootLevel.Count == 0)
                return;

            foreach (var node in rootLevel)
            {
                var childItems = allObjects.FirstOrDefault(g => g.Key == node.Id);
                if (childItems != null)
                {
                    node.Items = Mapper.Map<List<NavigationRuntimeNode>>(childItems.ToList());
                    node.Items.ForEach(n => n.Parent = node);
                    BuildTree(node.Items, allObjects);
                }
            }
        }
    }
}
