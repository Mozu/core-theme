using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using NSubstitute;
using NUnit.Framework;
using Should;
using Mozu.ProductAdmin.Contracts;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Product = Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels.Product;
using MozuProduct = Mozu.ProductAdmin.Contracts.Product;

namespace Mozu.SiteBuilder.IntegrationTests.Admin.Api
{
    [TestFixture]
    public class ProductControllerTests
    {
        private IProductWebApiClient _productClient;

        [SetUp]
        public void SetUp()
        {
            _productClient = Substitute.For<IProductWebApiClient>();
        }

        [Test]
        public void CreateProduct_should_call_AddProduct_for_each_product_requested()
        {
            var api = GetApi();
            var products = new List<Product>
                {
                    new Product { ProductName = "Kitten Mittens" },
                    new Product { ProductName = "Cats Pants" },
                };
            var request = new List<Product>(products);
            var serverProduct = new MozuProduct();

            _productClient.With(x => x.AddProduct(Arg.Any<MozuProduct>()), serverProduct);

            var response = api.CreateProduct(request);

            response.Items.First().ProductCode.ShouldEqual(products.First().ProductCode);
            response.Items.Last().ProductCode.ShouldEqual(products.Last().ProductCode);
        }

        [Test]
        public void DeleteProduct_should_send_each_ProductCode_to_productClient_DeleteProduct()
        {
            var api = GetApi();
            var products = new List<Product>
                {
                    new Product { ProductCode = "123" },
                    new Product { ProductCode = "456" },
                };
            var request = new List<Product>(products);

            _productClient.With(x => x.DeleteProduct(Arg.Any<string>()), TestResponse.Void);

            var response = api.DeleteProduct(request);

            _productClient.Received(1).DeleteProduct(products[0].ProductCode);
            _productClient.Received(1).DeleteProduct(products[1].ProductCode);

            response.Success.ShouldBeTrue();
            response.Total.ShouldEqual(products.Count);
        }

        [Test]
        public void GetProductList_should_return_mapped_products_from_service()
        {
            var api = GetApi();
            var pagingParams = new PagingParamaters { pageSize = 12, pageIndex = 23 };
            var extFilter = new FilterCollection();
            var productCode = "THOMDESK";
            var products = new List<MozuProduct> { new MozuProduct { ProductCode = productCode } };

            _productClient.With(x => x.GetProducts(pagingParams.startIndex, pagingParams.pageSize, null, null, null), new ProductCollection { Items = products });

            var response = api.GetProductList(pagingParams, extFilter);

            response.Success.ShouldBeTrue();
            response.Total.ShouldEqual(0);
            response.Items.First().ProductCode.ShouldEqual(productCode);
        }

        [Test]
        public void EditProduct_should_send_each_Product_to_productClient_EditProduct()
        {
            var api = GetApi();
            var products = new List<Product>
                {
                    new Product { ProductCode = "123", ProductName = "The Zetlen Accordian" },
                    new Product { ProductCode = "456", ProductName = "4 hour loko" },
                };
            var request = new List<Product>(products);
            var product1 = new MozuProduct { ProductCode = products[0].ProductCode };
            var product2 = new MozuProduct { ProductCode = products[1].ProductCode };

            _productClient.With(x => x.UpdateProduct(Arg.Any<MozuProduct>(), Arg.Any<string>()), product1, product2);

            var response = api.EditProduct(request);

            response.Success.ShouldBeTrue();
            response.Total.ShouldEqual(products.Count);
            response.Items.First().ProductCode.ShouldEqual(products.First().ProductCode);
            response.Items.Last().ProductCode.ShouldEqual(products.Last().ProductCode);
        }

        private ProductController GetApi()
        {
            return new ProductController(_productClient);
        }
    }
}