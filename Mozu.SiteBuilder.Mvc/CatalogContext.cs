// -----------------------------------------------------------------------
// <copyright file="CatalogContext.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using AutoMapper;
using Mozu.Cart.Contracts;
using Mozu.Cart.Contracts.Clients;
using Mozu.ProductAdmin.Contracts;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.UX.Models.StoreFront.Cart;
using Category = Mozu.ProductAdmin.Contracts.Category;

namespace Mozu.SiteBuilder.Mvc
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
    using Autofac;
    using Mozu.ProductAdmin.Contracts.Clients;
    using Mozu.SiteBuilder.UX.Models;

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public class CatalogContext : ModelBase, ICatalogContext
    {
        private readonly ICartWebApiClient _cartWebApiClient;
        private readonly IProductCategoryRuntimeWebApiClient _productCategoryRuntimeWebApiClient;
        List<Category> _cats;
        List<Category> _categoryTree;
      //  List<Category> _rootCats;
        
        public CatalogContext (ICartWebApiClient cartWebApiClient, IProductCategoryRuntimeWebApiClient productCategoryRuntimeWebApiClient)
        {
            _cartWebApiClient = cartWebApiClient;
            _productCategoryRuntimeWebApiClient = productCategoryRuntimeWebApiClient;
        }

        public List<Category> AllCategories
        {
            get
            {
                if (_cats == null)
                {
                    _cats = new List<Category>();

                    var srvTree = _productCategoryRuntimeWebApiClient.GetCategoryTree().Result.ReadAsSync();
                    // var srvTree = new CategoryCollection() { Items = new List<ProductRuntime.Contracts.Category>() };

                    var treeStack =
                        new Stack<Tuple<Mozu.ProductRuntime.Contracts.Category, List<Mozu.ProductRuntime.Contracts.Category>>>(
                            srvTree.Items.Select(x =>
                                new Tuple<Mozu.ProductRuntime.Contracts.Category, List<Mozu.ProductRuntime.Contracts.Category>>
                                    (x, srvTree.Items)));

                    while (treeStack.Count() > 0)
                    {
                        var catPair = treeStack.Pop();
                        var cat = Mapper.Map<Category>(catPair.Item1);
                        cat.Index = catPair.Item2.IndexOf(catPair.Item1);
                        _cats.Add(cat);


                        if (catPair.Item1.ChildrenCategories != null)
                        {
                            catPair.Item1.ChildrenCategories.ForEach(
                                x =>
                                treeStack.Push(
                                    new Tuple<Mozu.ProductRuntime.Contracts.Category, List<Mozu.ProductRuntime.Contracts.Category>>(x, catPair.Item1.ChildrenCategories)))
                            ;
                        }

                    }


                    //  _cats = AutoMapper.Mapper.Map<List<Category>>(client.GetCategories(null,  0, int.MaxValue, null).Result.ReadAsSync().Items);
                    _cats.ForEach(x => x.ChildrenCategories = _cats.Where(_ => _.ParentCategoryId == null).ToList());

                }
                return _cats;
            }
   
        }


        [AlternateName("RootCategories")]
        public List<Category> CategoryTree
        {
            get
            {
                if (_categoryTree == null)
                {
                    _categoryTree = AllCategories.Where(x => x.ParentCategoryId.GetValueOrDefault(-1) < 1).ToList();

                }
                return _categoryTree;
            }
        }

        private CartAbstract _cartAbstract;
        public CartAbstract CartAbstract
        {
            get
            {
               if ( _cartAbstract== null )
               {
                   var ca = _cartWebApiClient.GetCartSummary().Result.ReadAsSync();
                   _cartAbstract = new CartAbstract()
                                       {
                                           Exists = ca.HasActiveCart,
                                           ItemCount = ca.ItemCount,
                                           Total = ca.Total.GetValueOrDefault(0) 
                                       };
                   // var ca = null;
               }

                return _cartAbstract;
            }
        }
    }

    public interface ICatalogContext
    {
        
        List<Category> AllCategories { get; }
        List<Category> CategoryTree { get; }
        CartAbstract CartAbstract { get; }
    

    }
    
    public interface ISearchContext
    {
        string Query { get; set; }
        int CategoryId { get; set; }

    }
    public class SearchContext : ModelBase, ISearchContext 
    {
        string _query;
        int _catId;
        bool _init;
        Lazy<System.Web.HttpContextBase> _ctx;
       
        public SearchContext ( Lazy<System.Web.HttpContextBase> ctx )
        {
            _ctx = ctx;
     
        }
       
        void Init ()
        {
            if ( !_init )
                return;
            _init = true;

            var ctx = _ctx.Value;
            Query = ctx.Request["query"];
            int catId;
            if (int.TryParse(ctx.Request["categoryId"], out catId))
            {
                CategoryId = catId;
            }
            else
            {
                CategoryId = -1;
            }
        }
        public string Query
        {
            get
            {
                Init();
                return _query;
            }
            set
            {
                _query = value;
            }
        }
        public int CategoryId
        {
            get
            {
                Init();
                return _catId;
            }
            set
            {
                _catId = value;
            }
        }
    }
}
