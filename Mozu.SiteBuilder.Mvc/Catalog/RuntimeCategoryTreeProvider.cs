using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.Core.Api.Client;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using Mozu.Core.Logging;

namespace Mozu.SiteBuilder.Mvc.Catalog
{
    /// <summary>
    /// Provides the runtime Catalog Tree to SiteContext.
    /// </summary>
    public class RuntimeCategoryTreeProvider : ICategoryTreeProvider
    {
        private IProductCategoryRuntimeWebApiClient _productCategoryRuntimeWebApiClient;
        private CategoryTree _categories;
        private ILogger _logger;

        public RuntimeCategoryTreeProvider(IProductCategoryRuntimeWebApiClient productCategoryRuntimeWebApiClient, ILogger logger)
        {
            _productCategoryRuntimeWebApiClient = productCategoryRuntimeWebApiClient.CloneWithoutUserClaims();
            _logger = logger;
        }

        public Task<CategoryTree> GetAllCategories()
        {
            if (_categories != null)
            {
                var t = new TaskCompletionSource<CategoryTree>();
                t.SetResult(_categories);
            }
            lock (this)
            {
                if (_categories != null)
                {
                    var t = new TaskCompletionSource<CategoryTree>();
                    t.SetResult(_categories);
                }
                var categories = new List<Category>();

                return _productCategoryRuntimeWebApiClient.GetCategoryTree()
                    .ContinueWith(t =>
                    {
                        var res = t.Result;
                        var etag = res.ETag();
                        var srvTree = res.ReadAsSync();
                        // var srvTree = new CategoryCollection() { Items = new List<ProductRuntime.Contracts.Category>() };

                        var treeStack =
                            new Stack<Tuple<Mozu.ProductRuntime.Contracts.Category, List<Mozu.ProductRuntime.Contracts.Category>>>(
                                srvTree.Items.Select(x =>
                                    new Tuple<Mozu.ProductRuntime.Contracts.Category, List<Mozu.ProductRuntime.Contracts.Category>>
                                        (x, srvTree.Items)));

                        while (treeStack.Count() > 0)
                        {
                            var catPair = treeStack.Pop();
                            if (catPair.Item1 == null)
                            {
                                _logger.Error("Unexpected null returned from productCategoryRuntimeWebApiClient.GetCategoryTree().");
                                continue;
                            }
                            var cat = Mapper.Map<Category>(catPair.Item1);
                         //   cat.Index = catPair.Item2.IndexOf(catPair.Item1);
                            categories.Add(cat);
                            cat.ReadOnly = true;

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
                      //  categories.ForEach(x => x.ChildrenCategories = (categories.Where(_ => _.ParentCategoryId == null).ToList()) );

                        _categories = new CategoryTree { Items = categories, ETag = etag };
                        return _categories;
                    });
            }
        }
    }
}
