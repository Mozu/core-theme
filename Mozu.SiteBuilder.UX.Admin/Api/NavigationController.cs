using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.Core.Api.Contracts.Client;
using DC = Mozu.ProductAdmin.Contracts;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Navigation;
using Mozu.SiteBuilder.UX.Models.Navigation;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class NavigationController : BaseController
    {
        private const bool USE_MOCK_DATA = false;

        // the top level name in EXT's tree thing (a root pseudo-node).
        public const string SUPER_ROOT_NODE_NAME = "root";

        // the top level name in EXT's tree thing (a root pseudo-node).
        public const string NAV_ROOT_NODE_NAME = "_navigation";

        // the special node to assign unlinked pages as a child of.
        public const string UNLINKED_PAGES_NODE_ID = "_unlinked";

        private INavigationRepository _navRepo;
        private ICategoryWebApiClient _catClient;
        private ICmsServiceWrapper _cmsService;
        private NavigationGandalf _gandalf;

        /// <summary>
        ///  Public constructor.
        /// </summary>
        public NavigationController(INavigationRepository navRepo, ICategoryWebApiClient catClient, ICmsServiceWrapper cmsService, NavigationGandalf gandalf)
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

            int currentHighestLinkIndex =
                (from n in navSet.Nodes
                 where n.NodeType != null && n.NodeType.IsLink
                 let stringId = n.OriginalId
                 let id = (stringId == null ? null : (int?)Convert.ToInt32(stringId))
                 orderby id
                 select id
                ).LastOrDefault() ?? 0;
                
            foreach (var item in items)
            {
                if (string.IsNullOrEmpty( item.ParentId ))
                    item.ParentId = UNLINKED_PAGES_NODE_ID;


                if (item.Id == null)
                    item.Id = "link^^" + ++currentHighestLinkIndex;

                navSet.Nodes.Add(item.Map<NavigationNode>());
            }

            await _navRepo.SaveSetAsync(navSet);

            return List2(items);
        }

        /// <summary>
        /// Delete a NavigationTreeNode (a document or a link).
        /// </summary>
        [WebInvoke(UriTemplate = "delete")]
        public async Task<Response<List<NavigationTreeNode>>> Delete(List<NavigationTreeNode> items)
        {
            var navSet = await _navRepo.GetSetAsync();
            bool isDirty = false; 

            foreach (var item in items)
            {
                if (item.NodeType.IsPage || item.NodeType.IsLink)
                {
                    var itemInNavSet = navSet.Nodes.FirstOrDefault(n => n.Id == item.Id);
                    if (itemInNavSet != null)
                    {
                        navSet.Nodes.Remove(itemInNavSet);
                        isDirty = true;
                    }
                }
            }

            if (isDirty)
                await _navRepo.SaveSetAsync(navSet);

            return List2(items);
        }

        /// <summary>
        /// Reorganize some part of the navigation tree.
        /// </summary>
        [WebInvoke(UriTemplate = "update")]
        public async Task<Response<List<NavigationTreeNode>>> Edit(List<NavigationTreeNode> items)
        {
            if (items.Count > 1)
                throw new ArgumentException("Unexpected number of updates: " + items.Count);

            var item = items.First();

            switch (item.EditAction)
            {
                case "rename":
                    if (item.NodeType.IsCategory)
                        await HandleCategoryRename(item);
                    else if (item.NodeType.IsPage)
                        await HandleCmsRename(item);
                    else if (item.NodeType.IsLink)
                        await HandleNavigationItemRename(item);
                    break;
                case "move":
                    if (item.NodeType.IsPage || item.NodeType.IsLink)
                        await HandleNavigationMove(item);
                    else if (item.NodeType.IsCategory)
                        await HandleCategoryMove(item);
                    break;
                default:
                    throw new ArgumentException("Unexpected edit action: " + item.EditAction);
            }

            return List2(items);

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
            Task docUpdateTask = GetDocumentReorders(originalTree, items);

            // if there are changes, save the nav set and refresh the tree one last time.
            if (docUpdateTask != null)
            {
                await docUpdateTask;
                originalTree = (await List()).Items;
            }

            return List2(originalTree);
        }

        /// <summary>
        /// Handles a category rename request.
        /// </summary>
        private Task<ServiceClientResponse<DC.Category>> HandleCategoryRename(NavigationTreeNode change)
        {
            int categoryId = Convert.ToInt32(change.OriginalId);

            // retrieve and update the requested category.
            return
                _catClient.GetCategory(categoryId)
                .ContinueWith(t =>
                {
                    var category = t.Result.ReadAsSync();

                    Debug.WriteLine(
                        String.Format("[cat {0}] Renaming category. Old Name: {1}. New Name: {2}.",
                        category.Id, category.Content.Name, change.Name
                    ));

                    category.Content.Name = change.Name;
                    return _catClient.UpdateCategory(category, category.Id);
                })
                .Unwrap()
            ;
        }

        /// <summary>
        /// Handles a page or blog rename request.
        /// </summary>
        private Task HandleCmsRename(NavigationTreeNode change)
        {
            string docCollection = change.OriginalCollection;
            string docId = change.OriginalId;

            // retrieve and update the requested category.
            return
                _cmsService.Get(docCollection, docId, false)
                .ContinueWith(t =>
                {
                    var page = t.Result.ReadAsSync();
                    if (page == null)
                        throw new Exception("Document not found: " + docCollection + "/" + docId);

                    Debug.WriteLine(
                        String.Format("[doc {0}] Renaming document. Old Name: {1}. New Name: {2}.",
                        page.Id, page.Get("link_title") ?? page.Name, change.Name
                    ));

                    page.Set("link_title", change.Name);

                    return _cmsService.Update(page);
                })
                .Unwrap()
            ;
        }

        /// <summary>
        /// Handles a rename of a link item.
        /// </summary>
        private Task HandleNavigationItemRename(NavigationTreeNode change)
        {
            // retrieve and update the navigation set.
            return
                _navRepo.GetSetAsync()
                .ContinueWith(t =>
                {
                    var navSet = t.Result;

                    var originalNode = navSet.Nodes.FirstOrDefault(n => n.Id == change.Id);

                    Debug.WriteLine(
                        String.Format("[node {0}] Renaming node. Old Name: {1}. New Name: {2}.",
                        originalNode.Id, originalNode.Name , change.Name
                    ));

                    originalNode.Name = change.Name;

                    return _navRepo.SaveSetAsync(navSet);
                })
                .Unwrap()
            ;
        }

        /// <summary>
        /// Handles a move or reorder of something in the navigation document.
        /// </summary>
        private Task HandleNavigationMove(NavigationTreeNode change)
        {
            return
                _navRepo.GetSetAsync()
                .ContinueWith(t => {
                    var navSet = t.Result;

                    var original = navSet.Nodes.FirstOrDefault(n => n.Id == change.Id);
                    if (original == null)
                    {
                        original = change.Map<NavigationNode>();
                        navSet.Nodes.Add(original);
                    }

                    // reorder within same parent
                    if (original.ParentId == change.ParentId)
                    {
                        var siblings =
                            from n in navSet.Nodes
                            where n.ParentId == change.ParentId
                            where n.Id != change.Id
                            select n;

                        // if new value is closer to the bottom of the list, then some displaced items need to decrease in index.
                        if (change.Index > original.Index)
                        {
                            siblings.Where(n => n.Index > original.Index && n.Index <= change.Index).ToList().ForEach(n => n.Index--);
                        }
                        // if new value is closer to the top of the list, then some displaced items need to increase in index.
                        else if (change.Index < original.Index)
                        {
                            siblings.Where(n => n.Index >= change.Index && n.Index < original.Index).ToList().ForEach(n => n.Index++);
                        }

                        // set the index
                        original.Index = change.Index;
                    }
                    // change of parent
                    else
                    {
                        var oldSiblings =
                            from n in navSet.Nodes
                            where n.ParentId == original.ParentId
                            where n.Id != change.Id
                            select n;

                        var newSiblings =
                            from n in navSet.Nodes
                            where n.ParentId == change.ParentId
                            where n.Id != change.Id
                            select n;

                        // any old siblings that came after this node need to move closer to the top.
                        oldSiblings.Where(n => n.Index > original.Index).ToList().ForEach(n => n.Index--);

                        // any new siblings that will be displaced by this node need to move closer to the bottom.
                        newSiblings.Where(n => n.Index <= change.Index).ToList().ForEach(n => n.Index++);

                        // set the index and parent
                        original.Index = change.Index;
                        original.ParentId = change.ParentId;
                    }

                    // finally, save the document.
                    _navRepo.SaveSetAsync(navSet);
                })
                ;
        }

        private Task HandleCategoryMove(NavigationTreeNode change)
        {
            int categoryId = Convert.ToInt32(change.OriginalId);

            var navTask = _navRepo.GetSetAsync();
            var catTask = _catClient.GetCategory(categoryId);
            var listTask = _gandalf.GetFlatList();

            return 
                Task.WhenAll(navTask, catTask, listTask)
                    .ContinueWith(_ => {
                        var list = listTask.Result;
                        var originalCat = catTask.Result.ReadAsSync();
                        var navSet = navTask.Result;
                        List<Task> updateTasks = new List<Task>();

                        var originalNav = list.FirstOrDefault(n => n.Id == change.Id);
                        if (originalNav == null)
                            return Task.Run(() => null);

                        // reorder within same parent
                        if (originalNav.ParentId == change.ParentId)
                        {
                            var navSiblings =
                                from n in navSet.Nodes
                                where n.ParentId == change.ParentId
                                select n;

                            var catSiblings =
                                from n in list
                                where n.ParentId == change.ParentId
                                where n.NodeType.IsCategory
                                where n.Id != change.Id
                                select n;

                            var changedCatSiblings = catSiblings.Where(n => n.Index > originalNav.Index && n.Index <= change.Index).ToList();

                            // if new value is closer to the bottom of the list, then some displaced items need to decrease in index.
                            if (change.Index > originalNav.Index)
                            {
                                navSiblings.Where(n => n.Index > originalNav.Index && n.Index <= change.Index).ToList().ForEach(n => n.Index--);
                                var catIds = catSiblings.Where(n => n.Index > originalNav.Index && n.Index <= change.Index).Select(n => Convert.ToInt32(n.OriginalId));
                                updateTasks.AddRange(ReorderCategories(catIds, ReorderDirection.Decrease));

                                // update the original category's sequence.
                                originalCat.Sequence = originalCat.Sequence + catIds.Count();
                            }
                            // if new value is closer to the top of the list, then some displaced items need to increase in index.
                            else if (change.Index < originalNav.Index)
                            {
                                navSiblings.Where(n => n.Index >= change.Index && n.Index < originalNav.Index).ToList().ForEach(n => n.Index++);
                                var catIds = catSiblings.Where(n => n.Index >= change.Index && n.Index < originalNav.Index).Select(n => Convert.ToInt32(n.OriginalId));
                                updateTasks.AddRange(ReorderCategories(catIds, ReorderDirection.Increase));

                                // update the original category's sequence.
                                originalCat.Sequence = originalCat.Sequence - catIds.Count();
                            }

                            updateTasks.Add(_catClient.UpdateCategory(originalCat, originalCat.Id));
                            updateTasks.Add(_navRepo.SaveSetAsync(navSet));
                        }
                        // change of parent
                        else
                        {
                            var oldSiblingsNav =
                                from n in navSet.Nodes
                                where n.ParentId == originalNav.ParentId
                                where n.Id != change.Id
                                select n;

                            var oldSiblingsCat =
                                from n in list
                                where n.ParentId == originalNav.ParentId
                                where n.Id != change.Id
                                where n.NodeType.IsCategory
                                select n;

                            var newSiblingsNav =
                                from n in navSet.Nodes
                                where n.ParentId == change.ParentId
                                where n.Id != change.Id
                                select n;

                            var newSiblingsCat =
                                from n in list
                                where n.ParentId == change.ParentId
                                where n.NodeType.IsCategory
                                where n.Id != change.Id
                                select n;

                            // any old siblings that came after this node need to move closer to the top.
                            oldSiblingsNav.Where(n => n.Index > originalNav.Index).ToList().ForEach(n => n.Index--);
                            var oldCatIds = oldSiblingsCat.Where(n => n.Index > originalNav.Index).Select(n => Convert.ToInt32(n.OriginalId));
                            updateTasks.AddRange(ReorderCategories(oldCatIds, ReorderDirection.Decrease));

                            // any new siblings that will be displaced by this node need to move closer to the bottom.
                            newSiblingsNav.Where(n => n.Index <= change.Index).ToList().ForEach(n => n.Index++);
                            var newCatIds = newSiblingsCat.Where(n => n.Index > originalNav.Index).Select(n => Convert.ToInt32(n.OriginalId));
                            updateTasks.AddRange(ReorderCategories(newCatIds, ReorderDirection.Increase));

                            // update the sequence and parent id of the original category.
                            originalCat.Sequence = change.Index - newSiblingsNav.Count(n => n.Index <= change.Index);
                            originalCat.ParentCategoryId = Convert.ToInt32( list.First(n => n.Id == change.ParentId).OriginalId );

                            updateTasks.Add(_catClient.UpdateCategory(originalCat, originalCat.Id));
                            updateTasks.Add(_navRepo.SaveSetAsync(navSet));
                        }

                        return Task.WhenAll(updateTasks);
                    })
                    .Unwrap()
                ;
        }

        private enum ReorderDirection {
            Increase,
            Decrease
        }

        private List<Task<ServiceClientResponse<DC.Category>>> ReorderCategories(IEnumerable<int> categories, ReorderDirection direction)
        {
            var returnList = new List<Task<ServiceClientResponse<DC.Category>>>();

            foreach (int catId in categories)
            {
                returnList.Add(
                    _catClient.GetCategory(catId)
                    .ContinueWith(t => {
                        var cat = t.Result.ReadAsSync();


                        if (direction == ReorderDirection.Decrease) 
                            cat.Sequence--; 
                        else 
                            cat.Sequence++;

                        return _catClient.UpdateCategory(cat, catId);
                    }).Unwrap()
                );
            }

            return returnList;
        }

        /// <summary>
        /// Compares originalTree with changeTree and returns a list of tasks to update categories and navigation 
        /// for items whose ParentId changed.
        /// </summary>
        [Obsolete]
        private List<Task> GetCategoryAndDocumentMoveTasks(List<NavigationTreeNode> originalTree, List<NavigationTreeNode> changeTree)
        {
            var tasks = new List<Task>();

            var parentChanges =
                from i in changeTree
                let original = originalTree.First(o => o.Id == i.Id)
                where i.NodeType.IsPage || i.NodeType.IsCategory || i.NodeType.IsLink
                where i.ParentId != original.ParentId
                select i;

            foreach (var change in parentChanges.Where(ch => ch.NodeType.IsCategory))
            {
                int categoryId = Convert.ToInt32(change.OriginalId);
                var newCategoryParent = originalTree.First(n => n.Id == change.ParentId);

                int? newCategoryParentId = newCategoryParent.Id == NAV_ROOT_NODE_NAME ? null : (int?)Convert.ToInt32(newCategoryParent.OriginalId);
                tasks.Add(
                    _catClient.GetCategory(categoryId)
                    .ContinueWith(t =>
                    {
                        var category = t.Result.ReadAsSync();

                        Debug.WriteLine(
                            String.Format("[cat {0}] Updating category parent and sequence. Old parent: {1}. Old sequence: {2}. New parent: {3}. New sequence: {4}", 
                            category.Id, category.ParentCategoryId, category.Sequence, newCategoryParentId, change.Index)
                        );

                        category.ParentCategoryId = newCategoryParentId;
                        category.Sequence = change.Index;
                        
                        return _catClient.UpdateCategory(category, category.Id);
                    })
                    .Unwrap()
                );
            }
            var navChanges = parentChanges.Where(ch => ch.NodeType.IsPage || ch.NodeType.IsLink);
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

                                Debug.WriteLine(
                                    String.Format("[nav {0}] Adding new node. Parent: {1}. Index: {2}.",
                                    node.Id, node.ParentId, node.Index
                                ));

                                navSet.Nodes.Add(node);
                            }
                            else
                            {
                                Debug.WriteLine(
                                    String.Format("[nav {0}] Updating node. Old Parent: {1}. Old Index: {2}. New Parent: {3}. New Index: {4}.",
                                    node.Id, node.ParentId, node.Index, change.ParentId, change.Index
                                ));

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

        [Obsolete]
        private List<Task> GetRenameTasks(List<NavigationTreeNode> originalTree, List<NavigationTreeNode> changeTree)
        {
            var tasks = new List<Task>();

            var nameChanges =
                from i in changeTree
                let original = originalTree.First(o => o.Id == i.Id)
                where i.NodeType.IsPage || i.NodeType.IsCategory
                where i.Name != original.Name
                select i;

            foreach (var change in nameChanges)
            {
                if (false) { }
                // name changes are in CMS, so issue those immediately too.
                else if (change.NodeType.IsPage)
                {
                }
            }

            return tasks;
        }

        [Obsolete]
        private List<Task> GetCategoryReorders(List<NavigationTreeNode> originalTree, List<NavigationTreeNode> changeTree)
        {
            var tasks = new List<Task>();

            IEnumerable<NavigationTreeNode> origCatOrder = null;//  originalTree.GetCategoryOrder();
            IEnumerable<IGrouping<string, NavigationTreeNode>> newCatOrder = null;// changeTree.GetCategoryOrder().GroupBy(co => co.ParentId);

            foreach (var group in newCatOrder)
            {
                foreach (var newCatInfo in group)
                {
                    var original = origCatOrder.First(c => c.Id == newCatInfo.Id);
                    if (original.Index != newCatInfo.Index)
                    {
                        // update this category.
                        int catId = Convert.ToInt32(originalTree.First(i => i.Id == newCatInfo.Id).OriginalId);

                        tasks.Add(
                            _catClient.GetCategory(catId)
                            .ContinueWith(t =>
                            {
                                var cat = t.Result.ReadAsSync();

                                // calculate the position change.
                                // ex: if the original position was 1, and now the position is 5,
                                // delta is +4. Conversely, if the original position was 4 and the
                                // position is now 2, delta is -2.
                                int delta = newCatInfo.Index.GetValueOrDefault(0) - original.Index.GetValueOrDefault(0);

                                int newCatSequence = cat.Sequence.GetValueOrDefault(0) + delta;

                                Debug.WriteLine(
                                    String.Format("[cat {0}] Reordering category. Old Sequence: {1}. New Sequence: {2}.",
                                    cat.Id, cat.Sequence, newCatSequence
                                ));

                                cat.Sequence = newCatSequence;
                                return _catClient.UpdateCategory(cat, cat.Id);
                            })
                            .Unwrap()
                        );
                    }
                }
            }

            return tasks;
        }

        [Obsolete]
        private Task GetDocumentReorders(List<NavigationTreeNode> originalTree, List<NavigationTreeNode> items)
        {
            var newPageOrder = items.Where(i => i.NodeType.IsPage).GroupBy(co => co.ParentId);

            // create a list of actions to update the navset
            // this way we can lazy-load the navset only if we need it.
            var navPageUpdates = new List<Action<NavigationSet>>();
            
            foreach (var group in newPageOrder)
            {
                foreach (var newPage in group)
                {
                    var original = originalTree.First(c => c.Id == newPage.Id);
                    if (original.Index != newPage.Index)
                    {
                        navPageUpdates.Add(
                            new Action<NavigationSet>(navSet => {
                                // update this page
                                var navPage = navSet.Nodes.FirstOrDefault(n => n.Id == newPage.Id);
                                if (navPage != null)
                                {
                                    Debug.WriteLine(
                                        String.Format("[nav {0}] Reordering node. Old Index: {1}. New Index: {2}.",
                                        navPage.Id, navPage.Index, newPage.Index
                                    ));
                                    navPage.Index = newPage.Index;
                                }
                            })
                        );
                    }
                }
            }

            // if there are any navSet updates, 
            // 1. load the navset
            // 2. then execute all the updates
            // 3. and finally save the navset.
            if (navPageUpdates.Count > 0)
                return _navRepo.GetSetAsync()
                    .ContinueWith(t => {
                        var navSet = t.Result;

                        navPageUpdates.ForEach(a => a.Invoke(navSet));

                        return _navRepo.SaveSetAsync(navSet);
                    })
                    .Unwrap();
            else
                return null;
        }
    }
}
