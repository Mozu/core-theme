using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Mozu.Core.Api.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api.ModelMapping;
using Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels;
using NUnit.Framework;

namespace Mozu.SiteBuilder.UnitTests.Admin.Api.ModelMapping.Perf
{
    [TestFixture]
    public class AutomapperResolveUsingWithoutNullChecksPerfTest
    {
        #region setup & teardown

        [TearDown]
        public void TearDown()
        {
            Mapper.Reset();
        }

        [SetUp]
        public void SetUp()
        {
            Mapper.AddProfile<AttributeMapping>();
            Mapper.AddProfile<CapabilityMapping>();
            Mapper.AddProfile<CategoryMapping>();
            Mapper.AddProfile<CheckoutMapping>();
            Mapper.AddProfile<ContactMapping>();
            Mapper.AddProfile<CreditMapping>();
            Mapper.AddProfile<CustomerMapping>();
            Mapper.AddProfile<DiscountMapping>();
            Mapper.AddProfile<ExtensibleAttributeMapping>();
            Mapper.AddProfile<FacetMapping>();
            Mapper.AddProfile<FileManagementModelMapping>();
            Mapper.AddProfile<GeneralSettingsMapping>();
            
            Mapper.AddProfile<OrderMapping>();
            //Mapper.AddProfile<ProductMapping>();
            //Mapper.AddProfile<ReturnMapping>();
            Mapper.AddProfile<RuntimeProductMapping>();
            Mapper.AddProfile<ShippingMapping>();
            Mapper.AddProfile<TaxMapping>();
            Mapper.AddProfile<TenantMapping>();
            Mapper.AddProfile<UserMapping>();


            var NULLCONTENT = new ProductAdmin.Contracts.ProductLocalizedContent();
            var NULLPRICE = new ProductAdmin.Contracts.ProductPrice();
            var NULLPUB = new ProductAdmin.Contracts.ProductPublishingInfo();

            Mapper.CreateMap<ProductAdmin.Contracts.BundledProduct, BundledProduct>()
                .ForMember(x => x.SalePrice, opt => opt.ResolveUsing(x => x.Price.SalePrice))
                .ForMember(x => x.Price, opt => opt.ResolveUsing(x => x.Price.Price))
                .ForMember(x => x.PackageWeight, op => op.ResolveUsing(dc => dc.PackageWeight.Value))
                .ForMember(x => x.PackageHeight, op => op.ResolveUsing(dc => dc.PackageHeight.Value))
                .ForMember(x => x.PackageLength, op => op.ResolveUsing(dc => dc.PackageLength.Value))
                .ForMember(x => x.PackageWidth, op => op.ResolveUsing(dc => dc.PackageWidth.Value))
                .ForMember(x => x.ProductCode, opt => opt.ResolveUsing(x => x.ProductCode))
                .ForMember(x => x.Quantity, opt => opt.ResolveUsing(x => x.Quantity))
                .ForMember(x => x.ProductName, opt => opt.ResolveUsing(x => x.ProductName));

            Mapper.CreateMap<BundledProduct, ProductAdmin.Contracts.BundledProduct>()
                .ForMember(x => x.ProductCode, opt => opt.ResolveUsing(x => x.ProductCode))
                .ForMember(x => x.Quantity, opt => opt.ResolveUsing(x => x.Quantity))
                .ForMember(x => x.ProductName, opt => opt.ResolveUsing(x => x.ProductName))
                .ForMember(x => x.Price, opt => opt.Ignore())
                .ForMember(x => x.PackageWeight, opt => opt.Ignore())
                .ForMember(x => x.PackageHeight, opt => opt.Ignore())
                .ForMember(x => x.PackageLength, opt => opt.Ignore())
                .ForMember(x => x.PackageWidth, opt => opt.Ignore());


            Mapper.CreateMap<ProductAdmin.Contracts.Product, Product>()
                .ForMember(x => x.BundledProducts, opt => opt.ResolveUsing(x => x.BundledProducts))
                .ForMember(x => x.OutOfStockBehavior, op => op.ResolveUsing(dc => dc.InventoryInfo.OutOfStockBehavior))
                .ForMember(x => x.ManageStock, op => op.ResolveUsing(dc => dc.InventoryInfo.ManageStock))
                .ForMember(x => x.ProductUsage, op => op.ResolveUsing(x => x.ProductUsage))
                .ForMember(x => x.PublishedState, op => op.ResolveUsing(dc => dc.PublishingInfo.PublishedState))
                .ForMember(x => x.LastModifiedBy, op => op.ResolveUsing(dc => dc.AuditInfo.UpdateBy))
                .ForMember(x => x.LastModifiedDate, op => op.ResolveUsing(dc => dc.AuditInfo.UpdateDate))
                .ForMember(x => x.LastPublishedBy, op => op.ResolveUsing(dc => dc.PublishingInfo.LastPublishedBy))
                .ForMember(x => x.LastPublishedDate, op => op.ResolveUsing(dc => dc.PublishingInfo.LastPublishedDate))
                .ForMember(x => x.ProductCode, op => op.ResolveUsing(dc => dc.ProductCode))
                .ForMember(x => x.BaseProductCode, op => op.ResolveUsing(dc => dc.BaseProductCode))
                .ForMember(x => x.Extras, op => op.ResolveUsing(dc => dc.Extras.Where(x => x.Values != null && x.Values.Count > 0).ToList()))

                .ForMember(x => x.HasConfigurableOptions, op => op.ResolveUsing(dc => dc.HasConfigurableOptions))
                .ForMember(x => x.HasStandaloneOptions, op => op.ResolveUsing(dc => dc.HasStandAloneOptions))

                .ForMember(x => x.ProductName, op => op.ResolveUsing(dc => dc.Content .ProductName))
                .ForMember(x => x.ProductShortDescription, op => op.ResolveUsing(dc => dc.Content.ProductShortDescription))
                .ForMember(x => x.ProductFullDescription, op => op.ResolveUsing(dc => dc.Content.ProductFullDescription))

                .ForMember(x => x.Price, op => op.ResolveUsing(dc => dc.Price.Price))
                .ForMember(x => x.SalePrice, op => op.ResolveUsing(dc => dc.Price.SalePrice))
                //todo:what?
                // .ForMember(x => x.IsHiddenWhenOutOfStock, op => op.ResolveUsing(dc => dc.i))
                .ForMember(x => x.ProductTypeId, op => op.ResolveUsing(dc => dc.ProductTypeId))
                .ForMember(x => x.MasterCatalogId, op => op.ResolveUsing(x => x.MasterCatalogId))
                //todo:what?
                //  .ForMember(x => x.IsBackOrderAllowed, op => op.ResolveUsing(dc => dc.IsBackOrderAllowed))
                .ForMember(x => x.PackageWeight, op => op.ResolveUsing(dc => dc.PackageWeight.Value))
                .ForMember(x => x.PackageHeight, op => op.ResolveUsing(dc => dc.PackageHeight.Value))
                .ForMember(x => x.PackageLength, op => op.ResolveUsing(dc => dc.PackageLength.Value))
                .ForMember(x => x.PackageWidth, op => op.ResolveUsing(dc => dc.PackageWidth.Value))
                .ForMember(x => x.MetaTagTitle, op => op.ResolveUsing(dc => dc.SEOContent.MetaTagTitle))
                .ForMember(x => x.MetaTagDescription, op => op.ResolveUsing(dc => dc.SEOContent.MetaTagDescription))
                .ForMember(x => x.MetaTagKeywords, op => op.ResolveUsing(dc => dc.SEOContent.MetaTagKeywords))
                .ForMember(x => x.SEOFriendlyUrl, op => op.ResolveUsing(dc => dc.SEOContent.SEOFriendlyUrl))
                .ForMember(x => x.ProductInCatalogs, op => op.ResolveUsing(dc => dc.ProductInCatalogs))
                .ForMember(x => x.Properties, op => op.ResolveUsing(dc => dc.Properties))
                .ForMember(x => x.Options, op => op.ResolveUsing(dc => dc.Options))
                .ForMember(x => x.ProductImages, op => op.ResolveUsing(dc => dc.Content.ProductImages))

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

            Mapper.CreateMap<Product, ProductAdmin.Contracts.Product>()
                .ForMember(x => x.BundledProducts, opt => opt.ResolveUsing(x => x.BundledProducts))
                .ForMember(dc => dc.InventoryInfo, op => op.ResolveUsing(p => new ProductAdmin.Contracts.ProductInventoryInfo() { ManageStock = p.ManageStock, OutOfStockBehavior = string.IsNullOrEmpty(p.OutOfStockBehavior) ? "DisplayMessage" : p.OutOfStockBehavior }))
                .ForMember(dc => dc.ProductCode, op => op.ResolveUsing(p => p.ProductCode))
                .ForMember(x => x.ProductUsage, op => op.ResolveUsing(x => x.ProductUsage))
                .ForMember(dc => dc.Properties, op => op.ResolveUsing(p => p.Properties))
                .ForMember(dc => dc.Options, op => op.ResolveUsing(p => p.Options))
                .ForMember(x => x.Extras, op => op.ResolveUsing(dc => dc.Extras.Where(x => x.Values != null && x.Values.Count > 0).ToList()))
                .ForMember(dc => dc.BaseProductCode, op => op.ResolveUsing(p => p.BaseProductCode))
                .ForMember(dc => dc.ProductTypeId, op => op.ResolveUsing(dc => dc.ProductTypeId))
                .ForMember(dc => dc.Content, op => op.ResolveUsing(p =>
                {
                    var images = Mapper.Map<List<ProductAdmin.Contracts.ProductLocalizedImage>>(p.ProductImages);
                    return new ProductAdmin.Contracts.ProductLocalizedContent
                    {
                        ProductName = p.ProductName,
                        ProductShortDescription = p.ProductShortDescription,
                        ProductFullDescription = p.ProductFullDescription,
                        ProductImages = images
                    };
                }))
                .ForMember(dc => dc.SEOContent, op => op.ResolveUsing(p =>
                {
                    return new ProductAdmin.Contracts.ProductLocalizedSEOContent()
                    {
                        MetaTagDescription = p.MetaTagDescription,
                        MetaTagKeywords = p.MetaTagKeywords,
                        MetaTagTitle = p.MetaTagTitle,
                        SEOFriendlyUrl = p.SEOFriendlyUrl
                    };
                }))
                .ForMember(dc => dc.Price, op => op.ResolveUsing(p =>
                    new ProductAdmin.Contracts.ProductPrice()
                    {
                        ISOCurrencyCode = "USD",
                        // ListPrice = p.ListPrice,
                        Price = p.Price,
                        SalePrice = p.SalePrice
                    }
                    ))
                .ForMember(x => x.PackageHeight, op => op.ResolveUsing(x => new Measurement { Unit = "in", Value = x.PackageHeight }))
                .ForMember(x => x.PackageLength, op => op.ResolveUsing(x => new Measurement { Unit = "in", Value = x.PackageLength }))
                .ForMember(x => x.PackageWidth, op => op.ResolveUsing(x => new Measurement { Unit = "in", Value = x.PackageWidth }))
                .ForMember(x => x.PackageWeight, op => op.ResolveUsing(x => x.PackageWeight == null ? new Measurement { Unit = "lbs", Value = 0 } : new Measurement { Unit = "lbs", Value = x.PackageWeight }))
                .AfterMap((x, y) =>
                {
                    if (y.Properties != null)
                    {
                        y.Properties = y.Properties.Where(p => p.Values != null && p.Values.Count > 0 && p.Values.Any(v => v.Value != null)).ToList();

                    }
                })
                ;


            Mapper.CreateMap<ProductAdmin.Contracts.ProductProperty, ProductProperty>()
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




            Mapper.CreateMap<ProductProperty, ProductAdmin.Contracts.ProductProperty>()
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
                        var ppv = new ProductAdmin.Contracts.ProductPropertyValue()
                        {
                            Value = v

                        };
                        if (v != null && v is string)
                        {
                            var vStr = (string)v;
                            ppv.Content = new ProductAdmin.Contracts.ProductPropertyValueLocalizedContent()
                            {
                                StringValue = vStr
                            };
                            // value can't be longer than 50 chars
                            if (vStr.Length > PerfUtil.MAX_ATTRIBUTE_VALUE_LENGTH)
                            {
                                ppv.Value = vStr.Substring(0, PerfUtil.MAX_ATTRIBUTE_VALUE_LENGTH);
                            }
                        }
                        return ppv;
                    }).ToList();
                }));


            Mapper.CreateMap<ProductAdmin.Contracts.ProductOption, ProductProperty>()
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




            Mapper.CreateMap<ProductProperty, ProductAdmin.Contracts.ProductOption>()
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
                        var ppv = new ProductAdmin.Contracts.ProductOptionValue()
                        {
                            Value = v

                        };

                        return ppv;
                    }).ToList();
                }));


            Mapper.CreateMap<ProductVariation, ProductAdmin.Contracts.ProductVariation>();
            Mapper.CreateMap<ProductAdmin.Contracts.ProductVariation, ProductVariation>();


            Mapper.CreateMap<ProductVariationOption, ProductAdmin.Contracts.ProductVariationOption>();
            Mapper.CreateMap<ProductAdmin.Contracts.ProductVariationOption, ProductVariationOption>();



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



            Mapper.CreateMap<ProductAdmin.Contracts.ProductInCatalogInfo, ProductInCatalogInfo>()
                .ForMember(x => x.CatalogId, op => op.ResolveUsing(dc => dc.CatalogId))
                .ForMember(x => x.ProductCategories, op => op.ResolveUsing(dc => dc.ProductCategories.Select(x => x.CategoryId).ToList()))
                .ForMember(x => x.IsPriceOverridden, op => op.ResolveUsing(dc => dc.IsContentOverridden))
                .ForMember(x => x.ProductName, op => op.ResolveUsing(dc => dc.Content.ProductName))
                .ForMember(x => x.ProductShortDescription, op => op.ResolveUsing(dc => dc.Content.ProductShortDescription))
                .ForMember(x => x.ProductFullDescription, op => op.ResolveUsing(dc => dc.Content.ProductFullDescription))
                .ForMember(x => x.IsPriceOverridden, op => op.ResolveUsing(dc => dc.IsPriceOverridden))
                .ForMember(x => x.Price, op => op.ResolveUsing(dc => dc.Price.Price))
                .ForMember(x => x.SalePrice, op => op.ResolveUsing(dc => dc.Price.SalePrice))
                .ForMember(x => x.IsSEOContentOverridden, op => op.ResolveUsing(dc => dc.IsSEOContentOverridden))
                .ForMember(x => x.MetaTagTitle, op => op.ResolveUsing(dc => dc.SEOContent.MetaTagTitle))
                .ForMember(x => x.MetaTagDescription, op => op.ResolveUsing(dc => dc.SEOContent.MetaTagDescription))
                .ForMember(x => x.MetaTagKeywords, op => op.ResolveUsing(dc => dc.SEOContent.MetaTagKeywords))
                .ForMember(x => x.SEOFriendlyUrl, op => op.ResolveUsing(dc => dc.SEOContent.SEOFriendlyUrl))
                .ForMember(x => x.ProductImages, op => op.ResolveUsing(dc => dc.Content.ProductImages))
                ;

            Mapper.CreateMap<ProductInCatalogInfo, ProductAdmin.Contracts.ProductInCatalogInfo>()
                .ForMember(dc => dc.CatalogId, op => op.ResolveUsing(pisi => pisi.CatalogId))
                .ForMember(x => x.ProductCategories, op => op.ResolveUsing(pisi => pisi.ProductCategories.Select(catid => new ProductAdmin.Contracts.ProductCategory() { CategoryId = catid }).ToArray()))
                .ForMember(dc => dc.IsContentOverridden, op => op.ResolveUsing(pisi => pisi.IsContentOverridden))
                .ForMember(dc => dc.IsPriceOverridden, op => op.ResolveUsing(pisi => pisi.IsPriceOverridden))
                .ForMember(dc => dc.IsSEOContentOverridden, op => op.ResolveUsing(pisi => pisi.IsSEOContentOverridden))
                .ForMember(dc => dc.Content, op => op.ResolveUsing(pisi =>
                {
                    List<ProductAdmin.Contracts.ProductLocalizedImage> images = Mapper.Map<List<ProductAdmin.Contracts.ProductLocalizedImage>>(pisi.ProductImages);
                    return new ProductAdmin.Contracts.ProductLocalizedContent
                    {
                        ProductName = pisi.ProductName,
                        ProductShortDescription = pisi.ProductShortDescription,
                        ProductFullDescription = pisi.ProductFullDescription,
                        ProductImages = images
                    };
                }))
                .ForMember(dc => dc.Price, op => op.ResolveUsing(p =>
                    new ProductAdmin.Contracts.ProductPrice
                    {
                        ISOCurrencyCode = "USD",
                        // ListPrice = p.ListPrice,
                        Price = p.Price,
                        SalePrice = p.SalePrice
                    }
                    ))
                .ForMember(dc => dc.SEOContent, op => op.ResolveUsing(piso =>
                    new ProductAdmin.Contracts.ProductLocalizedSEOContent
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

            Mapper.CreateMap<ProductLocalizedImage, ProductAdmin.Contracts.ProductLocalizedImage>()
                .ForMember(x => x.CmsId, opt => opt.ResolveUsing(x => x.CmsId))
                .ForMember(x => x.Sequence, op => op.Ignore())
                .ForMember(x => x.ImageUrl, opt => opt.ResolveUsing(x => string.IsNullOrEmpty(x.CmsId) ? x.ImageUrl : null));

            Mapper.CreateMap<ProductAdmin.Contracts.ProductLocalizedImage, ProductLocalizedImage>()
                .ForMember(x => x.CmsId, opt => opt.ResolveUsing(x => x.CmsId));


            Mapper.CreateMap<Mozu.Core.Api.Contracts.Measurement, UnitOfMeasure>();
            Mapper.CreateMap<UnitOfMeasure, Mozu.Core.Api.Contracts.Measurement>();

            Mapper.CreateMap<ProductExtra, ProductAdmin.Contracts.ProductExtra>();
            Mapper.CreateMap<ProductAdmin.Contracts.ProductExtra, ProductExtra>();

            Mapper.CreateMap<ProductExtraValue, ProductAdmin.Contracts.ProductExtraValue>()
                .ForMember(x => x.DeltaPrice, op => op.ResolveUsing(x => new ProductAdmin.Contracts.ProductExtraValueDeltaPrice()
                {
                    CurrencyCode = "usd",
                    DeltaPrice = x.DeltaPrice
                }));

            Mapper.CreateMap<ProductAdmin.Contracts.ProductExtraValue, ProductExtraValue>()
                .ForMember(x => x.DeltaPrice, op => op.ResolveUsing(x => x.DeltaPrice.DeltaPrice));




            Mapper.CreateMap<ProductAdmin.Contracts.ProductVariation, ProductVariation>()
                //.ForMember(x => x.Options, op => op.ResolveUsing(x => x.Options))
                .ForMember(x => x.DeltaPriceValue, op => op.ResolveUsing(x => x.DeltaPrice.Value ));
            Mapper.CreateMap<ProductVariation, ProductAdmin.Contracts.ProductVariation>()
                .ForMember(x => x.DeltaPrice, op => op.ResolveUsing(x => new ProductAdmin.Contracts.ProductVariationDeltaPrice() { CurrencyCode = "usd", Value = x.DeltaPriceValue }));

            Mapper.CreateMap<ProductAdmin.Contracts.ProductVariationOption, ProductVariationOption>();
            Mapper.CreateMap<ProductVariationOption, ProductAdmin.Contracts.ProductVariationOption>();




            Mapper.CreateMap<Mozu.ProductAdmin.Contracts.LocationInventory, LocationWithInventory>();
        }

        #endregion setup

        [Test, Ignore]
        public void ResolveUsing_With_Complex_Object_Without_Null_Checks_Perf_Test()
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