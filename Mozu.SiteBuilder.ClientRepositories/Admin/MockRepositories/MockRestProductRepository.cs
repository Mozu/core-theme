using System;
using System.Collections.Generic;
using Volusion.ProductService.DataContracts.Administration;

namespace Volusion.SiteBuilder.ClientRepositories.Admin.MockRepositories
{
    public class MockProductRepository : IProductRepository
    {
        public MockProductRepository(IRestRepositoryConfiguration restConfig)
        {
        }

        public ProductCollection GetProducts(string productSetId, string storeFrontId)
        {
            var col = new ProductCollection { Products = new List<Product>() };

            for (var x = 1; x <= 10; x++)
            {
                col.Products.Add(Get(x));
            }

            return col;
        }

        public ProductLocalizedContent GetContent(int productId, string localeCode)
        {
            return new ProductLocalizedContent
            {
                ContentLocaleCode = localeCode,
                MetaTagDescription = "I am the metatag description",
                MetaTagTitle = "I am the metatag title",
                //PrdouctFeatures = "Cool product features",
                ProductDescription = "Awesome product description",
                ProductId = productId,
                ProductName = "I am product " + productId,
                ProductShortName = "I am short " + productId
            };
        }

        public ProductLocalizedContentCollection GetContentList(int productId)
        {
            var col = new ProductLocalizedContentCollection { Locales = new List<ProductLocalizedContent>() };

            for (var x = 1; x <= 10; x++)
            {
                col.Locales.Add(GetContent(x, "en-us"));
            }

            return col;
        }

        public ProductLocalizedContent EditContent(int productId, string localeCode, ProductLocalizedContent content)
        {
            return content;
        }

        public ProductLocalizedContent AddContent(int productId, string localeCode, ProductLocalizedContent content)
        {
            return content;
        }

        public Product Get(object id)
        {
            return new Product
            {
                ActiveBeginDate = DateTime.Now,
                ActiveEndDate = DateTime.Now.Add(new TimeSpan(30, 0, 0, 0)),
                Cost = 50.0m,
                CreateBy = "Harold Ballzonya",
                CreateDate = DateTime.Now,
                FeeClassId = 0,
                InternalName = "Jon's Mom " + id,
                IsActive = true,
                IsBackOrderedAllowed = true,
                IsDigitallyFulfilled = true,
                IsHiddenWhenOutOfStock = true,
                IsMultiChildAddToCartEnabled = true,
                IsRecurring = true,
                MaximumQty = 10,
                MfgId = 100,
                MinimumQty = 1,
                ProductCode = "XYZ" + id,
                ProductId = (int?)id,
                ProductSetId = 1,
                ProductTypeId = 1,
                RecurranceId = 1,
                StockLowAlarmQty = 10,
                TaxClassId = 1,
                UPC = 1,
                UpdateBy = "Harold Ballzonya",
                UpdateDate = DateTime.Now,
                VendorId = 1,
                VendorProductCode = "ABC",
                CatalogIds = new List<int> { 1, 2, 3, 4, 5 }
            };
        }

        public Product Update(Product entity)
        {
            return entity;
        }

        public Product Create(Product entity)
        {
            entity.ProductId = 10;
            return entity;
        }

        public void Delete(object id)
        {
        }

        public IEnumerable<Product> List()
        {
            return GetProducts("MyStore", "MyStoreFront").Products;
        }
    }
}
