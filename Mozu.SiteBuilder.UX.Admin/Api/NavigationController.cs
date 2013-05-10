using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using Mozu.Core.Api.Contracts.Client;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Navigation;
using DC = Mozu.ProductAdmin.Contracts;

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
                    // delete item from navset.
                    var itemInNavSet = navSet.Nodes.FirstOrDefault(n => n.Id == item.Id);
                    if (itemInNavSet != null)
                    {
                        navSet.Nodes.Remove(itemInNavSet);
                        isDirty = true;
                    }
                }
                if (item.NodeType.IsPage)
                {
                    // delete item from CMS
                    var resp = await _cmsService.Delete2(item.OriginalCollection, item.OriginalId);
                }
                if (item.NodeType.IsCategory)
                {
                    // delete item from categories
                    int categoryId = Convert.ToInt32(item.OriginalId);
                    await _catClient.DeleteCategoryById(categoryId);
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
                _cmsService.Get2(docCollection, docId)
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

                    return _cmsService.Update2(page);
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
                    return _navRepo.SaveSetAsync(navSet);
                })
                .Unwrap()
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

                        int? oldSequence = originalCat.Sequence;
                        int? newSequence = null;

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

                            // if new value is closer to the bottom of the list, then some displaced items need to decrease in index.
                            if (change.Index > originalNav.Index)
                            {
                                navSiblings.Where(n => n.Index > originalNav.Index && n.Index <= change.Index).ToList().ForEach(n => n.Index--);
                                var catIds = catSiblings.Where(n => n.Index > originalNav.Index && n.Index <= change.Index).Select(n => Convert.ToInt32(n.OriginalId));
                                updateTasks.AddRange(ReorderCategories(catIds, ReorderDirection.Decrease));

                                // update the original category's sequence.
                                newSequence = originalCat.Sequence = originalCat.Sequence + catIds.Count();
                            }
                            // if new value is closer to the top of the list, then some displaced items need to increase in index.
                            else if (change.Index < originalNav.Index)
                            {
                                navSiblings.Where(n => n.Index >= change.Index && n.Index < originalNav.Index).ToList().ForEach(n => n.Index++);
                                var catIds = catSiblings.Where(n => n.Index >= change.Index && n.Index < originalNav.Index).Select(n => Convert.ToInt32(n.OriginalId));
                                updateTasks.AddRange(ReorderCategories(catIds, ReorderDirection.Increase));

                                // update the original category's sequence.
                                newSequence = originalCat.Sequence = Math.Min(change.Index, Math.Abs(originalCat.Sequence.GetValueOrDefault(0) - catIds.Count()));
                            }

                            if (newSequence.HasValue && oldSequence != newSequence)
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
                            newSiblingsNav.Where(n => n.Index >= change.Index).ToList().ForEach(n => n.Index++);
                            var newCatIds = newSiblingsCat.Where(n => n.Index > change.Index).Select(n => Convert.ToInt32(n.OriginalId));
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
    }
}
