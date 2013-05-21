using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Mozu.Content.Contracts;
using Mozu.Core.Logging;
using Mozu.ProductAdmin.Contracts;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.UX.Admin.Api;
using Mozu.SiteBuilder.UX.Admin.Navigation;
using Mozu.SiteBuilder.UX.Models.Navigation;
using NSubstitute;
using NUnit.Framework;

namespace Mozu.SiteBuilder.IntegrationTests.Admin.Api
{
    [TestFixture]
    public class NavigationControllerTests
    {
        private ISiteBuilderContext _siteBuilderContext;
        private ICategoryWebApiClient _categoryWebApiClient;
        private ICmsServiceWrapper _cmsServiceWrapper;
        private INavigationRepository _navigationRepository;
        private ILogger _logger;

        private NavigationSet _mockNavigation {
            get {
                return new NavigationSet
                {
                    Nodes = new List<NavigationNode> {
                        new NavigationNode {
                            Id = "page^^pages^^b54c5602-5a14-07e8-c88b-8ac300007629",
                            Index = 2,
                            IsLeaf = false,
                            Name = "Foodoc",
                            NodeType = "page",
                            ParentId = NavigationController.NAV_ROOT_NODE_NAME,
                            Url = "/pages/foodoc"
                        }
                    }
                };
            }
        }

        private CategoryPagedCollection _mockCategories { 
            get { 
                return new CategoryPagedCollection
                {
                    Items = new List<Category>
                    {
                        new Category {
                            Id = 1,
                            Sequence = 0,
                            ParentCategoryId = null,
                            Content = new CategoryLocalizedContent {
                                LocaleCode = "en-US",
                                Name = "cat foo"
                            }
                        },
                        new Category {
                            Id = 2,
                            Sequence = 1,
                            ParentCategoryId = null,
                            Content = new CategoryLocalizedContent {
                                LocaleCode = "en-US",
                                Name = "cat bar"
                            }
                        },
                        new Category {
                            Id = 3,
                            Sequence = 0,
                            ParentCategoryId = 1,
                            Content = new CategoryLocalizedContent {
                                LocaleCode = "en-US",
                                Name = "Cat foo sub"
                            }
                        }
                    }
                };
            }
        }

        private PagedCollection<Document> _mockPages { 
            get { 
                return new PagedCollection<Document>
                {
                    Items = new List<Document> {
                        new Document {
                            DocumentListName = "pages",
                            DocumentType = "web_page",
                            Name = "Foodoc",
                            Id = "b54c5602-5a14-07e8-c88b-8ac300007629",
                            Properties = new List<PropertyValue> {
                                new PropertyValue {
                                    PropertyType = "title",
                                    Value = "Foodoc"
                                }
                            }
                        }
                    }
                };
            }
        }

        private PagedCollection<Document> _mockEmptyDocumentList {
            get { 
                return new PagedCollection<Document>
                {
                    Items = new List<Document>(),
                    TotalCount = 0
                };
            }
        }

        [SetUp]
        public void SetUp()
        {
            _siteBuilderContext = Substitute.For<ISiteBuilderContext>();
            _logger = Substitute.For<ILogger>();
        }

        [Test]
        public void List_should_return_expected()
        {
            var controller = GetApi();
            List<NavigationTreeNode> res = controller.List().Result.Items;

            // there should be an items for each category and page.
            foreach (var cat in _mockCategories.Items)
            {
                Assert.That(res.Any(n => n.Name == cat.Content.Name), "Expected to find " + cat.Content.Name);
            }
            foreach (var page in _mockPages.Items)
            {
                Assert.That(res.Any(n => n.Name == page.Name), "Expected to find " + page.Name);
            }

            // the page that we added (Foodoc) should belong to the root and be indexed accordingly.
            NavigationNode foodocMock = _mockNavigation.Nodes.First(n => n.Name == "Foodoc");
            NavigationTreeNode foodocResult = res.First(n => n.Name == "Foodoc");

            // the Foodoc should not exist more than once.
            Assert.AreEqual(1, res.Where(n => n.Id == foodocMock.Id).Count());

            Assert.AreEqual(foodocMock.ParentId, foodocResult.ParentId);
            Assert.AreEqual(foodocMock.Index, foodocResult.Index);
        }

        [Test]
        public void List_should_have_non_linked_pages_at_bottom()
        {
            var controller = GetApi();
            List<NavigationTreeNode> res = controller.List().Result.Items;

            var unlinkedNode = res.First(i => i.Id == NavigationController.UNLINKED_PAGES_NODE_ID);
            Assert.False(res.Where(n => n.ParentId == unlinkedNode.ParentId && n.Id != unlinkedNode.Id).Any(n => n.Index >= unlinkedNode.Index), "No sibling nodes of UNLINKED_PAGES_NODE should have a higher index.");
        }

        [Test]
        public void List_should_ignore_deleted_pages()
        {
            NavigationSet navSetWithADeletedPage = new NavigationSet
            {
                Nodes = new List<NavigationNode> {
                    new NavigationNode {
                        Id = "page^^pages^^deleteme",
                        Index = 2,
                        IsLeaf = false,
                        Name = "Deleteme",
                        NodeType = "page",
                        ParentId = NavigationController.NAV_ROOT_NODE_NAME,
                        Url = "/pages/deleteme"
                    }
                }
            };

            var controller = GetApi(navigationSet: navSetWithADeletedPage);

            List<NavigationTreeNode> res = controller.List().Result.Items;

            // there should be 3 items: 2 categories and 1 page.
            Assert.IsFalse(res.Any(n => n.Name == "Deleteme"));
        }

        [Test]
        public void List_should_not_return_two_items_with_the_same_index()
        {
            var aMockCategory = _mockCategories.Items.First(c => c.ParentCategoryId != null);
            var aMockPage = _mockPages.Items.First();

            var pageNavigationNode = aMockPage.Map<NavigationNode>();

            // make the navigation parent id and index of this page identical to the category
            pageNavigationNode.Index = aMockCategory.Sequence.GetValueOrDefault(0);
            pageNavigationNode.ParentId = "category^^" + aMockCategory.ParentCategoryId;

            var mockNavigationSet = new NavigationSet
            {
                Nodes = new List<NavigationNode> {
                    pageNavigationNode
                }
            };

            var controller = GetApi(navigationSet: mockNavigationSet);
            List<NavigationTreeNode> res = controller.List().Result.Items;

            var resPage = res.First(n => n.Id == pageNavigationNode.Id);
            var resCat = res.First(n => n.Id == "category^^" + aMockCategory.Id);

            Assert.AreEqual(resPage.ParentId, resCat.ParentId);

            // the page should appear in the list before the category
            Assert.Less(resPage.Index, resCat.Index, "the page should appear in the list before the category");
        }

        [Test]
        public void Edit_reorder_a_page_should_work()
        {
            var controller = GetApi();
            var items = controller.List().Result.Items;

            var page = items.Last(i => i.NodeType.IsPage);
            var oldIndex = page.Index;
            var newIndex = oldIndex - 1;

            page.Index = newIndex;
            page.EditAction = "move";

            var res = controller.Edit(new List<NavigationTreeNode> { page }).Result;

            _navigationRepository
                .Received()
                .SaveSetAsync(Arg.Is<NavigationSet>(ns => ns.Nodes.Any(n => n.Id == page.Id && n.Index == newIndex)));
        }

        [Test]
        public void Edit_reorder_categories_should_work()
        {
            var controller = GetApi();
            var items = controller.List().Result.Items;

            var cat = items.Last(i => i.NodeType.IsCategory);
            var oldIndex = cat.Index;
            var newIndex = oldIndex - 1;

            cat.Index = newIndex;
            cat.EditAction = "move";

            var res = controller.Edit(new List<NavigationTreeNode> { cat }).Result;

            int realCatId = Convert.ToInt32(cat.OriginalId);

            _categoryWebApiClient
                .Received()
                // .UpdateCategory(Arg.Any<Category>(), Arg.Is<int?>(cat.Index), Arg.Any<bool?>());
                .UpdateCategory(Arg.Any<Category>(), Arg.Is<int?>(realCatId), Arg.Any<bool?>());
        }

        [Test]
        public void Edit_move_page_under_category_should_work()
        {
            var controller = GetApi();
            var items = controller.List().Result.Items;

            var page = items.First(i => i.NodeType.IsPage);
            var oldParentId = page.ParentId;
            var newParent = items.First(i => i.NodeType.IsCategory && i.Id != oldParentId);

            page.ParentId = newParent.Id;
            page.Index = 0;
            page.EditAction = "move";

            var res = controller.Edit(new List<NavigationTreeNode> { page }).Result.Items;

            _navigationRepository
                .Received()
                .SaveSetAsync(Arg.Is<NavigationSet>(arg => arg.Nodes.First(n => n.Id == page.Id).ParentId == newParent.Id));
        }

        [Test]
        public void Edit_move_category_to_child_of_another_category_should_work()
        {
            var controller = GetApi();
            var items = controller.List().Result.Items;

            var cat = items.First(i => i.NodeType.IsCategory);
            var oldParent = cat.ParentId;
            var newParent = items.First(i => i.NodeType.IsCategory && i.Id != oldParent && i.Id != cat.Id);

            cat.ParentId = newParent.Id;
            cat.Index = 0;
            cat.EditAction = "move";

            int catId = Convert.ToInt32(cat.OriginalId);

            var res = controller.Edit(new List<NavigationTreeNode> { cat }).Result;

            _categoryWebApiClient
                .Received()
                .UpdateCategory(Arg.Is<Category>(c => c.ParentCategoryId == Convert.ToInt32(newParent.OriginalId)), Arg.Is<int?>(catId), Arg.Any<bool?>());
        }

        [Test]
        public void Edit_rename_page_should_work()
        {
            var controller = GetApi();
            var items = controller.List().Result.Items;

            var page = items.First(i => i.NodeType.IsPage);
            string newName = page.Name = page.Name + "_newhotness";
            page.EditAction = "rename";

            var res = controller.Edit(new List<NavigationTreeNode> { page }).Result;

            _cmsServiceWrapper
                .Received()
                .Update2(Arg.Is<Document>(arg => newName == arg.Get<string>("link_title")));
        }

        [Test]
        public void Edit_rename_category_should_work()
        {
            var controller = GetApi();
            var items = controller.List().Result.Items;

            var cat = items.First(i => i.NodeType.IsCategory);

            var newName = cat.Name = cat.Name + "_newcatness";
            cat.EditAction = "rename";

            int catId = Convert.ToInt32(cat.OriginalId);

            var res = controller.Edit(new List<NavigationTreeNode> { cat }).Result;
            
            _categoryWebApiClient
                .Received()
                .UpdateCategory(Arg.Is<Category>(c => c.Id == catId && c.Content.Name == newName), Arg.Is<int?>(catId), Arg.Any<bool?>());
        }

        /// <summary>
        /// Gets a new NavigationController for testing.
        /// </summary>
        private NavigationController GetApi(NavigationSet navigationSet = null, CategoryPagedCollection categories = null, PagedCollection<Document> pages = null)
        {
            if (navigationSet == null)
                navigationSet = _mockNavigation;
            if (categories == null)
                categories = _mockCategories;
            if (pages == null)
                pages = _mockPages;

            _categoryWebApiClient = Substitute.For<ICategoryWebApiClient>();
            _cmsServiceWrapper = Substitute.For<ICmsServiceWrapper>();
            _navigationRepository = Substitute.For<INavigationRepository>();

            // set up navigation repo mock.
            _navigationRepository.GetSetAsync().Returns(
                args => Task.Run<NavigationSet>(() => navigationSet)
            );

            // set up category client mock.
            _categoryWebApiClient.GetCategories().Returns(
                args => new TestResponse<CategoryPagedCollection>(categories).Task
            );

            _categoryWebApiClient.GetCategory(Arg.Any<int?>(), Arg.Any<Core.Api.Contracts.TargetContextLevelType>()).Returns(
                args =>
                {
                    int? catId = args.Arg<int?>();
                    return new TestResponse<Category>(categories.Items.FirstOrDefault(c => c.Id == catId)).Task;
                }
            );

            // set up pages client mock.
            _cmsServiceWrapper.GetList2(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<int?>(), Arg.Any<int?>()).Returns(
                args =>
                {
                    string collection = (string)args[0];
                    if (collection == "pages")
                        return new TestResponse<PagedCollection<Document>>(pages).Task;
                    else
                        return new TestResponse<PagedCollection<Document>>(_mockEmptyDocumentList).Task;
                }
            );

            _cmsServiceWrapper.GetByPath2(Arg.Any<string>(), Arg.Any<string>()).Returns(
                args =>
                {
                    string collection = (string)args[0];
                    string docName = (string)args[1];

                    Document doc = pages.Items.FirstOrDefault(p => p.DocumentListName == collection && p.Name == docName);
                    return new TestResponse<Document>(doc).Task;
                });

            _cmsServiceWrapper.Get2(Arg.Any<string>(), Arg.Any<string>()).Returns(
                args =>
                {
                    string collection = (string)args[0];
                    string docId = (string)args[1];

                    Document doc = pages.Items.FirstOrDefault(p => p.DocumentListName == collection && p.Id == docId);
                    return new TestResponse<Document>(doc).Task;
                });

            // TODO: broke the isolation
            var adminCategoryProvider = new CategoryNavigationProvider(_categoryWebApiClient);
            var gandalf = new NavigationGandalf(_navigationRepository, adminCategoryProvider, _cmsServiceWrapper);
            return new NavigationController(_navigationRepository, _categoryWebApiClient, _cmsServiceWrapper, gandalf, _logger);
        }
    }
}
