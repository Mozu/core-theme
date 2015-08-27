//using System.Collections.Generic;
//using System.Web.Mvc;
//using NSubstitute;
//using NUnit.Framework;
//using Should;
//using Mozu.ProductRuntime.Contracts;
//using Mozu.ProductRuntime.Contracts.Clients;
//using Mozu.SiteBuilder.Mvc;
//using Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers;
//using Category = Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Category;

//namespace Mozu.SiteBuilder.IntegrationTests.Ux.Controllers
//{
//    [TestFixture]
//    public class SearchControllerTests
//    {
//        private IProductCategoryRuntimeWebApiClient _catClient;
//        private ISiteBuilderContext _ctx;
//        private IProductRuntimeWebApiClient _productClient;
//        private IProductSearchWebApiClient _searchClient;

//        [SetUp]
//        public void SetUp()
//        {
//            _catClient = Substitute.For<IProductCategoryRuntimeWebApiClient>();
//            _ctx = Substitute.For<ISiteBuilderContext>();
//            _ctx.CatalogContext = Substitute.For<ICatalogContext>();
//            var allCategories = new List<Category> { new Category { CategoryId = 12 }, new Category { CategoryId = 16 } };
//            _ctx.CatalogContext.AllCategories.Returns(allCategories);
//            _productClient = Substitute.For<IProductRuntimeWebApiClient>();
//            _searchClient = Substitute.For<IProductSearchWebApiClient>();
//        }

//        [TestCase("noresults", 0)]
//        [TestCase("searchresults", 1)]
//        [TestCase("searchresults", 239048)]
//        public void Index_should_return_a_ProductSearchResult_model_to_view_by_TotalCount(string expectedViewName, int resultsCount)
//        {
//            _searchClient.WithAny(x => x.Search(null, null, null, null, null, null, null, null, null, null), new ProductSearchResult { TotalCount = resultsCount });

//            var controller = GetController();

//            var result = controller.Index("", 0, "", 1, 25) as ViewResult;

//            result.Model.ShouldNotBeNull();
//            result.ViewName.ShouldEqual(expectedViewName);
//        }

//        //[Test]
//        //public void Index_should_ProcessFacets_if_search_result_contains_them()
//        //{
//        //    var searchResult = new ProductSearchResult
//        //    {
//        //        TotalCount = 10,
//        //        CategoryFacet = new CategoryFacet
//        //        {
//        //            Items = new List<CategoryFacetItem>
//        //                {
//        //                    new CategoryFacetItem { CategoryId = 12, Count = 3 },
//        //                    new CategoryFacetItem { CategoryId = 16, Count = 11 },
//        //                }
//        //        }
//        //    };
//        //    _searchClient.WithAny(x => x.Search(null, null, null, null, null, null, null, null, null, null), searchResult);

//        //    var controller = GetController();

//        //    var result = controller.Index("", 0, "", 1, 25) as ViewResult;
//        //    var model = result.Model as UX.Models.StoreFront.Catalog.ProductSearchResult;

//        //    model.CategoryFacet.ShouldNotBeNull();
//        //}

//        private SearchController GetController()
//        {
//            return new SearchController(_catClient, _ctx, _productClient, _searchClient);
//        }
//    }
//}

