using System;
using System.Collections.Generic;
using System.Linq;
using NSubstitute;
using NUnit.Framework;
using Should;
using Mozu.Content.Contracts;
using Mozu.ProductAdmin.Contracts;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.UX.Admin.Api;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Navigation;
using MozuCategory = Mozu.ProductAdmin.Contracts.Category;

namespace Mozu.SiteBuilder.IntegrationTests.Admin.Api
{
    [TestFixture]
    public class NavigationControllerTests
    {
        private ISiteBuilderContext _siteBuilderContext;
        private ICategoryWebApiClient _categoryWebApiClient;
        private ICmsServiceWrapper _cmsServiceWrapper;
        private IProductWebApiClient _productWebApiClient;
        private INavigationRepository _navigationRepository;

        [SetUp]
        public void SetUp()
        {
            _siteBuilderContext = Substitute.For<ISiteBuilderContext>();
            _categoryWebApiClient = Substitute.For<ICategoryWebApiClient>();
            _cmsServiceWrapper = Substitute.For<ICmsServiceWrapper>();
            _productWebApiClient = Substitute.For<IProductWebApiClient>();
            _navigationRepository = Substitute.For<INavigationRepository>();
        }

        [Test]
        public void Search_should_combine_results_from_products_and_categories()
        {
            var products = new ProductCollection
            {
                Items = new List<Product>
                {
                    new Product { ProductCode = "ABC" },
                    new Product { ProductCode = "XYZ" },
                    new Product { ProductCode = "One" },
                    new Product { ProductCode = "Two" },
                    new Product { ProductCode = "Six" },
                }
            };
            var categories = new CategoryPagedCollection
            {
                Items = new List<Category>
                {
                    new MozuCategory { Id = 123 },
                    new MozuCategory { Id = 987 },
                }
            };
            _productWebApiClient.WithAny(x => x.GetProducts(null, null, null, null, null), products);
            _categoryWebApiClient.WithAny(x => x.GetCategories(null, null, null, null, null), categories);

            var api = GetApi();

            var results = api.Search(new PagingParamaters(), new FilterCollection()).Result;

            results.Items.ShouldNotBeEmpty();
            results.Items.Count.ShouldEqual(products.Items.Count + categories.Items.Count);
            results.Items.Count(x => x.NodeType == "category").ShouldEqual(categories.Items.Count);
            results.Items.Count(x => x.NodeType == "product").ShouldEqual(products.Items.Count);
        }

        [Test]
        public void Delete_should_determine_how_to_delete_a_product_based_on_id()
        {
            var id = "product^^something";
            var nodes = new List<NavigationTreeNode> { new NavigationTreeNode { Id = id } };
            _productWebApiClient.With(x => x.DeleteProduct("something"), TestResponse.Void);

            var api = GetApi();

            api.Delete(nodes);

            _productWebApiClient.Received(1).DeleteProduct("something");
            _categoryWebApiClient.DidNotReceive().DeleteCategoryById(Arg.Any<int?>(), Arg.Any<bool?>());
        }

        [Test]
        public void Delete_should_determine_how_to_delete_a_category_based_on_id()
        {
            var id = "category^^123456";
            var nodes = new List<NavigationTreeNode> { new NavigationTreeNode { Id = id } };
            _categoryWebApiClient.With(x => x.DeleteCategoryById(123456, true), TestResponse.Void);

            var api = GetApi();

            api.Delete(nodes);

            _categoryWebApiClient.Received(1).DeleteCategoryById(123456, true);
            _productWebApiClient.DidNotReceive().DeleteProduct(Arg.Any<string>());
        }

        [Test]
        public void Create_should_save_Default_NavigationSet_if_any_items_are_named_reset()
        {
            var nodes = new List<NavigationTreeNode> { new NavigationTreeNode { Name = "reset" } };
            var api = GetApi();
            //_navigationRepository.With(x => x.GetSet(), null);

            api.Create(nodes);

            _navigationRepository.Received(1).SaveSet(NavigationSet.Default);
        }

        [Test]
        public void Create_should_save_all_NavigationTreeNodes_as_links()
        {
            var nodeNames = new[] { "diet", "coke", "pepsi", "water" };
            var nodes = nodeNames.Select(x => new NavigationTreeNode { Name = x }).ToList();
            _navigationRepository.GetSet().Returns(new NavigationSet());
            var api = GetApi();

            var result = api.Create(nodes);

            _navigationRepository.Received(1).SaveSet(Arg.Is<NavigationSet>(set => set.Nodes.All(node => nodeNames.Contains(node.Name))));
            result.Items.Select(x => x.Name).ShouldEqual(nodeNames);
            result.Items.ForEach(x => x.Id.ShouldStartWith("link"));
        }

        [Test]
        public void Read_without_id_should_return_root_NavigationSet()
        {
            _navigationRepository.GetSet().Returns(new NavigationSet());
            _categoryWebApiClient.WithAny(x => x.GetChildCategories(null), new CategoryCollection { Items = new List<Category> { new Category { ParentCategoryId = 12 } } });

            WithCmsList("pages", new Document { Id = "home" }, new Document { Id = "contact" }, new Document { Id = "404" });
            WithCmsList("blogs", new Document { Id = "blogger" }, new Document { Id = "hello-world" });

            var api = GetApi();

            var response = api.Read(null).Result;

            response.ShouldNotBeNull();
            response.Items.Select(x => x.Name).ShouldEqual(new[]{ "Navigation", "Non-Linked Pages", "System Pages" });
            response.Items.Select(x => x.Id).ShouldEqual(new[]{ "group^^nav", "group^^nonLinked", "group^^sp" });
            response.Items.All(x => x.Expanded).ShouldBeTrue();
            response.Items.Any(x => x.AllowDrag).ShouldBeFalse();
            response.Items.All(x => x.AllowDrop).ShouldBeTrue();
            response.Items.Any(x => x.Leaf).ShouldBeFalse();
        }

        [Test]
        public void Read_with_folder_id_should_return_pages_with_expected_properties()
        {
            var id = "folder^^things^^123";
            _navigationRepository.GetSet().Returns(new NavigationSet());
            var pages = new List<Document>
                {
                    new Document { DocumentListName  = "scauses", Id = Guid.NewGuid().ToString("n"), Name = "Dropbox", Properties = new List<PropertyValue>() },
                    new Document { DocumentListName = "scauses", Id = Guid.NewGuid().ToString("n"), Name = "Drive", Properties = new List<PropertyValue>() },
                };
            _cmsServiceWrapper.WithAny(x => x.GetList(null), new PagedCollection<Document> { Items = pages });

            var api = GetApi();

            var response = api.Read(id).Result;

            response.Items.ShouldNotBeEmpty();
            response.Items.All(x => x.Leaf).ShouldBeTrue();
            response.Items.All(x => x.AllowDrag).ShouldBeFalse();
            response.Items.All(x => x.AllowDrop).ShouldBeFalse();
            response.Items.All(x => x.NodeType == "page").ShouldBeTrue();

            for (var i = 0; i < response.Items.Count; i++)
            {
                var item = response.Items[i];
                item.Url.ShouldContain(pages[i].DocumentListName);
                item.Url.ShouldContain(pages[i].Name);
            }
        }

        /// <summary>
        /// TODO: Refactor this method... This test is a beast :\
        /// </summary>
        /// <param name="nodeType"></param>
        [Ignore("until this method gets refactored, there's really not much worth testing for all the code that will be needed to set it up...")]
        [TestCase("product")]
        [TestCase("category")]
        [TestCase("page")]
        [TestCase("link")]
        [TestCase("blog")]
        public void Edit(string nodeType)
        {
            var nodeNames = new[] { "diet", "coke", "pepsi", "water" };
            var nodes = nodeNames.Select((x, i) => new NavigationTreeNode
                {
                    Name = x,
                    NodeType = nodeType,
                    Id = NavigationNode.JoinParts(nodeType, "blah"),
                    ParentId = i.ToString(),
                }).ToList();
            var products = new ProductCollection { Items = nodes.Select(x => new Product { ProductCode = NavigationNode.SplitParts(x.Id)[1] }).ToList() };

            _navigationRepository.GetSet().Returns(new NavigationSet());
            _productWebApiClient.WithAny(x => x.GetProducts(null, null, null, null, null), products);
            _productWebApiClient.WithAny(x => x.UpdateProduct(null, null), new Product());

            var api = GetApi();

            api.Edit(nodes);
        }

        public void WithCmsList(string collectionKey, params Document[] documents)
        {
            foreach (var d in documents) d.Properties = d.Properties ?? new List<PropertyValue>();

            var docs = new[] { new PagedCollection<Document> { Items = documents.ToList() } };
            _cmsServiceWrapper.With(x => x.GetList(Arg.Is<CmsListRequest>(c => c.Collection == collectionKey)), docs);
        }

        private NavigationController GetApi()
        {
            return new NavigationController(_siteBuilderContext, _categoryWebApiClient, _cmsServiceWrapper, _productWebApiClient, _navigationRepository);
        }
    }
}