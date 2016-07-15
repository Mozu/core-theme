using System.Collections.Generic;
using System.Linq;
using Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels;
using Mozu.SiteBuilder.UX.Admin.Helpers.ProductHelpers;
using DC = Mozu.ProductAdmin.Contracts;
using NUnit.Framework;

namespace Mozu.SiteBuilder.UnitTests.Admin.Helpers.ProductHelpers
{
    [TestFixture]
    public class BundleItemCatalogHelperTest
    {
        [Test]
        public void It_Should_Create_ProductInCatalog_With_BundledProducts_With_CatalogPrices()
           
        {
            //setup
            var verificationProductCode = "MS-BTL-001";
            var bundledProducts = GetBundleProducts();
            var prodInCatInfo = GetProdInCat();
            var bundleItemProducts = GetBundleItemProducts();
            var masterCatSampleBundleItem = bundledProducts.FirstOrDefault(x => x.ProductCode == verificationProductCode);
            var sut = new BundleItemCatalogHelper();

            //execute
            List<ProductInCatalogInfo> result = sut.MergeBundleItemsAndCatalogInfo(bundledProducts, prodInCatInfo, bundleItemProducts);

            //assert
            Assert.That(result, Is.Not.Null);
            
            var actualBundleItem =
                result.Where(x => x.CatalogId == 1)
                    .Select(y => y.BundledProducts.FirstOrDefault(bp => bp.ProductCode == verificationProductCode)).FirstOrDefault();

            Assert.That(masterCatSampleBundleItem.Price, Is.Not.EqualTo(actualBundleItem.Price));
            Assert.That(masterCatSampleBundleItem.SalePrice, Is.Not.EqualTo(actualBundleItem.SalePrice));
        }

#region fake data
        private static List<BundledProduct> GetBundleProducts()
        {
            return new List<BundledProduct>
            {
                new BundledProduct
                {
                    ProductCode = "MS-BTL-001",
                    ProductName = "Delta",
                    Quantity = 12,
                    Price = 10M,
                    SalePrice = 8.99M
                },
                new BundledProduct
                {
                    ProductCode = "MS-BTL-004",
                    ProductName = "Vida Small",
                    Quantity = 3,
                    Price = 7M
                },
                new BundledProduct
                {
                    ProductCode = "MS-BTL-003",
                    ProductName = "Vida Large",
                    Quantity = 1,
                    Price = 7.99M
                }
            };
        }

        private static List<ProductInCatalogInfo> GetProdInCat()
        {
            return new List<ProductInCatalogInfo>
            {
                new ProductInCatalogInfo
                {
                    CatalogId = 1,
                    ProductName = "Bundle in 2 Cats",
                    ProductCode = "bund-cat2",
                    Price = 149.99M,
                    SalePrice = 129.99M
                }
            };
        }

        private static List<DC.Product> GetBundleItemProducts()
        {
            return new List<DC.Product>
            {
                new DC.Product
                {
                    ProductCode = "MS-BTL-001",
                    ProductInCatalogs = new List<DC.ProductInCatalogInfo>
                    {
                        new DC.ProductInCatalogInfo
                        {
                    
                            CatalogId = 1,
                            Content = new DC.ProductLocalizedContent { ProductName = "Delta" },
                            Price = new DC.ProductPrice { Price = 9.99M, SalePrice = 9.78M }
                        },
                        new DC.ProductInCatalogInfo
                        {
                            CatalogId = 2,
                            Content = new DC.ProductLocalizedContent { ProductName = "Delta" },
                            Price = new DC.ProductPrice { Price = 10M, SalePrice = 8.99M }
                        },
                        new DC.ProductInCatalogInfo
                        {
                            CatalogId = 3,
                            Content = new DC.ProductLocalizedContent { ProductName = "Delta" },
                            Price = new DC.ProductPrice { Price = 10M, SalePrice = 8.99M }
                        },
                        new DC.ProductInCatalogInfo
                        {
                            CatalogId = 4,
                            Content = new DC.ProductLocalizedContent { LocaleCode = "fr-FR", ProductName = "Le Delta" },
                            Price = new DC.ProductPrice { ISOCurrencyCode = "EUR", Price = 29.99M, SalePrice = 19.99M }
                        },
                    }
                },
                new DC.Product
                {
                    ProductCode = "MS-BTL-003",
                    ProductInCatalogs = new List<DC.ProductInCatalogInfo>
                    {
                        new DC.ProductInCatalogInfo
                        {
                            CatalogId = 1,
                            Content = new DC.ProductLocalizedContent { ProductName = "Vida Large" },
                            Price = new DC.ProductPrice { Price = 9M, SalePrice = 7.99M }
                        }
                    }
                },
                new DC.Product
                {
                    ProductCode = "MS-BTL-004",
                    ProductInCatalogs = new List<DC.ProductInCatalogInfo>
                    {
                        new DC.ProductInCatalogInfo
                        {
                            CatalogId = 1,
                            Content = new DC.ProductLocalizedContent { ProductName = "Vida Small" },
                            Price = new DC.ProductPrice { Price = 7M }
                        }
                    }
                }
            };
        }

#endregion

    }

}
