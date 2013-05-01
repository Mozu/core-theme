using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;

namespace Mozu.SiteBuilder.Mvc.Catalog
{
    /// <summary>
    /// Provides the runtime Catalog Tree to SiteContext.
    /// </summary>
    public class RuntimeCategoryTreeProvider : ICategoryTreeProvider
    {
        private IProductCategoryRuntimeWebApiClient _productCategoryRuntimeWebApiClient;
        private List<Category> _categories;

        public RuntimeCategoryTreeProvider(IProductCategoryRuntimeWebApiClient productCategoryRuntimeWebApiClient)
        {
            _productCategoryRuntimeWebApiClient = productCategoryRuntimeWebApiClient;
        }

        public Task<List<Category>> GetAllCategories()
        {
            if (_categories != null)
                return Task.Run<List<Category>>(() => _categories);

            lock (this)
            {
                if (_categories != null)
                    return Task.Run<List<Category>>(() => _categories);

                var categories = new List<Category>();

                return _productCategoryRuntimeWebApiClient.GetCategoryTree()
                    .ContinueWith(t =>
                    {
                        var srvTree = t.Result.ReadAsSync();
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
                            categories.Add(cat);


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
                        categories.ForEach(x => x.ChildrenCategories = Mapper.Map<List<Mozu.ProductRuntime.Contracts.Category> >(categories.Where(_ => _.ParentCategoryId == null).ToList()) );

                        _categories = categories;
                        return categories;
                    });
            }
        }
    }
}
