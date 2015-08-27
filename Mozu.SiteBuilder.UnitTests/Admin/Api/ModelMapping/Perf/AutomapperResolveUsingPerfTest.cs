using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using AutoMapper;
using Mozu.Core.Api.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api.ModelMapping;
using Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels;
using DC = Mozu.ProductAdmin.Contracts;
using NUnit.Framework;

namespace Mozu.SiteBuilder.UnitTests.Admin.Api.ModelMapping.Perf
{
    [TestFixture]
    public class AutomapperResolveUsingPerfTest
    {
        private const int MAX_ATTRIBUTE_VALUE_LENGTH = 50;

        #region setup & teardown

        [TearDown]
        public void TearDown()
        {
            Mapper.Reset();
        }

        [SetUp]
        public void SetUp()
        {
            var NULLCONTENT = new DC.ProductLocalizedContent();
            var NULLPRICE = new DC.ProductPrice();
            var NULLPUB = new DC.ProductPublishingInfo();

            Mapper.AddProfile<AttributeMapping>();
            Mapper.AddProfile<CapabilityMapping>();
            Mapper.AddProfile<CategoryMapping>();
            Mapper.AddProfile<CheckoutMapping>();
            Mapper.AddProfile<ContactMapping>();
            Mapper.AddProfile<CreditMapping>();
            Mapper.AddProfile<CustomerMapping>();
            Mapper.AddProfile<DiscountMapping>();
            Mapper.AddProfile<ProductAttributeMapping>();
            Mapper.AddProfile<FacetMapping>();
            Mapper.AddProfile<FileManagementModelMapping>();
            Mapper.AddProfile<GeneralSettingsMapping>();
            
            Mapper.AddProfile<OrderMapping>();
            //Mapper.AddProfile<ProductMapping>();
            Mapper.AddProfile<ReturnMapping>();
            Mapper.AddProfile<RuntimeProductMapping>();
            Mapper.AddProfile<ShippingMapping>();
            Mapper.AddProfile<TaxMapping>();
            Mapper.AddProfile<TenantMapping>();
            Mapper.AddProfile<UserMapping>();




            Mapper.CreateMap<DC.BundledProduct, BundledProduct>()
                  .ForMember(x => x.SalePrice, opt => opt.ResolveUsing(x => x.Price.SalePrice))
                  .ForMember(x => x.Price, opt => opt.ResolveUsing(x => x.Price.Price))
                  .ForMember(x => x.PackageWeight, op => op.ResolveUsing(dc => dc.PackageWeight == null ? null : dc.PackageWeight.Value))
                  .ForMember(x => x.PackageHeight, op => op.ResolveUsing(dc => dc.PackageHeight == null ? null : dc.PackageHeight.Value))
                  .ForMember(x => x.PackageLength, op => op.ResolveUsing(dc => dc.PackageLength == null ? null : dc.PackageLength.Value))
                  .ForMember(x => x.PackageWidth, op => op.ResolveUsing(dc => dc.PackageWidth == null ? null : dc.PackageWidth.Value))
                  .ForMember(x => x.ProductCode, opt => opt.ResolveUsing(x => x.ProductCode))
                  .ForMember(x => x.Quantity, opt => opt.ResolveUsing(x => x.Quantity))
                  .ForMember(x => x.ProductName, opt => opt.ResolveUsing(x => x.ProductName));

            Mapper.CreateMap<BundledProduct, DC.BundledProduct>()
                .ForMember(x => x.ProductCode, opt => opt.ResolveUsing(x => x.ProductCode))
                .ForMember(x => x.Quantity, opt => opt.ResolveUsing(x => x.Quantity))
                .ForMember(x => x.ProductName, opt => opt.ResolveUsing(x => x.ProductName))
                .ForMember(x => x.Price, opt => opt.Ignore())
                .ForMember(x => x.PackageWeight, opt => opt.Ignore())
                .ForMember(x => x.PackageHeight, opt => opt.Ignore())
                .ForMember(x => x.PackageLength, opt => opt.Ignore())
                .ForMember(x => x.PackageWidth, opt => opt.Ignore());


            Mapper.CreateMap<DC.Product, Product>()
                .ForMember(x => x.BundledProducts, opt => opt.ResolveUsing(x => x.BundledProducts))
                .ForMember(x => x.OutOfStockBehavior, op => op.ResolveUsing(dc => (dc.InventoryInfo ?? new DC.ProductInventoryInfo()).OutOfStockBehavior))
                .ForMember(x => x.ManageStock, op => op.ResolveUsing(dc => (dc.InventoryInfo ?? new DC.ProductInventoryInfo()).ManageStock))
                .ForMember(x => x.ProductUsage, op => op.ResolveUsing(x => x.ProductUsage))
                .ForMember(x => x.PublishedState, op => op.ResolveUsing(dc => (dc.PublishingInfo ?? NULLPUB).PublishedState))
                .ForMember(x => x.LastModifiedBy, op => op.ResolveUsing(dc => dc.AuditInfo.UpdateBy))
                .ForMember(x => x.LastModifiedDate, op => op.ResolveUsing(dc => dc.AuditInfo.UpdateDate))
                .ForMember(x => x.LastPublishedBy, op => op.ResolveUsing(dc => (dc.PublishingInfo ?? NULLPUB).LastPublishedBy))
                .ForMember(x => x.LastPublishedDate, op => op.ResolveUsing(dc => (dc.PublishingInfo ?? NULLPUB).LastPublishedDate))
                .ForMember(x => x.ProductCode, op => op.ResolveUsing(dc => dc.ProductCode))
                .ForMember(x => x.BaseProductCode, op => op.ResolveUsing(dc => dc.BaseProductCode))
                .ForMember(x => x.Extras, op => op.ResolveUsing(dc => dc.Extras == null ? null : dc.Extras.Where(x => x.Values != null && x.Values.Count > 0).ToList()))

                .ForMember(x => x.HasConfigurableOptions, op => op.ResolveUsing(dc => dc.HasConfigurableOptions))
                .ForMember(x => x.HasStandaloneOptions, op => op.ResolveUsing(dc => dc.HasStandAloneOptions))

                .ForMember(x => x.ProductName, op => op.ResolveUsing(dc => (dc.Content ?? NULLCONTENT).ProductName))
                .ForMember(x => x.ProductShortDescription, op => op.ResolveUsing(dc => (dc.Content ?? NULLCONTENT).ProductShortDescription))
                .ForMember(x => x.ProductFullDescription, op => op.ResolveUsing(dc => (dc.Content ?? NULLCONTENT).ProductFullDescription))

                .ForMember(x => x.Price, op => op.ResolveUsing(dc => (dc.Price ?? NULLPRICE).Price))
                .ForMember(x => x.SalePrice, op => op.ResolveUsing(dc => (dc.Price ?? NULLPRICE).SalePrice))
                //todo:what?
                // .ForMember(x => x.IsHiddenWhenOutOfStock, op => op.ResolveUsing(dc => dc.i))
                .ForMember(x => x.ProductTypeId, op => op.ResolveUsing(dc => dc.ProductTypeId))
                .ForMember(x => x.MasterCatalogId, op => op.ResolveUsing(x => x.MasterCatalogId))
                //todo:what?
                //  .ForMember(x => x.IsBackOrderAllowed, op => op.ResolveUsing(dc => dc.IsBackOrderAllowed))
                .ForMember(x => x.PackageWeight, op => op.ResolveUsing(dc => dc.PackageWeight == null ? null : dc.PackageWeight.Value))
                .ForMember(x => x.PackageHeight, op => op.ResolveUsing(dc => dc.PackageHeight == null ? null : dc.PackageHeight.Value))
                .ForMember(x => x.PackageLength, op => op.ResolveUsing(dc => dc.PackageLength == null ? null : dc.PackageLength.Value))
                .ForMember(x => x.PackageWidth, op => op.ResolveUsing(dc => dc.PackageWidth == null ? null : dc.PackageWidth.Value))
                .ForMember(x => x.MetaTagTitle, op => op.ResolveUsing(dc => dc.SEOContent == null ? null : dc.SEOContent.MetaTagTitle))
                .ForMember(x => x.MetaTagDescription, op => op.ResolveUsing(dc => dc.SEOContent == null ? null : dc.SEOContent.MetaTagDescription))
                .ForMember(x => x.MetaTagKeywords, op => op.ResolveUsing(dc => dc.SEOContent == null ? null : dc.SEOContent.MetaTagKeywords))
                .ForMember(x => x.SEOFriendlyUrl, op => op.ResolveUsing(dc => dc.SEOContent == null ? null : dc.SEOContent.SEOFriendlyUrl))
                .ForMember(x => x.ProductInCatalogs, op => op.ResolveUsing(dc => dc.ProductInCatalogs))
                .ForMember(x => x.Properties, op => op.ResolveUsing(dc => dc.Properties))
                .ForMember(x => x.Options, op => op.ResolveUsing(dc => dc.Options))
                .ForMember(x => x.ProductImages, op => op.ResolveUsing(dc => (dc.Content ?? NULLCONTENT).ProductImages))

                //ignores
                .ForMember(m => m.ListPrice, op => op.Ignore())
                .ForMember(m => m.StockOnHand, op => op.Ignore())
                .ForMember(m => m.StockOnHandAdjustment, op => op.Ignore())
                .ForMember(m => m.IsHiddenWhenOutOfStock, op => op.Ignore())
                .ForMember(m => m.IsBackOrderAllowed, op => op.Ignore())

                .AfterMap((x, y) =>
                {
                    if (y.ProductInCatalogs != null)
                    {
                        y.ProductInCatalogs.Each(p => p.ProductCode = y.ProductCode);
                    }
                })
                ;

            Mapper.CreateMap<Product, DC.Product>()
                .ForMember(x => x.BundledProducts, opt => opt.ResolveUsing(x => x.BundledProducts))
                .ForMember(dc => dc.InventoryInfo, op => op.ResolveUsing(p => new DC.ProductInventoryInfo() { ManageStock = p.ManageStock, OutOfStockBehavior = string.IsNullOrEmpty(p.OutOfStockBehavior) ? "DisplayMessage" : p.OutOfStockBehavior }))
                .ForMember(dc => dc.ProductCode, op => op.ResolveUsing(p => p.ProductCode))
                 .ForMember(x => x.ProductUsage, op => op.ResolveUsing(x => x.ProductUsage))
                .ForMember(dc => dc.Properties, op => op.ResolveUsing(p => p.Properties))
                .ForMember(dc => dc.Options, op => op.ResolveUsing(p => p.Options))
                .ForMember(x => x.Extras, op => op.ResolveUsing(dc => dc.Extras == null ? null : dc.Extras.Where(x => x.Values != null && x.Values.Count > 0).ToList()))
                .ForMember(dc => dc.BaseProductCode, op => op.ResolveUsing(p => p.BaseProductCode))
                .ForMember(dc => dc.ProductTypeId, op => op.ResolveUsing(dc => dc.ProductTypeId))
                .ForMember(dc => dc.Content, op => op.ResolveUsing(p =>
                {
                    var images = Mapper.Map<List<DC.ProductLocalizedImage>>(p.ProductImages);
                    return new DC.ProductLocalizedContent
                    {
                        ProductName = p.ProductName,
                        ProductShortDescription = p.ProductShortDescription,
                        ProductFullDescription = p.ProductFullDescription,
                        ProductImages = images
                    };
                }))
                 .ForMember(dc => dc.SEOContent, op => op.ResolveUsing(p =>
                 {
                     return new DC.ProductLocalizedSEOContent()
                     {
                         MetaTagDescription = p.MetaTagDescription,
                         MetaTagKeywords = p.MetaTagKeywords,
                         MetaTagTitle = p.MetaTagTitle,
                         SEOFriendlyUrl = p.SEOFriendlyUrl
                     };
                 }))
                .ForMember(dc => dc.Price, op => op.ResolveUsing(p =>
                    new DC.ProductPrice()
                    {
                        ISOCurrencyCode = "USD",
                        // ListPrice = p.ListPrice,
                        Price = p.Price,
                        SalePrice = p.SalePrice
                    }
                ))
                .ForMember(x => x.PackageHeight, op => op.ResolveUsing(x => x.PackageHeight == null ? null : new Measurement { Unit = "in", Value = x.PackageHeight }))
                .ForMember(x => x.PackageLength, op => op.ResolveUsing(x => x.PackageLength == null ? null : new Measurement { Unit = "in", Value = x.PackageLength }))
                .ForMember(x => x.PackageWidth, op => op.ResolveUsing(x => x.PackageWidth == null ? null : new Measurement { Unit = "in", Value = x.PackageWidth }))
                .ForMember(x => x.PackageWeight, op => op.ResolveUsing(x => x.PackageWeight == null ? new Measurement { Unit = "lbs", Value = 0 } : new Measurement { Unit = "lbs", Value = x.PackageWeight }))
                 .AfterMap((x, y) =>
                 {
                     if (y.Properties != null)
                     {
                         y.Properties = y.Properties.Where(p => p.Values != null && p.Values.Count > 0 && p.Values.Any(v => v.Value != null)).ToList();

                     }
                 })
                ;


            Mapper.CreateMap<DC.ProductProperty, ProductProperty>()
                  .ForMember(x => x.AttributeFQN, op => op.ResolveUsing(x => x.AttributeFQN))
                  .ForMember(x => x.Values, op => op.ResolveUsing(x =>
                  {
                      if (x.Values == null)
                      {
                          return null;
                      }
                      return x.Values.Select(v =>
                      {
                          if (v.Content != null && !string.IsNullOrWhiteSpace(v.Content.StringValue))
                          {
                              return v.Content.StringValue;
                          }
                          return v.Value;
                      }).ToList();
                  }));




            Mapper.CreateMap<ProductProperty, DC.ProductProperty>()
                //.ForMember(x => x., op => op.Ignore())
                  .ForMember(x => x.AttributeFQN, op => op.ResolveUsing(x => x.AttributeFQN))
                  .ForMember(x => x.Values, op => op.ResolveUsing(x =>
                  {
                      if (x.Values == null)
                      {
                          return null;
                      }
                      return x.Values.Select(v =>
                      {
                          var ppv = new DC.ProductPropertyValue()
                          {
                              Value = v

                          };
                          if (v != null && v is string)
                          {
                              var vStr = (string)v;
                              ppv.Content = new DC.ProductPropertyValueLocalizedContent()
                              {
                                  StringValue = vStr
                              };
                              // value can't be longer than 50 chars
                              if (vStr.Length > MAX_ATTRIBUTE_VALUE_LENGTH)
                              {
                                  ppv.Value = vStr.Substring(0, MAX_ATTRIBUTE_VALUE_LENGTH);
                              }
                          }
                          return ppv;
                      }).ToList();
                  }));


            Mapper.CreateMap<DC.ProductOption, ProductProperty>()
                  .ForMember(x => x.AttributeFQN, op => op.ResolveUsing(x => x.AttributeFQN))
                  .ForMember(x => x.Values, op => op.ResolveUsing(x =>
                  {
                      if (x.Values == null)
                      {
                          return null;
                      }
                      return x.Values.Select(v =>
                      {
                          //if (v.Content != null && !string.IsNullOrWhiteSpace(v.Content.StringValue))
                          //{
                          //    return v.Content.StringValue;
                          //}
                          return v.Value;
                      }).ToList();
                  }));




            Mapper.CreateMap<ProductProperty, DC.ProductOption>()
                //.ForMember(x => x., op => op.Ignore())
                  .ForMember(x => x.AttributeFQN, op => op.ResolveUsing(x => x.AttributeFQN))
                  .ForMember(x => x.Values, op => op.ResolveUsing(x =>
                  {
                      if (x.Values == null)
                      {
                          return null;
                      }
                      return x.Values.Select(v =>
                      {
                          var ppv = new DC.ProductOptionValue()
                          {
                              Value = v

                          };

                          return ppv;
                      }).ToList();
                  }));


            Mapper.CreateMap<ProductVariation, DC.ProductVariation>();
            Mapper.CreateMap<DC.ProductVariation, ProductVariation>();


            Mapper.CreateMap<ProductVariationOption, DC.ProductVariationOption>();
            Mapper.CreateMap<DC.ProductVariationOption, ProductVariationOption>();



            //Mapper.CreateMap<ProductPropertyValue, DC.ProductPropertyValue>()
            //      .ForMember(x => x.AttributeVocabularyValueDetail, op => op.Ignore())
            //      .ForMember( x=> x.Value, op=> op.ResolveUsing( x=> x.Value ))
            //      .ForMember(x => x.Content, op => op.ResolveUsing(x =>
            //          {
            //              if (!string.IsNullOrEmpty( x.LocalizedValue ))
            //              {
            //                  return new DC.ProductPropertyValueLocalizedContent()
            //                             {
            //                                 StringValue = x.LocalizedValue
            //                             };
            //              }
            //              return null;
            //          }));

            //Mapper.CreateMap<DC.ProductPropertyValue, ProductPropertyValue>()
            //      .ForMember(x => x.Value, op => op.ResolveUsing(x => x.Value))
            //      .ForMember(x => x.LocalizedValue, op => op.ResolveUsing(x =>
            //          {
            //              if (x.Content != null)
            //              {
            //                  return x.Content.StringValue;
            //              }
            //              return null;
            //          }));



            Mapper.CreateMap<DC.ProductInCatalogInfo, ProductInCatalogInfo>()
                .ForMember(x => x.CatalogId, op => op.ResolveUsing(dc => dc.CatalogId))
                .ForMember(x => x.ProductCategories, op => op.ResolveUsing(dc => dc.ProductCategories != null ? dc.ProductCategories.Select(x => x.CategoryId).ToList() : null))
                .ForMember(x => x.IsPriceOverridden, op => op.ResolveUsing(dc => dc.IsContentOverridden))
                .ForMember(x => x.ProductName, op => op.ResolveUsing(dc => (dc.Content ?? NULLCONTENT).ProductName))
                .ForMember(x => x.ProductShortDescription, op => op.ResolveUsing(dc => (dc.Content ?? NULLCONTENT).ProductShortDescription))
                .ForMember(x => x.ProductFullDescription, op => op.ResolveUsing(dc => (dc.Content ?? NULLCONTENT).ProductFullDescription))
                .ForMember(x => x.IsPriceOverridden, op => op.ResolveUsing(dc => dc.IsPriceOverridden))
                .ForMember(x => x.Price, op => op.ResolveUsing(dc => (dc.Price ?? NULLPRICE).Price))
                .ForMember(x => x.SalePrice, op => op.ResolveUsing(dc => (dc.Price ?? NULLPRICE).SalePrice))
                .ForMember(x => x.IsSEOContentOverridden, op => op.ResolveUsing(dc => dc.IsSEOContentOverridden))
                .ForMember(x => x.MetaTagTitle, op => op.ResolveUsing(dc => dc.SEOContent == null ? null : dc.SEOContent.MetaTagTitle))
                .ForMember(x => x.MetaTagDescription, op => op.ResolveUsing(dc => dc.SEOContent == null ? null : dc.SEOContent.MetaTagDescription))
                .ForMember(x => x.MetaTagKeywords, op => op.ResolveUsing(dc => dc.SEOContent == null ? null : dc.SEOContent.MetaTagKeywords))
                .ForMember(x => x.SEOFriendlyUrl, op => op.ResolveUsing(dc => dc.SEOContent == null ? null : dc.SEOContent.SEOFriendlyUrl))
                .ForMember(x => x.ProductImages, op => op.ResolveUsing(dc => (dc.Content ?? NULLCONTENT).ProductImages))
                ;

            Mapper.CreateMap<ProductInCatalogInfo, DC.ProductInCatalogInfo>()
                .ForMember(dc => dc.CatalogId, op => op.ResolveUsing(pisi => pisi.CatalogId))
                .ForMember(x => x.ProductCategories, op => op.ResolveUsing(pisi => pisi.ProductCategories != null ? pisi.ProductCategories.Select(catid => new DC.ProductCategory() { CategoryId = catid }).ToArray() : null))
                .ForMember(dc => dc.IsContentOverridden, op => op.ResolveUsing(pisi => pisi.IsContentOverridden))
                .ForMember(dc => dc.IsPriceOverridden, op => op.ResolveUsing(pisi => pisi.IsPriceOverridden))
                .ForMember(dc => dc.IsSEOContentOverridden, op => op.ResolveUsing(pisi => pisi.IsSEOContentOverridden))
                .ForMember(dc => dc.Content, op => op.ResolveUsing(pisi =>
                {
                    List<DC.ProductLocalizedImage> images = Mapper.Map<List<DC.ProductLocalizedImage>>(pisi.ProductImages);
                    return new DC.ProductLocalizedContent
                    {
                        ProductName = pisi.ProductName,
                        ProductShortDescription = pisi.ProductShortDescription,
                        ProductFullDescription = pisi.ProductFullDescription,
                        ProductImages = images
                    };
                }))
                .ForMember(dc => dc.Price, op => op.ResolveUsing(p =>
                    new DC.ProductPrice
                    {
                        ISOCurrencyCode = "USD",
                        // ListPrice = p.ListPrice,
                        Price = p.Price,
                        SalePrice = p.SalePrice
                    }
                ))
                .ForMember(dc => dc.SEOContent, op => op.ResolveUsing(piso =>
                    new DC.ProductLocalizedSEOContent
                    {
                        MetaTagTitle = piso.MetaTagTitle,
                        MetaTagDescription = piso.MetaTagDescription,
                        MetaTagKeywords = piso.MetaTagKeywords,
                        SEOFriendlyUrl = piso.SEOFriendlyUrl
                    }
                )).AfterMap((info, catalogInfo) =>
                {
                    if (catalogInfo != null && catalogInfo.Content != null && catalogInfo.Content.ProductImages != null)
                    {
                        catalogInfo.Content.ProductImages.Each(x =>
                        {
                            if (!string.IsNullOrWhiteSpace(x.CmsId))
                            {
                                x.ImageUrl = null;
                            }
                        });
                    }
                })
                ;

            Mapper.CreateMap<ProductLocalizedImage, DC.ProductLocalizedImage>()
                .ForMember(x => x.CmsId, opt => opt.ResolveUsing(x => x.CmsId))
                .ForMember(x => x.Sequence, op => op.Ignore())
                .ForMember(x => x.ImageUrl, opt => opt.ResolveUsing(x => string.IsNullOrEmpty(x.CmsId) ? x.ImageUrl : null));

            Mapper.CreateMap<DC.ProductLocalizedImage, ProductLocalizedImage>()
                .ForMember(x => x.CmsId, opt => opt.ResolveUsing(x => x.CmsId));


            Mapper.CreateMap<Mozu.Core.Api.Contracts.Measurement, UnitOfMeasure>();
            Mapper.CreateMap<UnitOfMeasure, Mozu.Core.Api.Contracts.Measurement>();

            Mapper.CreateMap<ProductExtra, DC.ProductExtra>();
            Mapper.CreateMap<DC.ProductExtra, ProductExtra>();

            Mapper.CreateMap<ProductExtraValue, DC.ProductExtraValue>()
                  .ForMember(x => x.DeltaPrice, op => op.ResolveUsing(x => new DC.ProductExtraValueDeltaPrice()
                  {
                      CurrencyCode = "usd",
                      DeltaPrice = x.DeltaPrice
                  }));

            Mapper.CreateMap<DC.ProductExtraValue, ProductExtraValue>()
                  .ForMember(x => x.DeltaPrice, op => op.ResolveUsing(x => x.DeltaPrice != null ? x.DeltaPrice.DeltaPrice : 0));




            Mapper.CreateMap<DC.ProductVariation, ProductVariation>()
                //.ForMember(x => x.Options, op => op.ResolveUsing(x => x.Options))
                  .ForMember(x => x.DeltaPriceValue, op => op.ResolveUsing(x => x.DeltaPrice != null ? x.DeltaPrice.Value : null));
            Mapper.CreateMap<ProductVariation, DC.ProductVariation>()
                .ForMember(x => x.DeltaPrice, op => op.ResolveUsing(x => x.DeltaPriceValue.HasValue ? new DC.ProductVariationDeltaPrice() { CurrencyCode = "usd", Value = x.DeltaPriceValue } : null));

            Mapper.CreateMap<DC.ProductVariationOption, ProductVariationOption>();
            Mapper.CreateMap<ProductVariationOption, DC.ProductVariationOption>();




            Mapper.CreateMap<Mozu.ProductAdmin.Contracts.LocationInventory, LocationWithInventory>();
        }

        #endregion setup

        [Test, Ignore]
        public void ResolveUsing_With_Complex_Object_Perf_Test()
        {
            //arrange
            var domainProduct = PerfUtil.CreateDomainProduct();

            //act
            var st = PerfUtil.ExecuteTimeMapping(domainProduct);

            //anaylyze
            PerfUtil.WriteSummary(PerfUtil.MaxTimes, st);

        }

    }
}