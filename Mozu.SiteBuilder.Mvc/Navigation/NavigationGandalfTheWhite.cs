using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Mozu.Content.Contracts.Clients;
using Mozu.Core.Api.Client;
using Mozu.Core.Logging;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Caching;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Models.Navigation;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.Core;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.SEO;

namespace Mozu.SiteBuilder.Mvc.Navigation
{
    /// <summary>
    /// After his defeat by the Balrog of Performance Testing, Gandalf the Grey has
    /// returned to the magical world of Mozu Sitebuilder as Gandalf The White.
    /// </summary>
    public sealed class NavigationGandalfTheWhite : INavigationGandalf
    {
        IProductCategoryRuntimeWebApiClient _productCategoryRuntimeWebApiClient;
        IDocumentListWebApiClient _documentClient;
        INavigationRepository _navRepo;
        ILogger _logger;
        MD5 _md5;
        IStorefrontCache _cache;
        private readonly ICustomRouteHandler _customRouteHandler;
        readonly NavigationNodeIndexComparer _navigationNodeIndexComparer = new NavigationNodeIndexComparer();
        readonly bool _shouldRequestInactiveDocuments;

        const string NAVIGATION_LIST_INTERNAL_CACHE_KEY = "navigation_list";
        const string NAVIGATION_TREE_CACHE_KEY = "navigation_tree";

        // the top level name in EXT's tree thing (a root pseudo-node).
        const string SUPER_ROOT_NODE_NAME = "root";

        // the top level name for items that exist in the navigation tree.
        const string NAV_ROOT_NODE_NAME = "_navigation";

        // the special node to assign unlinked pages as a child of.
        const string UNLINKED_PAGES_NODE_ID = "_unlinked";


        /// <summary>
        /// Public constructor.
        /// </summary>
        public NavigationGandalfTheWhite(IProductCategoryRuntimeWebApiClient productCategoryRuntimeWebApiClient, IDocumentListWebApiClient documentClient, INavigationRepository navRepo,  ILogger logger, PageContext pageContext, IApiContext apicontext, IStorefrontCache cache = null, ICustomRouteHandler customRouteHandler= null)
        {
            _productCategoryRuntimeWebApiClient = productCategoryRuntimeWebApiClient.CloneWithoutUserClaims();
            _documentClient = documentClient.CloneWithoutUserClaims();
            _navRepo = navRepo;
            _logger = logger;
            _md5 = MD5.Create();
            _cache = cache;
            _customRouteHandler = customRouteHandler;

            _shouldRequestInactiveDocuments = pageContext.IsEditMode || (apicontext.UserClaims != null && apicontext.UserClaims.ScopeType.EqualsIgnoreCase(UserScopeType.Tenant.ToStringQuickly())); // if tenant admin or edit mode...

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
                var list = t.Result;
                if (_cache != null && !String.IsNullOrEmpty(list.ETag))
                {
                    var cached = _cache.Get<List<IRuntimeNavigationNode>>(NAVIGATION_TREE_CACHE_KEY + list.ETag, CacheScope.Site);
                    if (cached != null)
                        return cached;
                }
                var result = BuildTree(list).Cast<IRuntimeNavigationNode>().ToList();

                if (_cache != null && !String.IsNullOrEmpty(list.ETag))
                {
                    _cache.Set(NAVIGATION_TREE_CACHE_KEY + list.ETag, result, CacheScope.Site);
                }

                return result;
            });
        }

        private class SuperNavigationNodeList : List<SuperNavigationNode>
        {
            public string ETag { get; set; }

            public SuperNavigationNodeList(int capacity) : base(capacity) {}
        }
        private Task<SuperNavigationNodeList> GetListInternal()
        {
            // get the list of categories
            var catTask = _productCategoryRuntimeWebApiClient.GetCategoryTree();

            // get the list of pages
            var pageTask = _documentClient.GetDocuments(documentListName: "pages@mozu", pageSize: 250, includeInactive: _shouldRequestInactiveDocuments);

            // get the list of blogs
            // var blogTask = _cmsService.GetList2(contentCollection: "blogs", pageSize: 1, filter: "DocumentTypeFQN eq blog" );

            // get our navigation data authority
            var navTask = _navRepo.GetNavigationSetAsync();

            return Task.WhenAll(catTask, pageTask, navTask).ContinueWith(t =>
            {
                var pagesResp = pageTask.Result;
                var pages = pagesResp.ReadAsSync();
                var categoriesResp = catTask.Result;
                var categories = catTask.Result.ReadAsSync();
                var navset = navTask.Result;
                var navsetEtag = navset is NavigationSet ? (navset as NavigationSet).ETag : null;

                string etag = CompositeETag(categoriesResp.ETag(), pagesResp.ETag(), navsetEtag);

                if (!String.IsNullOrEmpty(etag) && _cache != null)
                {
                    var cached = _cache.Get<SuperNavigationNodeList>(NAVIGATION_LIST_INTERNAL_CACHE_KEY + etag, CacheScope.Site);
                    if (cached != null)
                        return cached;
                }

                int numpages = pages != null && pages.Items != null ? pages.Items.Count : 0;
                int numcats = categories != null && categories.Items != null ? categories.Items.Count : 0;
                int numNavset = navset != null ? navset.Count : 0;
                var masterList = new SuperNavigationNodeList(numpages + numcats + numNavset + 2);
                masterList.ETag = etag;

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
                            node = new SuperNavigationNode
                            {
                                Name = string.IsNullOrEmpty(page.Get<string>("link_title")) ? page.Name : page.Get<string>("link_title"),
                                NodeType = NavigationNodeType.Page,
                                Id = "page^^" + page.ListFQN + "^^" + page.Id,
                                ParentId = navmeta.ParentId,
                                OriginalId = page.Id,
                                OriginalDocumentListName = page.ListFQN,
                                Index = navmeta.Index,
                                Url = _customRouteHandler.GetCannonicalUrl(SiteSettings.General.Contracts.General.Routing.FancyRoute.CmsPage, () => AutoMapper.Mapper.Map<IDictionary<string, object>>(page), false).Result ?? (String.Equals(page.ListFQN, "pages@mozu", StringComparison.OrdinalIgnoreCase) ? "/" + page.Name : "/" + page.ListFQN + "/" + page.Name)
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
                        node = new SuperNavigationNode
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
                    select new SuperNavigationNode
                    {
                        Name = string.IsNullOrEmpty(p.Get<string>("link_title")) ? p.Name : p.Get<string>("link_title"),
                        NodeType = NavigationNodeType.Page,
                        Id = "page^^" + p.ListFQN + "^^" + p.Id,
                        ParentId = UNLINKED_PAGES_NODE_ID,
                        OriginalId = p.Id,
                        OriginalDocumentListName = p.ListFQN,
                        Index = 0,
                        Url = String.Equals(p.ListFQN, "pages@mozu", StringComparison.OrdinalIgnoreCase) ? "/" + p.Name : "/" + p.ListFQN + "/" + p.Name,
                    };
                masterList.AddRange(allUnassigned);

                if (!String.IsNullOrEmpty(etag) && _cache != null)
                {
                    _cache.Set(NAVIGATION_LIST_INTERNAL_CACHE_KEY + etag, masterList, CacheScope.Site);
                }
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
                    new SuperNavigationNode
                    {
                        NodeType = NavigationNodeType.Category,
                        CategoryCode = cat.CategoryCode,
                        Id = "cat^^" + cat.CategoryId,
                        ParentId = cat.ParentCategory != null ? "cat^^" + cat.ParentCategory.CategoryId : NAV_ROOT_NODE_NAME,
                        OriginalId = cat.CategoryId.ToString(),
                        Url = cat.Content == null || String.IsNullOrEmpty(cat.Content.Slug) ? "/c/" + cat.CategoryId : "/" + cat.Content.Slug + "/c/" + cat.CategoryId,
                        Name = cat.Content.Name,
                        // category "Sequence" is 1-indexed, but our navigation list is 0-indexed.. so we subtract 1.
                        // actually, "Sequence" does not appear to follow any rules, so sometimes it's zero indexed.
                        // we have to do a Math.Max to guard against negative numbers.
                        Index = Math.Max(cat.Sequence.GetValueOrDefault(1) - 1, 0),
                        IsHidden = !cat.IsDisplayed,
                        IsEmpty = !cat.Count.HasValue || cat.Count.Value <= 0
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
                var result = node1.Index.CompareTo(node2.Index);
                return (result == 0) 
                    ? node1.Id.CompareTo(node2.Id) 
                    : result;
            }
        }


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

                if (n.ParentId == null || n.ParentId == SUPER_ROOT_NODE_NAME || !lookupTable.ContainsKey(n.ParentId))
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
    }
}
