//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Net.Http;
//using AutoMapper;
//using Mozu.ProductAdmin.Contracts.Clients;
//using Mozu.SiteBuilder.UX.Admin.Api;
//using Mozu.SiteBuilder.UX.Admin.Api.Models;
//using Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes;
//using Mozu.SiteBuilder.UX.Admin.MockServices;
//using NSubstitute;
//using NUnit.Framework;
//using Should;
//using DC = Mozu.ProductAdmin.Contracts;

//namespace Mozu.SiteBuilder.IntegrationTests.Admin.Api
//{
//    [TestFixture]
//    public class ProductTypeControllerTests
//    {
//        private IMoreAwesomeProductTypeWebApiClient _productTypeClient;
//        ProductTypeController _testedController;
//        private readonly DC.ProductTypeCollection _mocks = new DC.ProductTypeCollection
//        {
//            Items = new List<DC.ProductType> {
//                new DC.ProductType {
//                    Id = 1,
//                    Name = "Product Type 1",
//                    Properties = new List<DC.AttributeInProductType>(),
//                    Options = new List<DC.AttributeInProductType>(),
//                    Extras = new List<DC.AttributeInProductType>()
//                },
//                new DC.ProductType {
//                    Id = 2,
//                    Name = "Product Type 2",
//                    Properties = new List<DC.AttributeInProductType>(),
//                    Options = new List<DC.AttributeInProductType>(),
//                    Extras = new List<DC.AttributeInProductType>()
//                }
//            }
//        };

//        [SetUp]
//        public void SetUp()
//        {
//            _productTypeClient = Substitute.For<IMoreAwesomeProductTypeWebApiClient>();
//            _testedController = new ProductTypeController(_productTypeClient);

//            // set up GetProductType mock.
//            _productTypeClient.GetProductType(Arg.Any<int?>()).Returns(
//                args => {
//                    DC.ProductType mock = _mocks.Items.First(pt => pt.Id == (int)args[0]);
//                    return new TestResponse<DC.ProductType>(mock).Task;
//                }
//            );

//            // set up GetProductTypes mock.
//            _productTypeClient.GetProductTypes(Arg.Any<int?>(), Arg.Any<int?>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>()).Returns(
//                args => new TestResponse<DC.ProductTypeCollection>(_mocks).Task
//            );

//            // set up AddProductType mock.
//            _productTypeClient.AddProductType(Arg.Any<DC.ProductType>()).Returns(
//                args => {
//                    DC.ProductType addedPT = (DC.ProductType)args[0];
//                    addedPT.Id = new Random().Next();
//                    return new TestResponse<DC.ProductType>(addedPT).Task;
//                }
//            );

//            // set up UpdateProductType mock.
//            _productTypeClient.UpdateProductType(Arg.Any<DC.ProductType>(), Arg.Any<int?>()).Returns(
//                args => new TestResponse<DC.ProductType>((DC.ProductType)args[0]).Task
//            );

//            // set up DeleteProductType mock.
//            _productTypeClient.DeleteProductType(Arg.Any<int?>()).Returns(
//                args => new TestResponse<StreamContent>(TestResponse.Void).Task
//            );
//        }

//        [Test]
//        public void ListProductTypes_should_return_a_single_when_id_is_specified()
//        {
//            int? requestedId = _mocks.Items.Last().Id;

//            var pagingParams = new PagingParamaters { id = Convert.ToString(requestedId) };
//            var filterParams = new FilterCollection();

//            Response<List<ProductType>> r = _testedController.ListProductTypes(pagingParams, filterParams).Result;

//            _productTypeClient.Received(1).GetProductType(Arg.Is<int?>(requestedId));
//            r.Total.ShouldEqual(1);
//            r.Items[0].Id.ShouldEqual(requestedId);
//        }

//        public void ListProductTypes_should_return_many()
//        {
//            var pagingParams = new PagingParamaters();
//            var filterParams = new FilterCollection();

//            Response<List<ProductType>> r = _testedController.ListProductTypes(pagingParams, filterParams).Result;

//            r.Success.ShouldBeTrue();
//            r.Total.ShouldEqual(_mocks.Items.Count);
//            IEnumerable<int?> mockIds = _mocks.Items.Select(m => m.Id);
//            IEnumerable<int?> returnedIds = r.Items.Select(pt => pt.Id);

//            // there shouldn't be any ids that exist in one list but not the other.
//            mockIds.Except(returnedIds).ShouldBeEmpty();
//        }

//        [Test]
//        public void CreateProductType_should_call_AddProductType_for_each_product_requested()
//        {
//            var newPTs = new List<ProductType>
//                {
//                    new ProductType { Name = "Kitten Mittens the ProductType" },
//                    new ProductType { Name = "Cat Pants the ProductType" }
//                };

//            Response<List<ProductType>> response = _testedController.CreateProductType(newPTs).Result;

//            response.Items.Count.ShouldEqual(2);
//            response.Items[0].Name.ShouldEqual(newPTs[0].Name);
//            response.Items[0].Id.ShouldBeInRange(1, Int32.MaxValue);
//            response.Items[1].Name.ShouldEqual(newPTs[1].Name);
//            response.Items[1].Id.ShouldBeInRange(1, Int32.MaxValue);
//        }

//        [Test]
//        public void DeleteProductType_should_send_each_Id_to_productTypeClient_DeleteProductType()
//        {
//            var productTypes = Mapper.Map<List<ProductType>>(_mocks.Items);

//            var response = _testedController.DeleteProductType(productTypes).Result;

//            _productTypeClient.Received(1).DeleteProductType(productTypes[0].Id);
//            _productTypeClient.Received(1).DeleteProductType(productTypes[1].Id);

//            response.Success.ShouldBeTrue();
//            response.Total.ShouldEqual(productTypes.Count);
//        }

//        [Test]
//        public void EditProductType_should_send_each_ProductType_to_productTypeClient()
//        {
//            var productTypes = new List<ProductType>
//                {
//                    new ProductType { Id = 123, Name = "Zetlen's Product Type" },
//                    new ProductType { Id = 456, Name = "PT Cray Cray" }
//                };

//            var response = _testedController.EditProductType(productTypes).Result;

//            response.Success.ShouldBeTrue();
//            response.Total.ShouldEqual(productTypes.Count);
//            response.Items.First().Id.ShouldEqual(productTypes.First().Id);
//            response.Items.First().Name.ShouldEqual(productTypes.First().Name);
//            response.Items.Last().Name.ShouldEqual(productTypes.Last().Name);
//        }
//        // TODO: some more testing
//    }
//}

