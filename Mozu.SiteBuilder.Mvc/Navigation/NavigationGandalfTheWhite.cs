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
using Mozu.SiteBuilder.Mvc.Caching;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Models.Navigation;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.Core;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using Mozu.SiteBuilder.Mvc.Helpers;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Content.Contracts;
using System.Threading;
using System.Net.Http;
using System.Web;
using Mozu.SiteBuilder.Mvc.Context;
using Microsoft.Extensions.Logging;

namespace Mozu.SiteBuilder.Mvc.Navigation
{
    /// <summary>
    /// After his defeat by the Balrog of Performance Testing, Gandalf the Grey has
    /// returned to the magical world of Mozu Sitebuilder as Gandalf The White.
    /// </summary>
    public sealed class NavigationGandalfTheWhite : INavigationGandalf
    {
        readonly ICategoryTreeProvider _categoryProvider;
        // readonly IDocumentListWebApiClient _documentClient;
        readonly INavigationRepository _navRepo;
        readonly ILogger _logger;
        readonly MD5 _md5;
        readonly IStorefrontCache _cache;
        readonly ICustomRouteHandler _customRouteHandler;
        readonly ISiteBuilderContextProvider _contextProvider;
        readonly NavigationNodeIndexComparer _navigationNodeIndexComparer = new NavigationNodeIndexComparer();
        readonly bool _shouldRequestInactiveDocuments;
        readonly UrlHelper _urlHelper;
        readonly Lazy<string> _primaryDomain;

        IServiceProvider _lifetimeScope;
        private string _priceListCode;

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
        public NavigationGandalfTheWhite(ISiteBuilderContextProvider contextProvider,
            IDocumentListWebApiClient documentClient, INavigationRepository navRepo, ILogger<NavigationGandalfTheWhite> logger, PageContext pageContext, IApiContext apicontext, ICategoryTreeProvider categoryProvider, UrlHelper urlHelper, IStorefrontCache cache = null, ICustomRouteHandler customRouteHandler = null, IServiceProvider lifetimeScope = null,
            Lazy<ISiteContext> siteContext = null)
        {
            _contextProvider = contextProvider;
            _categoryProvider = categoryProvider;
            //  _documentClient = documentClient.CloneWithoutUserClaims();
            _navRepo = navRepo;
            _logger = logger;
            _md5 = MD5.Create();
            _cache = cache;
            _customRouteHandler = customRouteHandler;
            _urlHelper = urlHelper;
            _lifetimeScope = lifetimeScope;
            _priceListCode = apicontext.PriceListCode;
            _shouldRequestInactiveDocuments = pageContext.IsEditMode || (apicontext.UserClaims != null && apicontext.UserClaims.ScopeType.EqualsIgnoreCase(UserScopeType.Tenant.ToStringQuickly())); // if tenant admin or edit mode...
            _primaryDomain = new Lazy<string>(() => siteContext.Value?.Domains?.Primary?.DomainName);
        }




        /// <summary>
        /// Gets all navigation nodes in a flat list.
        /// Flat list is used by Admin.
        /// </summary>
        public  List<ITreeNavigationNode> GetFlatList()
        {
            return GetSuperNavList().FlatList;

        }

        /// <summary>
        /// Get navigation as a tree. This is used by themes in storefront.
        /// </summary>
        /// <returns></returns>
        public List<IRuntimeNavigationNode> GetTreeNavigation()
        {
            return  GetSuperNavList().TreeList;

        }
        SuperNavigationNodeList _list;

        SuperNavigationNodeList GetSuperNavList()
        {
            if (_list == null)
            {
                var ctxData =  _contextProvider.GetContextData();
                var cacheKey = GetCacheKey(ctxData.Hash, _priceListCode);
                _list = GetFromCache(cacheKey);

                if (_list != null)
                {
                    return _list;
                }
                var atomicString = string.Intern(cacheKey);
                lock (atomicString)
                {
                    _list = GetFromCache(cacheKey);
                    if (_list != null)
                    {
                        return _list;
                    }
                    var categoryTree =  _categoryProvider.GetAllCategories();
                    _list = ProccessNavData(ctxData, categoryTree);
                    _cache.Set(cacheKey,
                        _list,
                        CacheScope.Site,
                        StorefrontCacheTypes.Default);
                    return _list;
                }
            }
            return _list;
        }

     

        private static string GetCacheKey(string etag, string priceListCode)
        {
            return string.Intern(NAVIGATION_LIST_INTERNAL_CACHE_KEY + etag + priceListCode);
        }

        private SuperNavigationNodeList GetFromCache(string cachekey)
        {
            return _cache?.Get<SuperNavigationNodeList>(cachekey, CacheScope.Site);
        }

        private class SuperNavigationNodeList : List<SuperNavigationNode>
        {
            public string ETag { get; set; }

            public List<IRuntimeNavigationNode> TreeList { get; set; }
            public List<ITreeNavigationNode> FlatList { get; set; }

            public SuperNavigationNodeList(int capacity) : base(capacity) { }
        }
       
        
            
        private SuperNavigationNodeList ProccessNavData(ISiteBuilderContextData ctxData, CategoryTree categoryTree)
        {

            var pages = ctxData.NavWebPages;


            var navset = ctxData.NavigationSet;


            string etag = ctxData.Hash;


            var cacheKey = GetCacheKey(etag, _priceListCode);




            int numpages = pages != null && pages.Items != null ? pages.Items.Count : 0;
            int numcats = categoryTree.AllCategories.Count;
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
            var allCats = GetAllCategoriesFromTree(categoryTree.AllCategories);

            masterList.AddRange(allCats);

            // build the masterlist. Step 2: put in navigation items we know about.
            foreach (var group in (navset ?? Enumerable.Empty<INavigationNode>()).GroupBy(x => x.ParentId))
            {
                var groupCats = allCats.Where(x => x.ParentId == group.Key).ToList();


                foreach (var navmeta in group.OrderBy(x=> x.Index))
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
                                Url = _urlHelper.MakeUrl(UrlHelper.UrlType.Document, page, (Dictionary<string, object>)null, false),
                                FqUrl= _urlHelper.MakeUrl(UrlHelper.UrlType.Document, page, (Dictionary<string, object>)null, false, _primaryDomain.Value)
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
                            OpenInNewWindow = navmeta.OpenInNewWindow,
                            Index = navmeta.Index,
                            ParentId = navmeta.ParentId,
                            NodeType = NavigationNodeType.Link
                        };
                    }
                    else
                    {
                        continue;
                    }
                    if (groupCats.Count > 0)
                    {
                        foreach (var catnode in groupCats.Where(x => x.Index >= node.Index))
                        {
                            catnode.Index++;
                        }
                    }
                    masterList.Add(node);
                }


               
            
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
                    Url = _urlHelper.MakeUrl(UrlHelper.UrlType.Document, p, null, false),
                    FqUrl = _urlHelper.MakeUrl(UrlHelper.UrlType.Document, p, null, false, hostname: _primaryDomain.Value),
                };
            masterList.AddRange(allUnassigned);

           


            masterList.TreeList = BuildTree(masterList).Cast<IRuntimeNavigationNode>().ToList();
            var ordered = masterList.OrderBy(n => n.ParentId).ThenBy(n => n.Index);
            SetHomePage(ordered.Where(x => x.ParentId == NAV_ROOT_NODE_NAME));
            masterList.FlatList =  ordered.ToList<ITreeNavigationNode>();




            return masterList;


        }
           
           

        /// <summary>
        /// Maps a category from the tree into a navigation node
        /// </summary>
        /// <param name="inputList"></param>
        /// <returns></returns>
        List<SuperNavigationNode> GetAllCategoriesFromTree(List<Category> inputList)
        {
            if (inputList == null)
                return null;

            var nextNullInt = 10000;

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
                        Url = _urlHelper.MakeUrl(UrlHelper.UrlType.Category, cat, new Dictionary<string, object>(), false),
                        FqUrl = _urlHelper.MakeUrl(UrlHelper.UrlType.Category, cat, new Dictionary<string, object>(), false, hostname: _primaryDomain.Value),

                        Name = cat.Content.Name,
                        
                        // category "Sequence" is 1-indexed, but our navigation list is 0-indexed.. so we subtract 1.
                        // actually, "Sequence" does not appear to follow any rules, so sometimes it's zero indexed.
                        // we have to do a Math.Max to guard against negative numbers.
                        Index = cat.Sequence.GetValueOrDefault(nextNullInt++),
                        IsHidden = !cat.IsDisplayed,
                        IsEmpty = !cat.Count.HasValue || cat.Count.Value <= 0
                    });
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
            SetHomePage(topLevelNav);
            return topLevelNav;
        }

        private void SetHomePage(IEnumerable<SuperNavigationNode> topLevelNav)
        {
            var homePage = topLevelNav.OrderBy(n => n.Index).FirstOrDefault(node => !node.NodeType.IsLink && !string.IsNullOrEmpty(node.Url));
            if (homePage != null)
            {
                homePage.IsHomePage = true;
            }
        }

        private string CompositeETag(string categoriesEtag, string pagesEtag, string navsetEtag)
        {
            // if any service didn't give us an etag, we can't depend on this cache.
            if (string.IsNullOrEmpty(categoriesEtag) || string.IsNullOrEmpty(pagesEtag) || string.IsNullOrEmpty(navsetEtag))
                return null;

            // smoosh all the etags together in one glorious byte array and then MD5 that byte array.
            byte[] allTheBytes = Encoding.ASCII.GetBytes(categoriesEtag + pagesEtag + navsetEtag);
            string cacheKey = BitConverter.ToString(_md5.ComputeHash(allTheBytes));
            return cacheKey;
        }

      
    }
}
