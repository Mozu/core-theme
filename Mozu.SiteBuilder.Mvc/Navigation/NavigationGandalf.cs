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
        public const string ROOT_NODE_NAME = "root";

        // the special node to assign unlinked pages as a child of.
        public const string UNLINKED_PAGES_NODE_ID = "_unlinked";

        public const string NODE_TYPE_CATEGORY = "category";
        public const string NODE_TYPE_PAGE = "page";
        public const string NODE_TYPE_LINK = "link";

        private INavigationRepository _navRepo;
        private ICategoryWebApiClient _catClient;
        private ICmsServiceWrapper _cmsService;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public NavigationGandalf(INavigationRepository navRepo, ICategoryWebApiClient catClient, ICmsServiceWrapper cmsService)
        {
            _navRepo = navRepo;
            _catClient = catClient;
            _cmsService = cmsService;
        }

        /// <summary>
        /// Build a flat list of NavigationTreeNodes (which can have a ParentId to imply a hiearchy)
        /// ideal for consumption by ExtJS.
        /// </summary>
        public Task<List<NavigationTreeNode>> GetFlatList(bool draft = true)
        {
            var masterList = new List<NavigationTreeNode>();

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
                    DC.CategoryPagedCollection cats = catTask.Result.ReadAsSync();
                    DCC.PagedCollection<DCC.Document> pages = pageTask.Result.ReadAsSync();
                    DCC.PagedCollection<DCC.Document> blogs = blogTask.Result.ReadAsSync();
                    NavigationSet navSet = navTask.Result;

                    // build the masterlist. Step 1: put the top level categories in.
                    var sortedCats =
                        from c in cats.Items
                        let node = c.Map<NavigationTreeNode>()
                        let __ = node.ParentId = c.ParentCategoryId.HasValue ? "category^^" + c.ParentCategoryId : ROOT_NODE_NAME
                        orderby node.ParentId, node.Index
                        select node;
                    // sortedCats.Each(c => c.ParentId = ROOT_NODE_NAME);

                    masterList.AddRange(sortedCats);

                    // build the masterlist. Step 2: put in navigation items we know about.
                    foreach (var navmeta in navSet.Nodes)
                    {
                        NavigationTreeNode node;
                        switch (navmeta.NodeType)
                        {
                            case "page":
                                string pageId = navmeta.OriginalId;
                                var page = (pages != null && pages.Items != null) ? pages.Items.FirstOrDefault(p => p.Id == pageId) : null;

                                if (page != null)
                                {
                                    node = Mapper.Map<NavigationTreeNode>(page);
                                    node.Index = navmeta.Index;
                                    node.ParentId = navmeta.ParentId;
                                }
                                else
                                {
                                    // ignore pages in the navigation document that don't exist in the cms.
                                    continue;
                                }
                                break;
                            case NODE_TYPE_LINK:
                                node = new NavigationTreeNode
                                {
                                    Name = navmeta.Name,
                                    Url = navmeta.Url,
                                    Index = navmeta.Index,
                                    ParentId = navmeta.ParentId,
                                    NodeType = NODE_TYPE_LINK,
                                };
                                break;
                            default:
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
                        where !masterList.Any(mln => mln.IdParts.Length == 3 && mln.IdParts[2] == p.Id)
                        // filter out these fucking autogenerated pages with a guid for a name.
                        where !Regex.IsMatch(p.Name, "^[0-9a-f]{8}-")
                        select Mapper.Map<NavigationTreeNode>(p)
                    ).ToList();

                    masterList.Add(new NavigationTreeNode()
                    {
                        Name = "Non-Linked Pages",
                        NodeType = "group",
                        Expanded = true,
                        Expandable = false,
                        Class = "taco-nav",
                        AllowDrag = false,
                        Id = UNLINKED_PAGES_NODE_ID,
                        ParentId = ROOT_NODE_NAME,
                        Index = masterList.Count
                    });

                    allUnassigned.Each(n => n.ParentId = UNLINKED_PAGES_NODE_ID);
                    masterList.AddRange(allUnassigned);

                    return masterList.OrderBy(n => n.ParentId).ThenBy(n => n.Index).ToList();
                });
        }

        /// <summary>
        /// Build a hierarchical list of navigation nodes, ideal for consumption by NDjango templates and front-end javascript.
        /// </summary>t
        public Task<List<NavigationRuntimeNode>> GetTreeNavigation(bool draft = false)
        {
            return GetFlatList(draft)
                .ContinueWith(res =>
                {
                    var flatlist = res.Result;

                    var grouped =
                        from node in flatlist
                        where node.Id != UNLINKED_PAGES_NODE_ID
                        where node.ParentId != UNLINKED_PAGES_NODE_ID
                        group node by node.ParentId into g
                        select g;

                    var rootLevel = Mapper.Map<List<NavigationRuntimeNode>>(grouped.First(g => g.Key == ROOT_NODE_NAME).ToList());
                    BuildTree(rootLevel, grouped);

                    return rootLevel;
                });
        }

        /// <summary>
        /// Recursively build the navigation tree top-down.
        /// </summary>
        private void BuildTree(List<NavigationRuntimeNode> rootLevel, IEnumerable<IGrouping<string, NavigationTreeNode>> allObjects)
        {
            if (rootLevel == null || rootLevel.Count == 0)
                return;

            foreach (var node in rootLevel)
            {
                var childItems = allObjects.FirstOrDefault(g => g.Key == node.Id);
                if (childItems != null)
                {
                    node.Items = Mapper.Map<List<NavigationRuntimeNode>>(childItems.ToList());
                    BuildTree(node.Items, allObjects);
                }
            }
        }
    }
}
