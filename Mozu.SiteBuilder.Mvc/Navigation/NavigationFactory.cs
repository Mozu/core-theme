// -----------------------------------------------------------------------
// <copyright file="NavigationFactory.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using Mozu.ProductRuntime.Contracts.Clients;

namespace Mozu.SiteBuilder.Mvc.Navigation
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Models.Navigation;
    using Mozu.ProductAdmin.Contracts.Clients;
    using Mozu.SiteBuilder.UX.Models;

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public class NavigationRuntimeFactory : ModelBase, Mozu.SiteBuilder.Mvc.Navigation.INavigationRuntimeFactory
    {
        Lazy<INavigationRepository> _navRepo;
        Lazy<ICatalogContext> _catContext;
        NavigationRuntimeNodeCollection _main;
        Lazy<ISiteBuilderContext> _sc;
        Lazy<IProductRuntimeWebApiClient> _prodService;
        List<NavigationRuntimeNode> _ns;

        public NavigationRuntimeFactory( 
            Lazy<INavigationRepository> navRepo,
        Lazy<ICatalogContext> catContext,
            Lazy<ISiteBuilderContext> sc,
            Lazy<IProductRuntimeWebApiClient> prodService)
        {
            _navRepo = navRepo;
            _catContext = catContext;
            _sc = sc;
            _prodService = prodService;
        }
        
        public NavigationRuntimeNodeCollection GetNavigation()
        {
            if (_main != null)
            {
                return _main;
            }
            //_catContext.RootCategories;
            _main = new NavigationRuntimeNodeCollection()
            {
                Primary = new List<NavigationRuntimeNode>(),
                Secondary = new List<NavigationRuntimeNode>()
            };
          
            
            var allCatRuntimeNavNodes = _catContext.Value.AllCategories.Select(x => x.Map<NavigationRuntimeNode>()).ToList();
            allCatRuntimeNavNodes.ForEach(x => x.Items = allCatRuntimeNavNodes.Where (_ => _.ParentId == x.Id).ToList());
            var rootParentId = JoinParts ( "category",0);
            var navId = JoinParts("group", "nav");

            var rootCatNodes = allCatRuntimeNavNodes.Where(x => x.ParentId == rootParentId).ToList();
            var topNodes = NavSet.Where(x => x.ParentId == navId).ToList();
            var topCatNode = topNodes.Find(x => x.Id == "topcat");
            rootCatNodes.ForEach(x => x.Index = x.Index.GetValueOrDefault(0) + (topCatNode == null ? 0 : topCatNode.Index.GetValueOrDefault(0)));
            
            
            bool addedCats = false;
            foreach (var nn in topNodes)
            {
                var parts = SplitParts(nn.Id);

                switch (parts[0])
                {
                    case "topcat":
                        {
                            addedCats = true;
                            //rootCatNodes.ForEach( x=> x.Index )

                            _main.Primary.AddRange(rootCatNodes);
                            break;
                        }

                    case "product":
                        {
                            var prod = _prodService.Value.GetProduct(parts[1], null, null, false ).Result.ReadAsSync();
                            if (prod != null)
                            {
                                var nnn = prod.Map<NavigationRuntimeNode>();
                                nnn.Index = nn.Index;
                                _main.Primary.Add(nnn);
                            }
                            break;
                        }
                    default:
                        {

                            _main.Primary.Add(nn);
                            break;
                        }
                }

            }
            if (!addedCats)
            {
                _main.Primary.AddRange(rootCatNodes);
            }

            
            foreach ( var contentNode in NavSet.Where(x => x.ParentId != null && x.ParentId.StartsWith( "cat")))
            {
                var cat = allCatRuntimeNavNodes.FirstOrDefault(x => x.Id == contentNode.ParentId);
                if (cat != null)
                {
                    cat.Items.Add(contentNode);
                }
            }
            _main.Primary.Sort(NavigationRuntimeNode.Comparer.Default);

            string subNavId = "xxx";
            if (_sc.Value.PageContext.CategoryId != null)
            {
                subNavId = JoinParts("category", _sc.Value.PageContext.CategoryId);
                _main.Secondary.AddRange(allCatRuntimeNavNodes.Where(x => x.ParentId == subNavId));
            }
            else if (_sc.Value.PageContext.DocumentId != null)
            {
                subNavId = JoinParts("pages", _sc.Value.PageContext.CollectionId, _sc.Value.PageContext.DocumentId);
            }
            foreach (var nl in this.NavSet.Where(x => x.ParentId == subNavId))
            {
                //todo... could be a product?
                var rn = nl.Map<NavigationRuntimeNode>();
                if (nl.Index.GetValueOrDefault(int.MaxValue) < _main.Secondary.Count)
                {
                    _main.Secondary.Insert(nl.Index.Value, rn);
                }
                else
                {
                    _main.Secondary.Add(rn);
                }
            }

            _main.Primary.Sort(NavigationRuntimeNode.Comparer.Default);
            _main.Secondary .Sort(NavigationRuntimeNode.Comparer.Default);
            //todo sort
            return _main;
        }
        List<NavigationRuntimeNode> NavSet
        {
            get
            {
                if (_ns == null)
                {
                    _ns = _navRepo.Value.GetSet().Result.Nodes.Map<List<NavigationRuntimeNode>>();
                    _ns.ForEach(x => x.Items = _ns.Where(child => child.ParentId == x.Id).ToList());

                }
                return _ns;
            }
        }
        const string _STRINGSPLITDELIM = "^^";
        static string JoinParts(params object[] parts)
        {
            return string.Join(_STRINGSPLITDELIM, parts);
        }
        static string[] SplitParts(string str)
        {
            return str.Split(new string[] { _STRINGSPLITDELIM }, StringSplitOptions.None);
        }


        public List<NavigationRuntimeNode> Primary
        {
            get
            {
                return this.GetNavigation().Primary ;
            }
        }

        public List<NavigationRuntimeNode> Secondary
        {
            get
            {
                return this.GetNavigation().Secondary;
            }
        }
    }
}
