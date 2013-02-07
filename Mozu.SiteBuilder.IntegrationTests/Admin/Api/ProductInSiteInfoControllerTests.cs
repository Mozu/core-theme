using System;
using System.Linq;
using System.Collections.Generic;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using NSubstitute;
using NUnit.Framework;
using Should;
using DC = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.IntegrationTests.Admin.Api
{
    [TestFixture]
    public class ProductInSiteInfoControllerTests
    {
        private IProductWebApiClient _productClient;
        ProductInSiteInfoController _testedController;
        private readonly DC.Product _mock = new DC.Product {
                    ProductCode = "TEST123",
                    Content = new DC.ProductLocalizedContent {
                        ProductName = "Test Product"
                    },
                    ProductInSites = new List<DC.ProductInSiteInfo> {
                        new DC.ProductInSiteInfo {
                            SiteId = 1,
                            IsContentOverridden = false,
                            Content = new DC.ProductLocalizedContent()
                        },
                        new DC.ProductInSiteInfo {
                            SiteId = 2,
                            IsContentOverridden = true,
                            Content = new DC.ProductLocalizedContent {
                                ProductName = "The best test product you've ever seen"
                            }
                        }
                    }
        };

        [SetUp]
        public void SetUp()
        {
            _productClient = Substitute.For<IProductWebApiClient>();

            _testedController = new ProductInSiteInfoController(_productClient);

            // set up get product mock.
            _productClient.GetProduct(Arg.Any<string>(), Arg.Any<string>()).Returns(
                x => new TestResponse<DC.Product>(_mock).Task
            );

            // set up update product mock
            _productClient.UpdateProduct(Arg.Any<DC.Product>(), Arg.Any<string>()).Returns(
                x => new TestResponse<DC.Product>((DC.Product)x[0]).Task
            );
        }

        [Test]
        public void Test_get_pisi_list_with_no_product_code_gives_you_nothing_and_youll_like_it()
        {
            // conspicuous lack of productCode in PagingParameters
            var pagingParams = new PagingParamaters {};
            var extFilter = new FilterCollection();

            var response = _testedController.GetProductInSiteInfoList(pagingParams, extFilter).Result;

            response.Success.ShouldBeTrue();
            response.Total.ShouldEqual(0);
        }


        [Test]
        public void Test_get_pisi_list_for_all_sites()
        {
            string productCode = _mock.ProductCode;
            var pagingParams = new PagingParamaters { productCode = productCode };
            var extFilter = new FilterCollection();

            var response = _testedController.GetProductInSiteInfoList(pagingParams, extFilter).Result;

            response.Success.ShouldBeTrue();
            response.Total.ShouldEqual(_mock.ProductInSites.Count);
        }

        public void Test_get_pisi_list_for_one_site()
        {
            string productCode = _mock.ProductCode;
            int siteId = _mock.ProductInSites.First().SiteId;
            var pagingParams = new PagingParamaters { productCode = productCode, id = Convert.ToString(siteId) };
            var extFilter = new FilterCollection();

            var response = _testedController.GetProductInSiteInfoList(pagingParams, extFilter).Result;

            response.Success.ShouldBeTrue();
            response.Total.ShouldEqual(1);
            response.Items.First().SiteId.ShouldEqual(siteId);
        }

        // TODO: some more testing
    }
}