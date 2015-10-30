using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Api.Routing;
using Mozu.Core.Extensions;
using Mozu.Core.Logging;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Navigation;
using Mozu.SiteBuilder.UX.Models.Navigation;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using DC = Mozu.ProductAdmin.Contracts;
using Document = Mozu.Content.Contracts.Document;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/navigation", SuppressDescriptorGeneration = true)]
    public class NavigationController : BaseController
    {


        // the top level name in EXT's tree thing (a root pseudo-node).
        public const string SUPER_ROOT_NODE_NAME = "root";
        // the special node to assign unlinked pages as a child of.
        public const string UNLINKED_PAGES_NODE_ID = "_unlinked";

        private readonly ICategoryWebApiClient _catClient;
        private readonly ICmsServiceWrapper _cmsService;
        private readonly INavigationGandalf _gandalf;
        private readonly ILogger _log;
        private readonly INavigationRepository _navRepo;
        private readonly SiteContext _siteContext;

        /// <summary>
        ///     Public constructor.
        /// </summary>
        public NavigationController(INavigationRepository navRepo, ICategoryWebApiClient catClient, ICmsServiceWrapper cmsService, INavigationGandalf gandalf, ILogger log, SiteContext siteContext)
        {
            _navRepo = navRepo;
            _catClient = catClient;
            _cmsService = cmsService;
            _gandalf = gandalf;
            _log = log;
            _siteContext = siteContext;
        }

        /// <summary>
        ///     Returns the combined navigation tree.
        /// </summary>
        [HttpGetRoute(UriTemplate = "list")]
        public async Task<HttpResponseMessage > List(bool showContentLists )
        {
            _log.Debug("Generating list.");
            List<ITreeNavigationNode> list = await GetFlatList(showContentLists);
            bool needsFixup = false;
            foreach (var sibblingNodes in list.GroupBy(x => x.ParentId))
            {
                var hasDups = sibblingNodes.Where(x=> x.NodeType =="category").GroupBy(x => x.Index).Where(g => g.Count() > 1).Any();
                if (hasDups)
                {
                    needsFixup = true;
                    break;
                }
            }
            var resp = Request.CreateResponse(HttpStatusCode.OK, List2(list));

            resp.Headers.Add("needsFixup", needsFixup.ToString().ToLower());

            return resp;
        }

        class CatCompare : IEqualityComparer<Mozu.ProductAdmin.Contracts.Category>
        {

            bool IEqualityComparer<DC.Category>.Equals(DC.Category x, DC.Category y)
            {
                if (x == null && y == null)
                {
                    return true;
                }
                if (x == null || y == null)
                {
                    return false;
                }
                return x.Id == y.Id;
            }

            int IEqualityComparer<DC.Category>.GetHashCode(DC.Category obj)
            {
                if (obj == null)
                {
                    return 0;
                }
                return obj.Id.GetValueOrDefault(0).GetHashCode();
            }
        }
            
            
            [HttpPostRoute(UriTemplate = "fixup")]
        public async Task<HttpResponseMessage> Fixup()
        {
            var categories = new List<Mozu.ProductAdmin.Contracts.Category >();

            int start = 0;

            while (true)
            {
                var cats = (await _catClient.GetCategories(startIndex: start, pageSize: 600)).ReadAsSync();
                categories.AddRange(cats.Items);
                start = cats.PageSize + cats.StartIndex;
                if (cats.TotalCount <= start)
                {
                    break;
                }
            }


                var updatedCats = new HashSet<Mozu.ProductAdmin.Contracts.Category>(new CatCompare());


            foreach (var parentGroup in categories.GroupBy(x => x.ParentCategoryId))
            {
                var duplicates = parentGroup.GroupBy(i => i.Sequence ).Where(g => g.Count() > 1).Select(g => g.Key);

                if (!duplicates.Any())
                {
                    continue;
                }

                var sortedItems = parentGroup.OrderBy(x => x.Sequence.GetValueOrDefault(int.MaxValue)).ToList();

                var seed = 0;

                sortedItems.ForEach(x=> x.Sequence = ++seed );

                updatedCats.AddRange(sortedItems);

           
            }
            if (updatedCats.Count > 0)
            {
                var updateTasks = updatedCats.Select(x => _catClient.UpdateCategory(x, x.Id )).ToList();
                await Task.WhenAll(updateTasks);
                return this.Request.CreateResponse(HttpStatusCode.OK, true);
            }
            return this.Request.CreateResponse(HttpStatusCode.OK, false);

        }

        public async Task<List<ITreeNavigationNode>> GetFlatList(bool? showContentLists)
        {
            List<ITreeNavigationNode> list = await _gandalf.GetFlatList();


            list.AddRange(GetPageTemplateNodes());
            list.AddRange(GetEmailTemplateNodes());
            list.AddRange(GetBackOfficeTemplateNodes());

            if (showContentLists.GetValueOrDefault(false))
            {
                var etC = this.Request.Resolve<EntityControllerController>();
                etC.ControllerContext = this.ControllerContext;
                var etcRet = (await etC.ReadListsTree(pagingParams: new PagingParamaters(), extFilter: null, entityType: "cms")).Items[0];

                var entitiesWithSitebuilderUsage =
                    from e in etcRet.Items
                    let usages = e.MetaData["usages"].ToObject<string[]>()
                    where usages != null
                    where usages.Contains("sitebuilder", StringComparer.OrdinalIgnoreCase)
                    select e;

                list.AddRange(GetExtensibleContentTypeNodes(entitiesWithSitebuilderUsage));
            }
            

            return list;
        }

        private IEnumerable<ITreeNavigationNode> GetPageTemplateNodes()
        {
            var pageTypes = _siteContext == null ? Enumerable.Empty<PageTypeDefinition>() : _siteContext.Theme.PageTypes;

            // first return each of the page templates
            foreach (var pt in pageTypes) {
                yield return new SimpleTreeNavigationNode
                {
                    AllowDrag = false,
                    AllowDrop = false,
                    NodeType = NavigationNodeType.Template,
                    Id = "templates-" + pt.Id,
                    OriginalId = pt.Id,
                    Expanded = false,
                    Expandable = false,
                    Name = pt.Title,
                    Url = "/templates/" + pt.Id,
                    ParentId = "_templates",
                    IsHidden = false
                };
            }

            // now return the parent node
            yield return new NavigationTreeNode
            {
                AllowDrag = false,
                AllowDrop = false,
                NodeType = NavigationNodeType.Group,
                Id = "_templates",
                OriginalId = "_templates",
                Expanded = false,
                Expandable = true,
                Index = 99,
                Name = "Templates",
                ParentId = SUPER_ROOT_NODE_NAME,
                IsHidden = false
            };
        }


        private IEnumerable<ITreeNavigationNode> GetEmailTemplateNodes()
        {
            var emailTemplates = _siteContext == null ? Enumerable.Empty<PageTypeDefinition>() : _siteContext.Theme.EmailTemplates;

            // first return each of the email templates
            foreach (var t in emailTemplates)
            {
                yield return new NavigationTreeNode
                    {
                        AllowDrag = false,
                        AllowDrop = false,
                        NodeType = NavigationNodeType.EmailTemplate,
                        Id = "templates-" + t.Id,
                        OriginalId = t.Id,
                        Expanded = true,
                        Expandable = false,
                        Name = t.Title,
                        Url = "/email/preview/" + t.Id,
                        ParentId = "_emailTemplates",
                        IsHidden = false
                    };
            }

            // now return the parent node
            yield return new NavigationTreeNode
                    {
                        AllowDrag = false,
                        AllowDrop = false,
                        NodeType = NavigationNodeType.Group,
                        Id = "_emailTemplates",
                        OriginalId = "_templates",
                        Expanded = false,
                        Expandable = true,
                        Index = 100,
                        Name = "Email Templates",
                        ParentId = SUPER_ROOT_NODE_NAME,
                        IsHidden = false
                    };
        }

        private IEnumerable<ITreeNavigationNode> GetExtensibleContentTypeNodes(IEnumerable<Mozu.SiteBuilder.UX.Admin.Api.EntityControllerController.Node> eccns)
        {
            // first return each of the extensible type templates
            foreach (var e in eccns) {
                yield return new NavigationTreeNode()
                {
                    AllowDrag = true,
                    AllowDrop = false,
                    NodeType = NavigationNodeType.ContentList,
                    Id = "_cmsContentTypes" + e.Id,
                    MetaData = e.MetaData,
                    OriginalId = "_cmsContentTypes",
                    Expanded = true,
                    Expandable = true,
                    Index = 102,
                    Name = e.Text,
                    Url = "/-content-list-/" + (string)e.MetaData.GetValue("listFQN"),
                    ParentId = "_cmsContentTypes",
                    IsHidden = false
                };
            }

            // now return the parent node
            yield return new NavigationTreeNode
            {
                AllowDrag = false,
                AllowDrop = false,
                NodeType = NavigationNodeType.ContentList,
                Id = "_cmsContentTypes",
                OriginalId = "_cmsContentTypes",
                Expanded = false,
                Expandable = true,
                Index = 102,
                Name = "Content Lists",
                ParentId = SUPER_ROOT_NODE_NAME,
                IsHidden = false
            };
        }

        private IEnumerable<ITreeNavigationNode> GetBackOfficeTemplateNodes()
        {
            var boTemplates = _siteContext == null ? Enumerable.Empty<PageTypeDefinition>() : _siteContext.Theme.BackOfficeTemplates;

            // first return each of the email templates
            foreach (var t in boTemplates)
            {
                yield return new NavigationTreeNode
                {
                    AllowDrag = false,
                    AllowDrop = false,
                    NodeType = NavigationNodeType.OrderTemplate,
                    Id = "templates-" + t.Id,
                    OriginalId = t.Id,
                    Expanded = true,
                    Expandable = false,
                    Name = t.Title,
                    Url = "/back-office-preview/" + t.Id,
                    ParentId = "_backOffice",
                    IsHidden = false
                };
            }

            // now return the parent node
            yield return new NavigationTreeNode
            {
                AllowDrag = false,
                AllowDrop = false,
                NodeType = NavigationNodeType.Group,
                Id = "_backOffice",
                OriginalId = "_backOffice",
                Expanded = false,
                Expandable = true,
                Index = 101,
                Name = "Order Templates",
                ParentId = SUPER_ROOT_NODE_NAME,
                IsHidden = false
            };
        }

        /// <summary>
        ///     Create a new NavigationTreeNode, for instance, an external link.
        /// </summary>
        [HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<List<NavigationTreeNode>>> Create(List<NavigationTreeNode> items)
        {
            IList<INavigationNode> navSet = await _navRepo.GetNavigationSetAsync();

            int currentHighestLinkIndex =
                (from n in navSet
                 where n.NodeType != null && n.NodeType.IsLink
                 let stringId = n.OriginalId
                 let id = (stringId == null ? null : (int?) Convert.ToInt32(stringId))
                 orderby id
                 select id
                ).LastOrDefault() ?? 0;

            foreach (NavigationTreeNode item in items)
            {
                _log.Info("Creating navigation item: " + item.Name);

                if (string.IsNullOrEmpty(item.ParentId))
                    item.ParentId = UNLINKED_PAGES_NODE_ID;


                if (item.Id == null)
                    item.Id = "link^^" + ++currentHighestLinkIndex;

                navSet.Add(item);
            }

            await _navRepo.SaveSetAsync(navSet);

            return List2(items);
        }

        /// <summary>
        ///     Delete a NavigationTreeNode (a document or a link).
        /// </summary>
        [HttpPostRoute(UriTemplate = "delete")]
        public async Task<Response<List<NavigationTreeNode>>> Delete(List<NavigationTreeNode> items)
        {
            IList<INavigationNode> navSet = await _navRepo.GetNavigationSetAsync();
            bool isDirty = false;

            foreach (NavigationTreeNode item in items)
            {
                _log.Info("Deleting navigation item: " + item.Name);

                if (item.NodeType.IsPage || item.NodeType.IsLink)
                {
                    // delete item from navset.
                    INavigationNode itemInNavSet = navSet.FirstOrDefault(n => n.Id == item.Id);
                    if (itemInNavSet != null)
                    {
                        navSet.Remove(itemInNavSet);
                        isDirty = true;
                    }
                }
                if (item.NodeType.IsPage)
                {
                    // delete item from CMS
                    Tuple<bool, ServiceClientResponse<StreamContent>> resp = await _cmsService.Delete2(item.OriginalDocumentListName, item.OriginalId);
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
        ///     Reorganize some part of the navigation tree.
        /// </summary>
        [HttpPostRoute(UriTemplate = "update")]
        public async Task<Response<List<NavigationTreeNode>>> Edit(List<NavigationTreeNode> items)
        {
            if (items.Count > 1)
                throw new ArgumentException("Unexpected number of updates: " + items.Count);

            NavigationTreeNode item = items.First();

            _log.Info("Updating navigation item: " + item.Name + ". Action: " + item.EditAction);

            if (string.IsNullOrEmpty(item.OriginalId)&& !string.IsNullOrEmpty(item.Id))
            {
                item.OriginalId = item.Id.Split(new string[]{"^^"}, StringSplitOptions.RemoveEmptyEntries).LastOrDefault();
            }

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
        ///     Handles a category rename request.
        /// </summary>
        private Task<ServiceClientResponse<DC.Category>> HandleCategoryRename(NavigationTreeNode change)
        {
            int categoryId = Convert.ToInt32(change.OriginalId);

            // retrieve and update the requested category.
            return _catClient.GetCategory(categoryId)
                .ContinueWith(t => {
                    DC.Category category = t.Result.ReadAsSync();
                
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
        ///     Handles a page or blog rename request.
        /// </summary>
        private Task HandleCmsRename(NavigationTreeNode change)
        {
            string docCollection = change.OriginalDocumentListName;
            string docId = change.OriginalId;

            // retrieve and update the requested category.
            return _cmsService.Get2(docCollection, docId)
                .ContinueWith(t => {
                    Document page = t.Result.ReadAsSync();
                    if (page == null)
                        throw new Exception("Document not found: " + docCollection + "/" + docId);

                    Debug.WriteLine(
                        String.Format("[doc {0}] Renaming document. Old Name: {1}. New Name: {2}.",
                                      page.Id, page.Get<string>("link_title") ?? page.Name, change.Name
                            ));

                    page.Set("link_title", change.Name);

                    return _cmsService.Update2(page);
                })
                .Unwrap()
                ;
        }

        /// <summary>
        ///     Handles a rename of a link item.
        /// </summary>
        private Task HandleNavigationItemRename(NavigationTreeNode change)
        {
            // retrieve and update the navigation set.
            return _navRepo.GetNavigationSetAsync()
                .ContinueWith(t => {
                    IList<INavigationNode> navSet = t.Result;

                    INavigationNode originalNode = navSet.FirstOrDefault(n => n.Id == change.Id);

                    Debug.WriteLine(
                        String.Format("[node {0}] Renaming node. Old Name: {1}. New Name: {2}.",
                                      originalNode.Id, originalNode.Name, change.Name
                            ));

                    originalNode.Name = change.Name;

                    return _navRepo.SaveSetAsync(navSet);
                })
                .Unwrap()
                ;
        }

        /// <summary>
        ///     Handles a move or reorder of something in the navigation document.
        /// </summary>
        private Task HandleNavigationMove(NavigationTreeNode change)
        {
            return _navRepo.GetNavigationSetAsync()
                .ContinueWith(t => {
                    IList<INavigationNode> navSet = t.Result;

                    INavigationNode original = navSet.FirstOrDefault(n => n.Id == change.Id);
                    if (original == null)
                    {
                        original = change;
                        navSet.Add(original);
                    }

                    // reorder within same parent
                    if (original.ParentId == change.ParentId)
                    {
                        IEnumerable<INavigationNode> siblings =
                            from n in navSet
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
                        IEnumerable<INavigationNode> oldSiblings =
                            from n in navSet
                            where n.ParentId == original.ParentId
                            where n.Id != change.Id
                            select n;

                        IEnumerable<INavigationNode> newSiblings =
                            from n in navSet
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

            Task<IList<INavigationNode>> navTask = _navRepo.GetNavigationSetAsync();
            Task<ServiceClientResponse<DC.Category>> catTask = _catClient.GetCategory(categoryId);
            Task<List<ITreeNavigationNode>> listTask = GetFlatList(false);

            return Task.WhenAll(navTask, catTask, listTask)
                .ContinueWith(_ => {
                    List<ITreeNavigationNode> list = listTask.Result;
                    DC.Category originalCat = catTask.Result.ReadAsSync();
                    IList<INavigationNode> navSet = navTask.Result;
                    var updateTasks = new List<Task>();

                    ITreeNavigationNode originalNav = list.FirstOrDefault(n => n.Id == change.Id);
                    if (originalNav == null)
                        return Task.Run(() => null);

                    int? oldSequence = originalCat.Sequence;
                    int? newSequence = null;

                    // reorder within same parent
                    if (originalNav.ParentId == change.ParentId)
                    {
                        IEnumerable<INavigationNode> navSiblings =
                            from n in navSet
                            where n.ParentId == change.ParentId
                            select n;

                        IEnumerable<INavigationNode> catSiblings =
                            from n in list
                            where n.ParentId == change.ParentId
                            where n.NodeType.IsCategory
                            where n.Id != change.Id
                            select n;

                        // if new value is closer to the bottom of the list, then some displaced items need to decrease in index.
                        if (change.Index > originalNav.Index)
                        {
                            navSiblings.Where(n => n.Index > originalNav.Index && n.Index <= change.Index).ToList().ForEach(n => n.Index--);
                            IEnumerable<int> catIds = catSiblings.Where(n => n.Index > originalNav.Index && n.Index <= change.Index).Select(n => Convert.ToInt32(n.OriginalId));
                            updateTasks.AddRange(ReorderCategories(catIds, ReorderDirection.Decrease));

                            // update the original category's sequence.
                            newSequence = originalCat.Sequence = originalCat.Sequence + catIds.Count();
                        }
                            // if new value is closer to the top of the list, then some displaced items need to increase in index.
                        else if (change.Index < originalNav.Index)
                        {
                            navSiblings.Where(n => n.Index >= change.Index && n.Index < originalNav.Index).ToList().ForEach(n => n.Index++);
                            IEnumerable<int> catIds = catSiblings.Where(n => n.Index >= change.Index && n.Index < originalNav.Index).Select(n => Convert.ToInt32(n.OriginalId));
                            updateTasks.AddRange(ReorderCategories(catIds, ReorderDirection.Increase));

                            // update the original category's sequence.
                            newSequence = originalCat.Sequence = Math.Min(change.Index, Math.Abs(originalCat.Sequence.GetValueOrDefault(0) - catIds.Count()));
                        }

                        if (  oldSequence != newSequence)
                        {
                            if (!newSequence.HasValue)
                            {
                                originalCat.Sequence = originalCat.Sequence.GetValueOrDefault(0) + 1;
                            }
                            updateTasks.Add(_catClient.UpdateCategory(originalCat, originalCat.Id));
                            
                        }
                       
                        updateTasks.Add(_navRepo.SaveSetAsync(navSet));
                    }
                    // change of parent
                    else
                    {
                        IEnumerable<INavigationNode> oldSiblingsNav =
                            from n in navSet
                            where n.ParentId == originalNav.ParentId
                            where n.Id != change.Id
                            select n;

                        IEnumerable<INavigationNode> oldSiblingsCat =
                            from n in list
                            where n.ParentId == originalNav.ParentId
                            where n.Id != change.Id
                            where n.NodeType.IsCategory
                            select n;

                        IEnumerable<INavigationNode> newSiblingsNav =
                            from n in navSet
                            where n.ParentId == change.ParentId
                            where n.Id != change.Id
                            select n;

                        IEnumerable<ITreeNavigationNode> newSiblingsCat =
                            from n in list
                            where n.ParentId == change.ParentId
                            where n.NodeType.IsCategory
                            where n.Id != change.Id
                            select n;

                        // any old siblings that came after this node need to move closer to the top.
                        oldSiblingsNav.Where(n => n.Index > originalNav.Index).ToList().ForEach(n => n.Index--);
                        IEnumerable<int> oldCatIds = oldSiblingsCat.Where(n => n.Index > originalNav.Index).Select(n => Convert.ToInt32(n.OriginalId));
                        updateTasks.AddRange(ReorderCategories(oldCatIds, ReorderDirection.Decrease));

                        // any new siblings that will be displaced by this node need to move closer to the bottom.
                        newSiblingsNav.Where(n => n.Index >= change.Index).ToList().ForEach(n => n.Index++);
                        IEnumerable<int> newCatIds = newSiblingsCat.Where(n => n.Index > change.Index).Select(n => Convert.ToInt32(n.OriginalId));
                        updateTasks.AddRange(ReorderCategories(newCatIds, ReorderDirection.Increase));

                        // update the sequence and parent id of the original category.
                        originalCat.Sequence = change.Index - newSiblingsNav.Count(n => n.Index <= change.Index);
                        originalCat.ParentCategoryId = Convert.ToInt32(list.First(n => n.Id == change.ParentId).OriginalId);

                        updateTasks.Add(_catClient.UpdateCategory(originalCat, originalCat.Id));
                        updateTasks.Add(_navRepo.SaveSetAsync(navSet));
                    }

                    return Task.WhenAll(updateTasks);
                })
                .Unwrap()
                ;
        }

        private List<Task<ServiceClientResponse<DC.Category>>> ReorderCategories(IEnumerable<int> categories, ReorderDirection direction)
        {
            var returnList = new List<Task<ServiceClientResponse<DC.Category>>>();

            foreach (int catId in categories)
            {
                returnList.Add(
                    _catClient.GetCategory(catId)
                        .ContinueWith(t => {
                            DC.Category cat = t.Result.ReadAsSync();


                            if (direction == ReorderDirection.Decrease)
                                cat.Sequence--;
                            else
                                cat.Sequence++;

                            return _catClient.UpdateCategory(cat, catId);
                        })
                        .Unwrap()
                    );
            }

            return returnList;
        }

        private enum ReorderDirection
        {
            Increase,
            Decrease
        }


        public class AdminRouteConfig: IRouteConfig
        {
            static HttpRouteCollection _defaults;
            static HttpRouteCollection GetDefaultRoutes()
            {
                var routes = new System.Web.Http.HttpRouteCollection();
                
                routes.MapCustomHttpRoute(
                      "cms_page",
                     "cms/{documentListName}/{documentName}",
                     new { controller = "cmspages", action = "Page" },
                      null,
                    null,
                    FancyRoute.CmsPage,
                    true);

                return routes;

            }
            public HttpRouteCollection DefaultRoutes
            {
                get
                {
                    return _defaults = _defaults ?? GetDefaultRoutes();
                }
            }
            public void RouteIncomingDefaultRouteRequest(HttpRequestMessage message)
            {
                throw new NotImplementedException();
            }

            public void RouteIncomingSystemRouteRequest(HttpRequestMessage message)
            {
                throw new NotImplementedException();
            }
        }
    }
}