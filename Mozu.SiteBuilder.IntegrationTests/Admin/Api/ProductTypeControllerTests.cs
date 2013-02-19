using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes;
using Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels;
using NSubstitute;
using NUnit.Framework;
using Should;
using DC = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.IntegrationTests.Admin.Api
{
    [TestFixture]
    public class ProductTypeControllerTests
    {
        private IProductTypeWebApiClient _productTypeClient;
        ProductTypeController _testedController;
        private readonly DC.ProductTypeCollection _mocks = new DC.ProductTypeCollection
        {
            Items = new List<DC.ProductType> {
                new DC.ProductType {
                    Id = 1,
                    Name = "Product Type 1",
                    Properties = new List<DC.AttributeInProductType>(),
                    Options = new List<DC.AttributeInProductType>(),
                    Extras = new List<DC.AttributeInProductType>()
                },
                new DC.ProductType {
                    Id = 2,
                    Name = "Product Type 2",
                    Properties = new List<DC.AttributeInProductType>(),
                    Options = new List<DC.AttributeInProductType>(),
                    Extras = new List<DC.AttributeInProductType>()
                }
            }
        };

        [SetUp]
        public void SetUp()
        {
            _productTypeClient = Substitute.For<IProductTypeWebApiClient>();
            _testedController = new ProductTypeController(_productTypeClient);

            // set up GetProductType mock.
            _productTypeClient.GetProductType(Arg.Any<int?>()).Returns(
                args => {
                    DC.ProductType mock = _mocks.Items.First(pt => pt.Id == (int)args[0]);
                    return new TestResponse<DC.ProductType>(mock).Task;
                }
            );
                    
            // set up GetProductTypes mock.
            _productTypeClient.GetProductTypes(Arg.Any<int?>(), Arg.Any<int?>(), Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>()).Returns(
                args => new TestResponse<DC.ProductTypeCollection>(_mocks).Task
            );

            // set up AddProductType mock.
            _productTypeClient.AddProductType(Arg.Any<DC.ProductType>()).Returns(
                args => new TestResponse<DC.ProductType>((DC.ProductType)args[0]).Task
            );

            // set up UpdateProductType mock.
            _productTypeClient.UpdateProductType(Arg.Any<DC.ProductType>(), Arg.Any<int?>()).Returns(
                args => new TestResponse<DC.ProductType>((DC.ProductType)args[0]).Task
            );

            // set up DeleteProductType mock.
            _productTypeClient.DeleteProductType(Arg.Any<int?>()).Returns(
                args => new TestResponse<StreamContent>(TestResponse.Void).Task
            );
        }

        [Test]
        public void ListProductTypes_should_return_a_single_when_id_is_specified()
        {
            int? requestedId = _mocks.Items.Last().Id;
            
            var pagingParams = new PagingParamaters { id = Convert.ToString(requestedId) };
            var filterParams = new FilterCollection();

            Response<List<ProductType>> r = _testedController.ListProductTypes(pagingParams, filterParams).Result;

            _productTypeClient.Received(1).GetProductType(Arg.Is<int?>(requestedId));
            r.Total.ShouldEqual(1);
            r.Items[0].Id.ShouldEqual(requestedId);
        }

        public void ListProductTypes_should_return_many()
        {
            var pagingParams = new PagingParamaters();
            var filterParams = new FilterCollection();

            Response<List<ProductType>> r = _testedController.ListProductTypes(pagingParams, filterParams).Result;

        }
        // TODO: some more testing
    }
}