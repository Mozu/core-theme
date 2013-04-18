using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Navigation;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class NavigationController : BaseController
    {
        private const bool USE_MOCK_DATA = false;

        // the top level name in EXT's tree thing (a root pseudo-node).
        public const string ROOT_NODE_NAME = "root";

        // the special node to assign unlinked pages as a child of.
        public const string UNLINKED_PAGES_NODE_ID = "_unlinked";

        public const string NODE_TYPE_CATEGORY = "category";
        public const string NODE_TYPE_PAGE = "page";
        public const string NODE_TYPE_LINK = "link";

        private INavigationRepositoryAsync _navRepo;
        private ICategoryWebApiClient _catClient;
        private ICmsServiceWrapper _cmsService;
        private NavigationGandalf _gandalf;

        /// <summary>
        ///  Public constructor.
        /// </summary>
        public NavigationController(INavigationRepositoryAsync navRepo, ICategoryWebApiClient catClient, ICmsServiceWrapper cmsService, NavigationGandalf gandalf)
        {
            _navRepo = navRepo;
            _catClient = catClient;
            _cmsService = cmsService;
            _gandalf = gandalf;
        }

        /// <summary>
        /// Returns the combined navigation tree.
        /// </summary>
        [WebGet(UriTemplate = "list")]
        public async Task<Response<List<NavigationTreeNode>>> List()
        {
            return List2(await _gandalf.GetFlatList());
        }

        /// <summary>
        /// Create a new NavigationTreeNode, for instance, an external link.
        /// </summary>
        [WebInvoke(UriTemplate = "create")]
        public async Task<Response<List<NavigationTreeNode>>> Create(List<NavigationTreeNode> items)
        {
            var navSet = await _navRepo.GetSetAsync();

            int currentHighestLinkIndex = navSet.Nodes.Where(n => n.NodeType == "link").Select<NavigationNode, int?>(n => n.OriginalIdInt).OrderBy(i => i).LastOrDefault() ?? 0;

            foreach (var item in items)
            {
                if (item.ParentId == null)
                    item.ParentId = UNLINKED_PAGES_NODE_ID;


                if (item.Id == null)
                    item.Id = "link^^" + ++currentHighestLinkIndex;

                navSet.Nodes.Add(item.Map<NavigationNode>());
            }

            await _navRepo.SaveSetAsync(navSet);

            return List2(items);
        }

        /// <summary>
        /// Reorganize some part of the navigation tree.
        /// </summary>
        [WebInvoke(UriTemplate = "update")]
        public async Task<Response<List<NavigationTreeNode>>> Edit(List<NavigationTreeNode> items)
        {
            var originalTree = (await List()).Items;

            // step 1. find any pages or categories whose parent has changed.
            List<Task> categoryAndDocumentMoves = GetCategoryAndDocumentMoveTasks(originalTree, items);

            // step 2. handle any renames.
            List<Task> renames = GetRenameTasks(originalTree, items);

            // wait on all the update threads.
            if (categoryAndDocumentMoves.Count > 0 || renames.Count > 0)
            {
                await Task.WhenAll(categoryAndDocumentMoves.Concat(renames));

                // if we re-organized the list, repopulate it.
                originalTree = (await List()).Items;
            }

            // step 3. detect any category reorder.
            List<Task> categoryUpdateTasks = GetCategoryReorders(originalTree, items);

            // if category order changed, wait for the changes and then refresh the list.
            if (categoryUpdateTasks.Count > 0)
            {
                await Task.WhenAll(categoryUpdateTasks);
                originalTree = (await List()).Items;
            }


            // step 4. detect any page reorder.
            var newPageOrder = items.Where(i => i.NodeType == NODE_TYPE_PAGE).GroupBy(co => co.ParentId);
            NavigationSet pageOrderNavSet = null;

            foreach (var group in newPageOrder)
            {
                foreach (var newPage in group)
                {
                    var original = originalTree.First(c => c.Id == newPage.Id);
                    if (original.Index != newPage.Index)
                    {
                        // lazy load pageOrderNavSet
                        if (pageOrderNavSet == null)
                            pageOrderNavSet = await _navRepo.GetSetAsync();

                        // update this page
                        var navPage = pageOrderNavSet.Nodes.First(n => n.Id == newPage.Id);
                        navPage.Index = newPage.Index;
                    }
                }
            }

            // if there are changes, save the nav set and refresh the tree one last time.
            if (pageOrderNavSet != null)
            {
                await _navRepo.SaveSetAsync(pageOrderNavSet);
                originalTree = (await List()).Items;
            }

            return List2(originalTree);
        }

        /// <summary>
        /// Compares originalTree with changeTree and returns a list of tasks to update categories and navigation 
        /// for items whose ParentId changed.
        /// </summary>
        private List<Task> GetCategoryAndDocumentMoveTasks(List<NavigationTreeNode> originalTree, List<NavigationTreeNode> changeTree)
        {
            var tasks = new List<Task>();

            var parentChanges =
                from i in changeTree
                let original = originalTree.First(o => o.Id == i.Id)
                where i.NodeType == NODE_TYPE_PAGE || i.NodeType == NODE_TYPE_CATEGORY || i.NodeType == NODE_TYPE_LINK
                where i.ParentId != original.ParentId
                select i;

            foreach (var change in parentChanges.Where(ch => ch.NodeType == NODE_TYPE_CATEGORY))
            {
                int categoryId = Convert.ToInt32(change.IdParts[1]);
                var newCategoryParent = originalTree.First(n => n.Id == change.ParentId);

                int? newCategoryParentId = newCategoryParent.Id == ROOT_NODE_NAME ? null : (int?)Convert.ToInt32(newCategoryParent.IdParts[1]);
                tasks.Add(
                    _catClient.GetCategory(categoryId)
                    .ContinueWith(t =>
                    {
                        var category = t.Result.ReadAsSync();
                        category.ParentCategoryId = newCategoryParentId;
                        category.Sequence = change.Index;
                        return _catClient.UpdateCategory(category, category.Id);
                    })
                    .Unwrap()
                );
            }
            var navChanges = parentChanges.Where(ch => ch.NodeType == NODE_TYPE_PAGE || ch.NodeType == NODE_TYPE_LINK);
            if (navChanges.Count() > 0)
            {
                tasks.Add(
                    _navRepo.GetSetAsync()
                    .ContinueWith(t =>
                    {
                        var navSet = t.Result;

                        foreach (var change in navChanges)
                        {
                            var node = navSet.Nodes.FirstOrDefault(n => n.Id == change.Id);
                            if (node == null)
                            {
                                node = Mapper.Map<NavigationNode>(change);
                                navSet.Nodes.Add(node);
                            }
                            else
                            {
                                node.ParentId = change.ParentId;
                                node.Index = change.Index;
                            }
                        }

                        return _navRepo.SaveSetAsync(navSet);
                    })
                    .Unwrap()
                );
            }

            return tasks;
        }

        private List<Task> GetRenameTasks(List<NavigationTreeNode> originalTree, List<NavigationTreeNode> changeTree)
        {
            var tasks = new List<Task>();

            var nameChanges =
                from i in changeTree
                let original = originalTree.First(o => o.Id == i.Id)
                where i.NodeType == NODE_TYPE_PAGE || i.NodeType == NODE_TYPE_CATEGORY
                where i.Name != original.Name
                select i;

            foreach (var change in nameChanges)
            {
                // issue changes to categories immediately.
                if (change.NodeType == NODE_TYPE_CATEGORY)
                {
                    int categoryId = Convert.ToInt32(change.IdParts[1]);

                    tasks.Add(
                        _catClient.GetCategory(categoryId)
                        .ContinueWith(t =>
                        {
                            var category = t.Result.ReadAsSync();

                            category.Content.Name = change.Name;
                            return _catClient.UpdateCategory(category, category.Id);
                        })
                        .Unwrap()
                    );
                }
                // name changes are in CMS, so issue those immediately too.
                else if (change.NodeType == NODE_TYPE_PAGE)
                {
                    string docCollection = change.IdParts[1];
                    string docId = change.IdParts[2];

                    tasks.Add(
                        _cmsService.GetByPath(docCollection, docId, "", "draft")
                        .ContinueWith(t =>
                        {
                            var page = t.Result.ReadAsSync();
                            if (page == null)
                                throw new Exception("Document not found: " + docCollection + "/" + docId);

                            page.Set("link_title", change.Name);

                            return _cmsService.Update(page);
                        })
                        .Unwrap()
                    );
                }
            }

            return tasks;
        }

        private List<Task> GetCategoryReorders(List<NavigationTreeNode> originalTree, List<NavigationTreeNode> changeTree)
        {
            var tasks = new List<Task>();

            var origCatOrder = originalTree.GetCategoryOrder();
            var newCatOrder = changeTree.GetCategoryOrder().GroupBy(co => co.ParentId);

            foreach (var group in newCatOrder)
            {
                foreach (var newCatInfo in group)
                {
                    var original = origCatOrder.First(c => c.Id == newCatInfo.Id);
                    if (original.Index != newCatInfo.Index)
                    {
                        // update this category.
                        int catId = Convert.ToInt32(originalTree.First(i => i.Id == newCatInfo.Id).IdParts[1]);

                        tasks.Add(
                            _catClient.GetCategory(catId)
                            .ContinueWith(t =>
                            {
                                var cat = t.Result.ReadAsSync();

                                // calculate the position change.
                                // ex: if the original position was 1, and now the position is 5,
                                // delta is +4. Conversely, if the original position was 4 and the
                                // position is now 2, delta is -2.
                                int delta = newCatInfo.Index - original.Index;

                                cat.Sequence = cat.Sequence + delta;
                                return _catClient.UpdateCategory(cat, cat.Id);
                            })
                            .Unwrap()
                        );
                    }
                }
            }

            return tasks;
        }
    }

    public static class NavigationNodeExtensions
    {
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

        /// <summary>
        /// Gets the order of just categories in a NavigationNode list.
        /// </summary>
        public static IEnumerable<CategoryOrderInformation> GetCategoryOrder(this List<NavigationTreeNode> nodes)
        {
            return
                from n in nodes
                where n.NodeType == "category"
                let canonicalIndex = nodes.Where(no => no.NodeType == "category" && no.ParentId == n.ParentId).OrderBy(no => no.Index).ToList().IndexOf(n)
                select new CategoryOrderInformation { Id = n.Id, ParentId = n.ParentId, Index = n.Index.HasValue ? n.Index.Value : 0, CanonicalIndex = canonicalIndex, Node = n };
        }

        /// <summary>
        /// Gets the order of just pages in a NavigationNode list.
        /// </summary>
        public static IEnumerable<CategoryOrderInformation> GetPagesOrder(this List<NavigationTreeNode> nodes)
        {
            return
                from n in nodes
                where n.NodeType == "page"
                select new CategoryOrderInformation { Id = n.Id, ParentId = n.ParentId, Index = n.Index.HasValue ? n.Index.Value : 0, Node = n };
        }
    }
}