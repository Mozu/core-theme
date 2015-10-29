//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Net.Http;
//using Mozu.ProductAdmin.Contracts.Clients;
//using Mozu.SiteBuilder.UX.Admin.Api;
//using Mozu.SiteBuilder.UX.Admin.Api.Models;
//using Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels;
//using NSubstitute;
//using NUnit.Framework;
//using Should;
//using DC = Mozu.ProductAdmin.Contracts;

//namespace Mozu.SiteBuilder.IntegrationTests.Admin.Api
//{
//    [TestFixture]
//    public class ProductControllerTests
//    {
//        private IProductWebApiClient _productClient;
//        ProductController _testedController;
//        private readonly DC.ProductCollection _mocks = new DC.ProductCollection
//        {
//            Items = new List<DC.Product> {
//                new DC.Product {
//                    ProductCode = "TEST123"
//                },
//                new DC.Product {
//                    ProductCode = "TEST234"
//                }
//            }
//        };

//        [SetUp]
//        public void SetUp()
//        {
//            _productClient = Substitute.For<IProductWebApiClient>();
//            _testedController = new ProductController(_productClient, null);

//            // set up add product mock.
//            _productClient.AddProduct(Arg.Any<DC.Product>()).Returns(
//                x => new TestResponse<DC.Product>((DC.Product)x[0]).Task
//            );

//            // set up delete product mock.
//            _productClient.DeleteProduct(Arg.Any<string>()).Returns(
//                x => new TestResponse<StreamContent>(TestResponse.Void).Task
//            );

//            // set up get product mock.
//            _productClient.GetProduct(Arg.Any<string>(), Arg.Any<string>()).Returns(
//                x => new TestResponse<DC.Product>(_mocks.Items.FirstOrDefault(p => p.ProductCode == (string)x[0])).Task
//            );

//            // set up get products mock.
//            _productClient.GetProducts(Arg.Any<int?>(), Arg.Any<int?>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>()).Returns(
//                x => new TestResponse<DC.ProductCollection>(_mocks).Task
//            );

//            // set up update product mock
//            _productClient.UpdateProduct(Arg.Any<DC.Product>(), Arg.Any<string>()).Returns(
//                x => new TestResponse<DC.Product>((DC.Product)x[0]).Task
//            );
//        }

//        [Test]
//        public void CreateProduct_should_call_AddProduct_for_each_product_requested()
//        {
//            var products = new List<Product>
//                {
//                    new Product { ProductName = "Kitten Mittens", ProductCode = "KM1" },
//                    new Product { ProductName = "Cat Pants", ProductCode="CP2" },
//                };

//            Response<List<Product>> response = _testedController.CreateProduct(products).Result;

//            response.Items.Count.ShouldEqual(2);
//            response.Items[0].ProductCode.ShouldEqual(products[0].ProductCode);
//            response.Items[1].ProductCode.ShouldEqual(products[1].ProductCode);
//        }

//        [Test]
//        public void DeleteProduct_should_send_each_ProductCode_to_productClient_DeleteProduct()
//        {
//            var products = new List<Product>
//                {
//                    new Product { ProductCode = "123" },
//                    new Product { ProductCode = "456" },
//                };

//            var response = _testedController.DeleteProduct(products).Result;

//            _productClient.Received(1).DeleteProduct(products[0].ProductCode);
//            _productClient.Received(1).DeleteProduct(products[1].ProductCode);

//            response.Success.ShouldBeTrue();
//            response.Total.ShouldEqual(products.Count);
//        }


//        [Test]
//        public void GetProductList_should_return_mapped_products_from_service()
//        {
//            var pagingParams = new PagingParamaters { pageSize = 12, pageIndex = 23 };
//            var extFilter = new FilterCollection();

//            var response = _testedController.GetProduct(pagingParams, extFilter).Result;

//            response.Success.ShouldBeTrue();
//            response.Total.ShouldEqual((int)_mocks.TotalCount);
//            response.Items.First().ProductCode.ShouldEqual(_mocks.Items[0].ProductCode);
//        }

//        [Test]
//        public void GetProductList_single_item_lookup_should_work()
//        {
//            string productCode = _mocks.Items.Last().ProductCode;

//            var pagingParams = new PagingParamaters { id = productCode };
//            var extFilter = new FilterCollection();

//            var response = _testedController.GetProduct(pagingParams, extFilter).Result;

//            response.Success.ShouldBeTrue();
//            response.Total.ShouldEqual(1);
//            response.Items.First().ProductCode.ShouldEqual(productCode);
//        }

//        [Test]
//        public void EditProduct_should_send_each_Product_to_productClient_EditProduct()
//        {
//            var products = new List<Product>
//                {
//                    new Product { ProductCode = "123", ProductName = "The Zetlen Accordian" },
//                    new Product { ProductCode = "456", ProductName = "4 hour loko" },
//                };

//            var response = _testedController.EditProduct(products).Result;

//            response.Success.ShouldBeTrue();
//            response.Total.ShouldEqual(products.Count);
//            response.Items.First().ProductCode.ShouldEqual(products.First().ProductCode);
//            response.Items.Last().ProductCode.ShouldEqual(products.Last().ProductCode);
//        }

//        // TODO: some more testing
//    }
//}

