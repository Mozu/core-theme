using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.Text;
using AutoMapper;
//using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using System.ServiceModel.Web;
using Mozu.SiteBuilder.UX.Models.Navigation;
using Mozu.SiteBuilder.Mvc.Extensions;
using System.Threading.Tasks;
using Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    //ALL MAGIC STRINGS... 
      [ServiceContract]
    public class NavigationController : BaseController
    {
            // ICmsTypeHelper _cmsTypeHelper;
        ISiteBuilderContext _sbCtx;
        ICmsServiceWrapper _cmsService;
        ICategoryWebApiClient _catClient;
        INavigationRepository _navRepo;
        //ISessionDocumentStore _sessionDocStore;
        IProductWebApiClient _prodService;

        public NavigationController(
            ISiteBuilderContext sbCtx,
          ICategoryWebApiClient catClient,
             ICmsServiceWrapper cmsService,
            IProductWebApiClient prodService,
            INavigationRepository navRepo
            )
        {
            _catClient = catClient;
               _sbCtx = sbCtx;
            _cmsService = cmsService;
            _prodService = prodService;
            _navRepo = navRepo;
        }

          public Task<Response<List<NavigationTreeNode>>> Read(string node)
          {
              return GetRead(node);
          }
        //const  string _STRINGSPLITDELIM = "^^";
        //static string JoinParts ( params object[] parts )
        //{
        //    return string.Join ( _STRINGSPLITDELIM , parts );
        //}
        //static string[] SplitParts ( string str )
        //{
        //    return str.Split  ( new string[]{_STRINGSPLITDELIM}, StringSplitOptions.None );
        //}
        [WebGet(UriTemplate = "read/?node={node}" )]
        public Task<Response<List<NavigationTreeNode>>> GetRead(string node)
        {
            var resItems = new List<NavigationTreeNode>();
            var navSet = _navRepo.GetSet();
            var parts = NavigationNode.SplitParts(node ?? "root");
            if (parts[0] == "root")
            {
                ProcessRoot(resItems, navSet);
            }
            else if (parts[0] == "folder")
            {
                var request = new CmsListRequest()
                {
                    Collection = parts[1],
                    FolderId = parts[2],
                };
                var pages = _cmsService.GetList(request).Result.ReadAsAsync().Result.Items.Select(x => Mapper.Map<NavigationTreeNode>(x)).ToList ();
                pages.ForEach(x => { x.AllowDrag = x.AllowDrop = false; x.Leaf = true; });

                resItems.AddRange(pages);
            }
            else if (parts[0] == "page" && parts[1] == "blogs")
            {
                var folders = _cmsService.GetFolderTree("blogs").Result.Item1.Children
                           .Select(f => new NavigationTreeNode()
                           {
                               Name = DateTime.ParseExact(f.Folder.Name, "MM-yyyy", System.Globalization.CultureInfo.CurrentCulture).ToString("MMMM yyyy"),
                               Leaf = false,
                               AllowDrag = false,
                               AllowDrop = false,
                               Id = NavigationNode.JoinParts("folder", "blogs", f.Folder.Id),
                               NodeType = "folder"
                           });
                resItems.AddRange(folders);

            }
            else if (parts[0] == "category")
            {
                var catTask = _catClient.GetChildCategories(int.Parse(parts[1]));
                var prodTask = _prodService.GetProducts(0, 300, null, null, string.Format("CategoryId eq {0}", parts[1]));
                Task.WaitAll(catTask, prodTask);
                var cats = catTask.Result.ReadAsSync();
                var prods = prodTask.Result.ReadAsSync();
                resItems.AddRange(cats.Items.Select(x => x.Map<NavigationTreeNode>()));
                resItems.AddRange(prods.Items.Select(x =>
                                                         {
                                                             var node2 = x.Map<NavigationTreeNode>();
                                                             node2.Id = NavigationNode.JoinParts(node2.Id, parts[1]);
                                                             return node2;
                                                         }));
                ;

                foreach (var nn in navSet.Nodes.Where(x => x.ParentId == node))
                {
                    var tn = nn.Map<NavigationTreeNode>();
                    if (tn.Index.GetValueOrDefault(int.MaxValue) < resItems.Count)
                    {
                        resItems.Insert(tn.Index.Value, tn);
                    }
                    else
                    {
                        resItems.Add(tn);
                    }
                }
            }
            else
            {
                foreach (var nn in navSet.Nodes.Where(x => x.ParentId == node))
                {
                    var tn = nn.Map<NavigationTreeNode>();
                    resItems.Add(tn);
                }
            }

            return this.List<NavigationTreeNode>( resItems );
        }

        [WebGet(UriTemplate = "search/?query={query}")]
        public Task<Response<List<NavigationTreeNode>>> Search(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            if (!string.IsNullOrEmpty(extFilter.query))
                extFilter.Add(new FilterCollectionItem {value = extFilter.query});

            // TODO: currently using 'sw' (starts with), but we'll want to change to 'cont' (contains)
            var productFilter = GetSearchFilter(extFilter, "ProductCode cont \"{0}\" or Content.ProductName cont \"{0}\"");
            var categoryFilter = GetSearchFilter(extFilter, "Content.Name cont \"{0}\"");
            /*var request = new CmsListRequest
            {
                Filters = GetPagesFilter(extFilter, "Name sw \"{0}\""),
                Collection = "pages",
                StartIndex = 0,
                PageSize = 25,
            };*/

            var productSearch = _prodService.GetProducts(0, 25, null, null, productFilter).Result.ReadAsAsync();
            var categorySearch = _catClient.GetCategories(0, 25, null, categoryFilter, null ).Result.ReadAsAsync();
            //var pagesSearch = _cmsService.GetList(request).Result.ReadAsAsync();

            Task.WaitAll(productSearch, /*pagesSearch,*/ categorySearch);

            var results = categorySearch.Result.Items.Select(Mapper.Map<NavigationTreeNode>)
                .Concat(productSearch.Result.Items.Select(Mapper.Map<NavigationTreeNode>))
                //.Concat(pagesSearch.Result.Items.Select(Mapper.Map<NavigationTreeNode>))
                .ToList();

            return List(results);
        }

        [WebInvoke(UriTemplate = "delete")]
        public Task<Response<List<NavigationTreeNode>>> Delete(List<NavigationTreeNode> items)
        {
            NavigationSet  navSet = null;
            List<Task> tasks = new List<Task>();
            foreach (var item in items)
            {
                var parts = NavigationNode.SplitParts(item.Id);
                switch (parts[0])
                {
                    case "category":
                        {
                            tasks.Add(_catClient.DeleteCategoryById(int.Parse(parts[1]), true));
                            break;
                        }
                    case "product":
                        {
                            tasks.Add(_prodService.DeleteProduct(parts[1]));
                            break;
                        }
                    default:
                        {
                            if ( navSet == null )
                            {
                                navSet = _navRepo.GetSet();
                            }
                            int idx = navSet.Nodes.FindIndex  (x=> x.Id == item.Id );
                            if ( idx > -1)
                            {
                                navSet.Nodes.RemoveAt ( idx);
                            }
                            break;
                        }
                }
            }
            if (navSet != null)
            {
                _navRepo.SaveSet(navSet);
            }
            if (tasks.Count > 0)
            {
                Task.WaitAll(tasks.ToArray());
            }
            return SuccessWithTotal<List<NavigationTreeNode>>(0);
        }
        [WebInvoke(UriTemplate = "create")]
        public Task<Response<List<NavigationTreeNode>>> Create(List<NavigationTreeNode> items)
        {
            var navSet = _navRepo.GetSet();
            if (items.Any(x => x.Name == "reset"))
            {
                navSet = NavigationSet.Default;
                _navRepo.SaveSet(navSet);
                return this.List<NavigationTreeNode>(items);
            }
            foreach (var item in items)
            {

                item.Id = NavigationNode.JoinParts("link", Guid.NewGuid().ToString());
                navSet.Nodes.Add(item.Map<NavigationNode >());
            }
            _navRepo.SaveSet(navSet);
            return this.List<NavigationTreeNode>(items);
        }

        [WebInvoke(UriTemplate = "update")]
        public Task<Response<List<NavigationTreeNode>>> Edit(List<NavigationTreeNode> items)
        {
            
            var catNodes = items.Where(x => x.NodeType == "category").ToList();
            foreach (var navigationTreeNode in items)
            {
                if ( navigationTreeNode.ParentId == "root")
                {
                    throw new InvalidOperationException("parent id of " + navigationTreeNode.Name + " cannot be root");
                }
            }
            
            var prodNodes = items.Where(x => x.NodeType == "product").ToList();
            var pageNodes = items.Where(x => x.NodeType == "page" || x.NodeType == "link" || x.NodeType == "blog").ToList();
            //var blogNode = items.Where(x => x.NodeType == "blog").ToList();
            CategoryPagedCollection catCol = null;
            var navSet = _navRepo.GetSet();
            //tempfix can't track this down.
            foreach (var navigationTreeNode in navSet.Nodes)
            {
                if ( navigationTreeNode.ParentId =="root")
                {
                    navigationTreeNode.ParentId = NavigationNode.JoinParts("group", "nonLinked");
                }
            }
            var topCatNode = navSet.Nodes.Find(x => x.Id == NavigationNode.TopcatID);
            ProductCollection productCollection = null;
            var saveTasks = new List<Task>();
            foreach (var node in catNodes)
            {
                if (node.Index <= topCatNode.Index)
                {
                    topCatNode.Index = node.Index;
                }
            }
            foreach (var node in catNodes)
            {
                if (catCol == null)
                {
                    var catFilter = string.Join(" or ", catNodes.Select(_ => "CategoryId eq " + NavigationNode.SplitParts(_.Id)[1]));
                    catCol = _catClient.GetCategories(0, 100, null, catFilter, null).Result.ReadAsSync();
                }

                var catId = int.Parse(NavigationNode.SplitParts(node.Id)[1]);
                var cat = catCol.Items.First(x => x.Id == catId);


                if (NavigationNode.SplitParts(node.ParentId)[0] != "category")
                {
                    cat.ParentCategoryId = null;
                    cat.Sequence = node.Index + topCatNode.Index;
                }
                else
                {
                    var parentId = int.Parse(NavigationNode.SplitParts(node.ParentId)[1]);
                    ;
                    cat.ParentCategoryId = parentId;
                    cat.Sequence = node.Index;
                }

                saveTasks.Add(_catClient.UpdateCategory(cat, cat.Id, null));


            }
            foreach (var node in prodNodes)
            {
                if (productCollection == null)
                {
                    var prodFilter = string.Join(" or ", prodNodes.Select(_ => "ProductCode eq " + NavigationNode.SplitParts(_.Id)[1]));
                    productCollection = _prodService.GetProducts(0, 100, null, null, prodFilter).Result.ReadAsAsync().Result;

                }
                var prodCode = NavigationNode.SplitParts(node.Id)[1];
                var prod = productCollection.Items.FirstOrDefault(x => x.ProductCode == prodCode);

                int oldParentId = -1;
                if (node.IdParts.Length == 3 && int.TryParse(node.IdParts[2], out oldParentId))
                {
                   // prod.ProductInSites.First().ProductCategories = prod.ProductInSites.
                    prod.ProductInSites.First().ProductCategories = prod.ProductInSites.First().ProductCategories.Where(x => x.CategoryId != oldParentId).ToArray();
                    //prod.ProductCategories = prod.ProductCategories.Where(x => x.CategoryId != oldParentId).ToArray();
                }


                if (NavigationNode.SplitParts(node.ParentId)[0] == "category")
                {
                    prod.ProductInSites.First().ProductCategories = prod.ProductInSites.First().ProductCategories.Union(new ProductCategory[] { new ProductCategory() { CategoryId = int.Parse(NavigationNode.SplitParts(node.ParentId)[1]) } }).ToArray();


                }
                else
                {

                    //node.Id = NavigationNode.JoinParts("link", Guid.NewGuid().ToString());
                    node.NodeType = "link";
                    var linkNode = node.Map<NavigationNode>();
                    linkNode.Id = NavigationNode.JoinParts("link", Guid.NewGuid().ToString());

                    navSet.Nodes.Add(linkNode);

                }
                saveTasks.Add(_prodService.UpdateProduct(prod, prod.ProductCode));
            }

            if (saveTasks.Count > 0)
            {
                Task.WaitAll(saveTasks.ToArray());
            }
            if (pageNodes.Count > 0)
            {

                foreach (var node in pageNodes)
                {
                    var curNode = navSet.Nodes.FirstOrDefault(x => x.Id == node.Id);
                    if (curNode == null)
                    {
                        curNode = node.Map<NavigationNode>();
                        navSet.Nodes.Add(curNode);
                    }
                    else
                    {
                        AutoMapper.Mapper.Map<NavigationTreeNode, NavigationNode>(node, curNode);
                    }
                }
                navSet.Nodes.ForEach(x => x.Leaf = !navSet.Nodes.Any(y => y.ParentId == x.Id));

            }

            if (!navSet.Nodes.Any(x => x.Id == "topcat"))
            {
                navSet.Nodes.Add(new NavigationNode()
                                     {
                                         Id = "topcat",
                                         ParentId = NavigationNode.JoinParts("group", "nav")
                                     });
            }
            foreach ( var item in items )
            {
                var nsn = navSet.Nodes.FirstOrDefault(x => x.Id == item.Id);
                if ( nsn != null )
                {
                    nsn.Index = item.Index;
                }
            }
            //navSet.Nodes = navSet.Nodes.OrderBy(x => x.Index.GetValueOrDefault(1)).ToList();
            //for (int i = 0; i < navSet.Nodes.Count; i++)
            //{
            //    navSet.Nodes[i].Index = i;
            //}
            _navRepo.SaveSet(navSet);

            return this.List<NavigationTreeNode>(items);
        }



        private void ProcessRoot(System.Collections.Generic.List<NavigationTreeNode> resItems, UX.Models.Navigation.NavigationSet navSet)
        {
            var navId = NavigationNode.JoinParts("group", "nav");
            var unlinkedId = NavigationNode.JoinParts("group", "nonLinked");
            var topNodes = navSet.Nodes.Where(x => x.ParentId == navId ).ToList();


            var unLinkedNodes = navSet.Nodes.Where(x => x.ParentId == unlinkedId);
            var pageTasks = _cmsService.GetList(new CmsListRequest() { Collection = "pages", PageSize = 100 });

            var blogTasks = _cmsService.GetList(new CmsListRequest() { Collection = "blogs", PageSize = 1, DocumentType="blog" });



            var catTasks = _catClient.GetChildCategories(-1);
            Task.WaitAll(pageTasks, catTasks, blogTasks);


            var topCats = catTasks.Result.ReadAsAsync().Result;


            var pages = pageTasks.Result.ReadAsAsync().Result;
            pages.Items = pages.Items.Where(x => (string)x.Get("page_type") != "404").ToList();
            
            var blogs = blogTasks.Result.ReadAsAsync().Result.Items;


            IEnumerable<NavigationTreeNode> newUnAssignedPages = pages.Items.Where(x => !navSet.Nodes.Any(_ => _.IdParts.Length > 0 && (_.IdParts.Last() == x.Id) || _.IdParts.Last() ==  x.Name )).Select(x => x.Map<NavigationTreeNode>());

            var allUnassigend =  unLinkedNodes.Select(x => x.Map<NavigationTreeNode>()).Union(newUnAssignedPages);

            //todo fix blog not being expandable.
            if (blogs.Count > 0)
            {
                if ( !navSet.Nodes.Any ( _ => _.IdParts.Length > 0 && (_.IdParts.Last() == blogs[0].Id )))
                {
                    var blogNode = Mapper.Map<NavigationTreeNode>(blogs[0]);
                    blogNode.Url = "/blogs";
                    blogNode.NodeType = "blog";
                    blogNode.AllowDrop = false;
                    allUnassigend = allUnassigend.Union(new NavigationTreeNode[]{blogNode});
                }
            }



            var navNode = new NavigationTreeNode()
            {
                Name = "Navigation",
                Id = navId,
                NodeType = "group",
                Expanded = true,
                Expandable = false,
                Class = "taco-shit",
                AllowDrag = false,
                Items = new List<NavigationTreeNode>()
            };


            resItems.Add(navNode);
            bool addedCats = false;

            foreach (var nn in topNodes)
            {
                var parts = NavigationNode.SplitParts(nn.Id);

                switch (parts[0])
                {
                    case "topcat":
                        {
                            addedCats = true;
                            navNode.Items.AddRange(topCats.Items.Select(
                                x =>
                                    {
                                        var catNav = x.Map<NavigationTreeNode>();
                                        catNav.Index  = x.Sequence.GetValueOrDefault( 0) + nn.Index;
                                        return catNav;
                                    }));
                            break;
                        }

                    case "product":
                        {
                            var prod = _prodService.GetProduct(parts[1], null).Result.ReadAsSync();
                            if (prod != null)
                            {
                                navNode.Items.Add(prod.Map<NavigationTreeNode>());
                            }
                            break;
                        }
                    default:
                        {
                            var tn = nn.Map<NavigationTreeNode>();
                            navNode.Items.Add(tn);
                            break;
                        }
                }

            }
            if (!addedCats)
            {
                navNode.Items.AddRange(topCats.Items.Select(x => x.Map<NavigationTreeNode>()));
               
            }





            resItems.Add(new NavigationTreeNode()
            {
                Name = "Non-Linked Pages",
                NodeType = "group",
                Expanded = true,
                Expandable = false,
                Class = "taco-shit",
                AllowDrag = false,
                Id = unlinkedId,
                Items = allUnassigend.ToList()
            });


            resItems.Add(new NavigationTreeNode()
            {
                Name = "System Pages",
                NodeType = "group",
                Expanded = true,
                Expandable = false,
                Class = "taco-shit",
                AllowDrag = false,
                Id = NavigationNode.JoinParts("group", "sp"),
                Items = new List<NavigationTreeNode>(){
                        new NavigationTreeNode()
                        {
                            Id = NavigationNode.JoinParts ( "sp" , "cart"),
                            Name = "Cart",
                            NodeType = "systempage",
                            Leaf = true ,
                            AllowDrag = false ,
                            AllowDrop = false ,
                            Url="/cart"
                        },
                        new NavigationTreeNode()
                        {
                            Id = NavigationNode.JoinParts ( "sp" , "search"),
                            Name = "Search",
                            NodeType = "systempage",
                            Url="/search",
                            AllowDrag = false ,
                            AllowDrop = false ,
                            Leaf = true 
                        },
                        new NavigationTreeNode()
                        {
                            Id = NavigationNode.JoinParts ( "sp" , "404"),
                            Name = "404",
                            NodeType = "systempage",
                            Url="/404",
                            AllowDrag = false ,
                            AllowDrop = false ,
                            Leaf = true 
                        }
                    }
            });
        }

        private static string GetSearchFilter(IEnumerable<FilterCollectionItem> extFilter, string format)
        {
            return string.Join ( " or " ,  extFilter.Select(_ => string.Format(format, _.value)));
        }

        private static List<string> GetPagesFilter(IEnumerable<FilterCollectionItem> extFilter, string format)
        {
            return extFilter.Select(_ => string.Format(format, _.value)).ToList();
        }
    }
}