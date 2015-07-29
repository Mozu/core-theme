using AutoMapper;
//using Volusion.ProductAdmin.Contracts;
//using DC = Volusion.ProductAdmin.Contracts;
using Mozu.Core.Api.Contracts;
using System.Collections.Generic;
using System.Linq;
using DC = Mozu.ProductAdmin.Contracts;
using Product = Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels.Product;
using ProductProperty = Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels.ProductProperty ;
using Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    //todo: what if we split into methods like Order mapping? Greg Murray on 2014-01-28 
    public class ProductMapping : Profile
    {
        private const int MAX_ATTRIBUTE_VALUE_LENGTH = 50;
     //   private const string DEFAULT_CURRENCY_CODE = "USD";

        public override string ProfileName
        {
            get
            {
                return this.GetType().FullName;
            }
        }
        protected override void Configure()
        {

            var NULLCONTENT = new DC.ProductLocalizedContent();
            var NULLPRICE = new DC.ProductPrice();
            var NULLPUB = new DC.ProductPublishingInfo();
            var NULLPRICEBEHAVE = new DC.ProductPricingBehaviorInfo();
            var NULLSUPPLIER = new DC.ProductSupplierInfo();
            var NULLPRODVARPRICE = new DC.ProductVariationDeltaPrice();
            var NULLCOST = new DC.ProductCost();

            Mapper.CreateMap<DC.BundledProduct, BundledProduct>()
                  .ForMember(x => x.SalePrice, opt => opt.ResolveUsing(x => (x.Price != null) ? x.Price.SalePrice : null))
                  .ForMember(x => x.Price, opt => opt.ResolveUsing(x => (x.Price != null) ? x.Price.Price : null))
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
                //ignores
                .ForMember(x => x.Price, opt => opt.Ignore())
                .ForMember(x => x.PackageWeight, opt => opt.Ignore())
                .ForMember(x => x.PackageHeight, opt => opt.Ignore())
                .ForMember(x => x.PackageLength, opt => opt.Ignore())
                .ForMember(x => x.PackageWidth, opt => opt.Ignore());


            Mapper.CreateMap<DC.Product, Product>()
                .ForMember(x => x.BundledProducts, opt => opt.ResolveUsing(x=>x.BundledProducts))
                .ForMember(x => x.OutOfStockBehavior , op=> op.ResolveUsing(dc => (dc.InventoryInfo ?? new DC.ProductInventoryInfo()).OutOfStockBehavior  ))
                .ForMember(x => x.ManageStock, op => op.ResolveUsing(dc => (dc.InventoryInfo ?? new DC.ProductInventoryInfo()).ManageStock ))
                .ForMember(x => x.ProductUsage, op => op.ResolveUsing(x => x.ProductUsage))
                .ForMember(x => x.PublishedState, op => op.ResolveUsing(dc => (dc.PublishingInfo?? NULLPUB).PublishedState ))
                .ForMember(x => x.PublishSetCode, op => op.ResolveUsing(dc => (dc.PublishingInfo?? NULLPUB).PublishSetCode ))
                .ForMember(x => x.LastModifiedBy, op => op.ResolveUsing(dc => (dc.AuditInfo != null)
                    ? dc.AuditInfo.UpdateBy : null))
                .ForMember(x => x.LastModifiedDate, op => op.ResolveUsing(dc => (dc.AuditInfo != null)
                    ? dc.AuditInfo.UpdateDate : null))
                .ForMember(x => x.LastPublishedBy, op => op.ResolveUsing(dc => (dc.PublishingInfo ?? NULLPUB).LastPublishedBy))
                .ForMember(x => x.LastPublishedDate, op => op.ResolveUsing(dc => (dc.PublishingInfo ?? NULLPUB).LastPublishedDate))
                .ForMember(x => x.ProductCode, op => op.ResolveUsing(dc => dc.ProductCode))
                .ForMember(x => x.BaseProductCode, op => op.ResolveUsing(dc => dc.BaseProductCode))
                .ForMember(x => x.Extras , op => op.ResolveUsing(dc => dc.Extras == null
                    ? null : dc.Extras.Where( x=> x.Values != null && x.Values.Count >  0).ToList()))

                .ForMember(x => x.HasConfigurableOptions, op => op.ResolveUsing(dc => dc.HasConfigurableOptions))
                .ForMember(x => x.HasStandaloneOptions, op => op.ResolveUsing(dc => dc.HasStandAloneOptions))

                .ForMember(x => x.ProductName, op => op.ResolveUsing(dc => (dc.Content ?? NULLCONTENT).ProductName))
                .ForMember(x => x.ProductShortDescription, op => op.ResolveUsing(dc => (dc.Content ?? NULLCONTENT).ProductShortDescription))
                .ForMember(x => x.ProductFullDescription, op => op.ResolveUsing(dc => (dc.Content ?? NULLCONTENT).ProductFullDescription))

                .ForMember(x => x.Price, op => op.ResolveUsing(dc => (dc.Price ?? NULLPRICE).Price))
                .ForMember(x => x.SalePrice, op => op.ResolveUsing(dc => (dc.Price ?? NULLPRICE).SalePrice))
                .ForMember(x => x.MSRP, op => op.ResolveUsing(dc => (dc.Price ?? NULLPRICE).MSRP))
                .ForMember(x => x.MAP, op => op.ResolveUsing(dc => (dc.Price ?? NULLPRICE).MAP))
                .ForMember(x => x.MAPStartDate, op => op.ResolveUsing(dc => (dc.Price ?? NULLPRICE).MAPStartDate))
                .ForMember(x => x.MAPEndDate, op => op.ResolveUsing(dc => (dc.Price ?? NULLPRICE).MAPEndDate))
                .ForMember(x => x.CreditValue, op => op.ResolveUsing(dc => (dc.Price ?? NULLPRICE).CreditValue))            
                
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

                .ForMember(x => x.IsPackagedStandAlone, op => op.ResolveUsing(dc => dc.IsPackagedStandAlone == null ? null : dc.IsPackagedStandAlone))
                .ForMember(x => x.StandAlonePackageType, op => op.ResolveUsing(dc => dc.StandAlonePackageType == null ? null : dc.StandAlonePackageType))


                .ForMember(x => x.MetaTagTitle, op => op.ResolveUsing(dc => dc.SEOContent == null ? null : dc.SEOContent.MetaTagTitle))
                .ForMember(x => x.MetaTagDescription, op => op.ResolveUsing(dc => dc.SEOContent == null ? null : dc.SEOContent.MetaTagDescription))
                .ForMember(x => x.MetaTagKeywords, op => op.ResolveUsing(dc => dc.SEOContent == null ? null : dc.SEOContent.MetaTagKeywords))
                .ForMember(x => x.SEOFriendlyUrl, op => op.ResolveUsing(dc => dc.SEOContent == null ? null : dc.SEOContent.SEOFriendlyUrl))
                .ForMember(x => x.ProductInCatalogs, op => op.ResolveUsing(dc => dc.ProductInCatalogs ))
                .ForMember( x=> x.Properties , op=> op.ResolveUsing(dc=> dc.Properties ))
                .ForMember(x => x.Options, op => op.ResolveUsing(dc => dc.Options))
                .ForMember(x => x.ProductImages, op => op.ResolveUsing(dc => (dc.Content ?? NULLCONTENT).ProductImages))
                .ForMember(x => x.DiscountsRestricted, op => op.ResolveUsing(dc => (dc.PricingBehavior ?? NULLPRICEBEHAVE).DiscountsRestricted))
                .ForMember(x => x.DiscountsRestrictedStartDate, op => op.ResolveUsing(dc => (dc.PricingBehavior ?? NULLPRICEBEHAVE).DiscountsRestrictedStartDate))
                .ForMember(x => x.DiscountsRestrictedEndDate, op => op.ResolveUsing(dc => (dc.PricingBehavior ?? NULLPRICEBEHAVE).DiscountsRestrictedEndDate))
                .ForMember(x => x.MfgPartNumber, op => op.ResolveUsing(dc => (dc.SupplierInfo ?? NULLSUPPLIER).MfgPartNumber))
                .ForMember(x => x.DistPartNumber, op => op.ResolveUsing(dc => (dc.SupplierInfo ?? NULLSUPPLIER).DistPartNumber))
                .ForMember(x => x.MfgPartNumber, op => op.ResolveUsing(dc => (dc.SupplierInfo ?? NULLSUPPLIER).MfgPartNumber))
                .ForMember(x => x.DistPartNumber, op => op.ResolveUsing(dc => (dc.SupplierInfo ?? NULLSUPPLIER).DistPartNumber))
                .ForMember(x => x.CostCurrencyCode, op => op.ResolveUsing(dc => (dc.SupplierInfo != null && dc.SupplierInfo.Cost != null)
                    ? dc.SupplierInfo.Cost.ISOCurrencyCode
                    : "USD"))   //todo:add to UI 
                .ForMember(x => x.Cost, op => op.ResolveUsing(dc => (dc.SupplierInfo != null && dc.SupplierInfo.Cost != null)
                    ? dc.SupplierInfo.Cost.Cost
                    : NULLCOST.Cost))

                //ignores
                .ForMember(x => x.ProductTypeName, op => op.Ignore())
                .ForMember(m => m.ListPrice, op => op.Ignore())
                .ForMember(m => m.StockOnHand, op => op.Ignore())
                .ForMember(m => m.StockOnHandAdjustment, op => op.Ignore())
                .ForMember(m => m.IsHiddenWhenOutOfStock, op => op.Ignore())
                .ForMember(m => m.IsBackOrderAllowed, op => op.Ignore())
                .ForMember(m => m.PublishSetName, op => op.Ignore())
                .ForMember(m => m.PublishSetDate, op => op.Ignore())

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
                .ForMember(dc => dc.InventoryInfo, op => op.ResolveUsing(p =>
                    new DC.ProductInventoryInfo()
                    {
                        ManageStock = p.ManageStock,
                        OutOfStockBehavior = string.IsNullOrEmpty( p.OutOfStockBehavior)
                        ? "DisplayMessage" : p.OutOfStockBehavior
                    }))
                .ForMember(dc => dc.ProductCode, op => op.ResolveUsing(p => p.ProductCode))
                .ForMember(x => x.ProductUsage, op => op.ResolveUsing(x => x.ProductUsage))
                .ForMember(dc => dc.Properties, op => op.ResolveUsing(p => p.Properties))
                .ForMember(dc => dc.Options, op => op.ResolveUsing(p => p.Options))
                .ForMember(x => x.Extras, op => op.ResolveUsing(dc => dc.Extras == null
                    ? null : dc.Extras.Where(x => x.Values != null && x.Values.Count > 0).ToList()))
                .ForMember(dc => dc.BaseProductCode, op => op.ResolveUsing(p => p.BaseProductCode))
                .ForMember(dc => dc.ProductTypeId, op => op.ResolveUsing(dc => dc.ProductTypeId))
                .ForMember(dc => dc.UPC, op => op.ResolveUsing(x => x.UPC))
                .ForMember(dc => dc.IsPackagedStandAlone, op => op.ResolveUsing(x => x.IsPackagedStandAlone))
                .ForMember(dc => dc.StandAlonePackageType, op => op.ResolveUsing(x => x.StandAlonePackageType))                

                .ForMember(dc => dc.Content, op => op.ResolveUsing(p =>
                {
                    var images = Mapper.Map<List<DC.ProductLocalizedImage>>(p.ProductImages );
                    return new DC.ProductLocalizedContent
                    {
                        ProductName = p.ProductName,
                        ProductShortDescription = p.ProductShortDescription,
                        ProductFullDescription = p.ProductFullDescription,
                        ProductImages = images
                    };
                }))
                 .ForMember(dc => dc.SEOContent , op => op.ResolveUsing(p =>
                 {
                     return new DC.ProductLocalizedSEOContent()
                     {
                         MetaTagDescription = p.MetaTagDescription ,
                         MetaTagKeywords = p.MetaTagKeywords,
                         MetaTagTitle = p.MetaTagTitle ,
                         SEOFriendlyUrl = p.SEOFriendlyUrl
                     };
                 }))
                .ForMember(dc => dc.Price, op => op.ResolveUsing(p =>
                    new DC.ProductPrice()
                    {
                      //  ISOCurrencyCode = DEFAULT_CURRENCY_CODE,
                        // ListPrice = p.ListPrice,
                        Price = p.Price,
                        SalePrice = p.SalePrice,
                        MSRP = p.MSRP,
                        MAP = p.MAP,
                        MAPStartDate = p.MAPStartDate,
                        MAPEndDate = p.MAPEndDate,
                        CreditValue = p.CreditValue
                    }
                ))
                .ForMember(dc => dc.SupplierInfo, op => op.ResolveUsing(x =>
                    new DC.ProductSupplierInfo()
                    {
                        DistPartNumber = x.DistPartNumber,
                        MfgPartNumber = x.MfgPartNumber,
                        Cost = new DC.ProductCost()
                        {
                            ISOCurrencyCode = x.CostCurrencyCode,
                            Cost = x.Cost
                        }
                    }
                ))
                .ForMember(dc => dc.PublishingInfo, op => op.ResolveUsing(x => (string.IsNullOrEmpty(x.PublishSetCode)) 
                    ? null
                    : new DC.ProductPublishingInfo()
                        {
                            PublishSetCode = x.PublishSetCode,
                            PublishedState = x.PublishedState,
                            LastPublishedBy = x.LastPublishedBy,
                            LastPublishedDate = x.LastPublishedDate
                        }
                ))
                .ForMember(x => x.PackageHeight, op => op.ResolveUsing(x => x.PackageHeight == null
                    ? null: new Measurement { Unit = "in", Value = x.PackageHeight }))
                .ForMember(x => x.PackageLength, op => op.ResolveUsing(x => x.PackageLength == null
                    ? null : new Measurement { Unit = "in", Value = x.PackageLength }))
                .ForMember(x => x.PackageWidth, op => op.ResolveUsing(x => x.PackageWidth == null
                    ? null : new Measurement { Unit = "in", Value = x.PackageWidth }))
                .ForMember(x => x.PackageWeight, op => op.ResolveUsing(x => x.PackageWeight == null
                    ? new Measurement { Unit = "lbs", Value = 0} : new Measurement { Unit = "lbs", Value = x.PackageWeight }))
                //ignores
                .ForMember(x => x.ProductSequence, op => op.Ignore())
                .ForMember(dc => dc.IsValidForProductType, op => op.Ignore())
                .ForMember(dc => dc.ShippingClassId, op => op.Ignore())
                .ForMember(dc => dc.IsRecurring, op => op.Ignore())
                
                
                .ForMember(dc => dc.ApplicableDiscounts, op => op.Ignore())
                .ForMember(dc => dc.IsVariation, op => op.Ignore())
                .ForMember(dc => dc.VariationKey, op => op.Ignore())
                .ForMember(dc => dc.AuditInfo, op => op.Ignore())
                .ForMember(dc => dc.PricingBehavior, op => op.ResolveUsing(x => new DC.ProductPricingBehaviorInfo
                {
                    DiscountsRestricted = x.DiscountsRestricted,
                    DiscountsRestrictedStartDate = x.DiscountsRestrictedStartDate,
                    DiscountsRestrictedEndDate = x.DiscountsRestrictedEndDate,
                }))

                .AfterMap((x, y) =>
                {
                    if (y.Properties  != null)
                    {
                        y.Properties = y.Properties.Where(p => p.Values != null && p.Values.Count > 0 && p.Values.Any( v=> v.Value != null )).ToList();

                    }
                })
                ;


            Mapper.CreateMap<DC.ProductProperty, ProductProperty>()
                  .ForMember(x => x.AttributeFQN, op => op.ResolveUsing(x => x.AttributeFQN))
                  .ForMember(x => x.Values, op => op.ResolveUsing( x =>
                  {
                      if (x.Values  == null)
                      {
                          return null;
                      }
                      return x.Values.Select(v =>
                      {
                          if (v.Content != null && !string.IsNullOrWhiteSpace(v.Content.StringValue ))
                          {
                              return v.Content.StringValue;
                          }
                          return v.Value;
                      }).ToList();
                  }))

                   .ForMember(x => x.VariationExists, op => op.Ignore())
                      ;


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
                              if (string.IsNullOrEmpty(vStr))
                              {
                                  ppv.Value = null;
                              }
                          }
                          return ppv;
                      }).ToList();
                  }));


            Mapper.CreateMap<DC.ProductOption , ProductProperty>()
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
                  }))
                .ForMember(x => x.VariationExists, op => op.Ignore())
                  ;




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

            Mapper.CreateMap<ProductVariationOption, DC.ProductVariationOption>()
                //todo: confirm if need to add Content (AttributeVocabularyValueLocalizedContent) Greg Murray on 2014-01-24 
                .ForMember(dc => dc.Content, op => op.Ignore())
                ;
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



            Mapper.CreateMap<DC.ProductInCatalogInfo , ProductInCatalogInfo>()
                .ForMember(x => x.CatalogId, op => op.ResolveUsing(dc => dc.CatalogId ))
                .ForMember( x=> x.ProductCategories, op=> op.ResolveUsing( dc=> dc.ProductCategories != null
                    ? dc.ProductCategories.Select( x=> x.CategoryId ).ToList() : null))
                .ForMember(x => x.IsPriceOverridden , op => op.ResolveUsing(dc => dc.IsContentOverridden))
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
                .ForMember(x => x.MSRP, op => op.ResolveUsing(dc => (dc.Price ?? NULLPRICE).MSRP))
                .ForMember(x => x.MAP, op => op.ResolveUsing(dc => (dc.Price ?? NULLPRICE).MAP))
                .ForMember(x => x.MAPStartDate, op => op.ResolveUsing(dc => (dc.Price ?? NULLPRICE).MAPStartDate))
                .ForMember(x => x.MAPEndDate, op => op.ResolveUsing(dc => (dc.Price ?? NULLPRICE).MAPEndDate))


                .ForMember(x => x.DateFirstAvailableInCatalog, op => op.ResolveUsing(dc => (dc.DateFirstAvailableInCatalog ?? null)))
                .ForMember(x => x.ActiveStartDate, op => op.ResolveUsing(x => (x.ActiveDates != null) ? x.ActiveDates.StartDate : null))
                .ForMember(x => x.ActiveEndDate, op => op.ResolveUsing(x => (x.ActiveDates != null) ? x.ActiveDates.EndDate : null))

                .ForMember(x => x.ProductCode, op => op.Ignore())
                .ForMember(x => x.ListPrice, op => op.Ignore())
                ;

            Mapper.CreateMap<ProductInCatalogInfo, DC.ProductInCatalogInfo>()
                .ForMember(dc => dc.CatalogId, op => op.ResolveUsing(pisi => pisi.CatalogId))


                .ForMember(dc => dc.DateFirstAvailableInCatalog, op => op.ResolveUsing(pisi => pisi.DateFirstAvailableInCatalog))
                

                .ForMember(x => x.ProductCategories, op => op.ResolveUsing(pisi => pisi.ProductCategories != null
                    ? pisi.ProductCategories.Select(catid => new DC.ProductCategory() { CategoryId = catid }).ToArray()
                    : null))
                .ForMember(dc => dc.IsContentOverridden, op => op.ResolveUsing(pisi => pisi.IsContentOverridden))
                .ForMember(dc => dc.IsPriceOverridden, op => op.ResolveUsing(pisi => pisi.IsPriceOverridden))
                .ForMember(dc => dc.IsSEOContentOverridden, op => op.ResolveUsing(pisi => pisi.IsSEOContentOverridden))
                .ForMember(dc => dc.ActiveDates, op => op.ResolveUsing(x => new DC.EffectiveDates
                {
                    StartDate = x.ActiveStartDate,
                    EndDate = x.ActiveEndDate
                }))
                .ForMember(dc => dc.Content, op => op.ResolveUsing(pisi => {
                    List<DC.ProductLocalizedImage> images = Mapper.Map<List<DC.ProductLocalizedImage>>(pisi.ProductImages );
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
                      //  ISOCurrencyCode = DEFAULT_CURRENCY_CODE,
                        // ListPrice = p.ListPrice,
                        Price = p.Price,
                        SalePrice = p.SalePrice,
                        MSRP = p.MSRP,
                        MAP = p.MAP,
                        MAPStartDate = p.MAPStartDate,
                        MAPEndDate = p.MAPEndDate
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
                ))
                .ForMember(dc => dc.AuditInfo, op => op.Ignore())
                .AfterMap((info, catalogInfo) =>
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

            Mapper.CreateMap<Models.ProductModels.ProductLocalizedImage, DC.ProductLocalizedImage>()
                .ForMember(x => x.CmsId, opt => opt.ResolveUsing(x => x.CmsId))
                .ForMember(x => x.ImageUrl, opt => opt.ResolveUsing(x => string.IsNullOrEmpty(x.CmsId)
                    ? x.ImageUrl : null))

                //todo: confirm 3 new mappings Greg Murray on 2014-01-24 
                .ForMember(dc => dc.Id, op => op.ResolveUsing(x => x.ImageId))
                .ForMember(dc => dc.LocaleCode, op => op.ResolveUsing(x => x.ISOCultureCode))
                .ForMember(dc => dc.ImageLabel, op => op.ResolveUsing(x => x.Label))
                .ForMember(dc => dc.AltText, op => op.ResolveUsing(x => x.Alt))
                //ignore
                .ForMember(x => x.Sequence, op => op.Ignore())
                .ForMember(dc => dc.MediaType, op => op.Ignore())

                ;

            Mapper.CreateMap<DC.ProductLocalizedImage, Models.ProductModels.ProductLocalizedImage>()
                .ForMember(x => x.CmsId, opt => opt.ResolveUsing(x => x.CmsId))
                //todo: confirm 3 new mappings Greg Murray on 2014-01-24
                .ForMember(x => x.ISOCultureCode, op => op.ResolveUsing(dc => dc.LocaleCode))
                .ForMember(x => x.ImageId, op => op.ResolveUsing(dc => dc.Id))
                .ForMember(x => x.Alt, op => op.ResolveUsing(dc => dc.AltText))
                .ForMember(x => x.Label, op => op.ResolveUsing(dc => dc.ImageLabel))
                //ignores
                .ForMember(x => x.ProductCode, op => op.Ignore())
                ;


            Mapper.CreateMap<Mozu.Core.Api.Contracts.Measurement, UnitOfMeasure>()
                //todo: confirm unit -> symbol mappings Greg Murray on 2014-01-24 
                .ForMember(x => x.Symbol, op => op.ResolveUsing(dc => dc.Unit))
                .ForMember(x => x.Val, op => op.ResolveUsing(( Mozu.Core.Api.Contracts.Measurement dc) => dc.Value))
                ;
            Mapper.CreateMap<UnitOfMeasure, Mozu.Core.Api.Contracts.Measurement>()
                //todo: confirm Symbol -> unit mapping Greg Murray on 2014-01-24 
                .ForMember(dc => dc.Unit, op => op.ResolveUsing(x => x.Symbol))
                .ForMember(dc => dc.Value, op => op.ResolveUsing(x => x.Val))
                ;

            Mapper.CreateMap<ProductExtra, DC.ProductExtra>();
            Mapper.CreateMap<DC.ProductExtra, ProductExtra>()
                .ForMember(x => x.AttributeDetail, op => op.Ignore())
                ;

            Mapper.CreateMap<ProductExtraValue, DC.ProductExtraValue>()
                .ForMember(x => x.DeltaPrice, op => op.ResolveUsing(x => new DC.ProductExtraValueDeltaPrice()
                {
            //       CurrencyCode = DEFAULT_CURRENCY_CODE,
                    DeltaPrice = x.DeltaPrice
                }))
                .ForMember(dc => dc.LocalizedDeltaPrice, op => op.Ignore()) // todo: xverify - Greg Murray on 2014-08-28 
                ;

            Mapper.CreateMap<DC.ProductExtraValue, ProductExtraValue>()
                  .ForMember(x => x.DeltaPrice, op => op.ResolveUsing(x => x.DeltaPrice != null
                      ? x.DeltaPrice.DeltaPrice : 0));




            Mapper.CreateMap<DC.ProductVariation, ProductVariation>()
                //.ForMember(x => x.Options, op => op.ResolveUsing(x => x.Options))
                .ForMember(x => x.DeltaPriceValue, op => op.ResolveUsing(dc => (dc.DeltaPrice ?? NULLPRODVARPRICE).Value))
                .ForMember(x => x.DeltaMSRP, op => op.ResolveUsing(dc => (dc.DeltaPrice ?? NULLPRODVARPRICE).MSRP))
                .ForMember(x => x.CreditValue, op => op.ResolveUsing(dc => (dc.DeltaPrice ?? NULLPRODVARPRICE).CreditValue))
                .ForMember(x => x.DistPartNumber, op => op.ResolveUsing(dc => (dc.SupplierInfo ?? NULLSUPPLIER).DistPartNumber))
                .ForMember(x => x.MfgPartNumber, op => op.ResolveUsing(dc => (dc.SupplierInfo ?? NULLSUPPLIER).MfgPartNumber))
                .ForMember(x => x.CostCurrencyCode, op => op.ResolveUsing(dc => (dc.SupplierInfo != null && dc.SupplierInfo.Cost != null)
                    ? dc.SupplierInfo.Cost.ISOCurrencyCode
                    : "USD"))
                .ForMember(x => x.DeltaCost, op => op.ResolveUsing(dc => (dc.SupplierInfo != null && dc.SupplierInfo.Cost != null)
                    ? dc.SupplierInfo.Cost.Cost
                    : NULLCOST.Cost))
                .ForMember(x => x.StockOnHand, op => op.Ignore())
                .ForMember(x => x.StockOnOrder, op => op.Ignore())
                ;

            Mapper.CreateMap<ProductVariation, DC.ProductVariation>()
                .ForMember(x => x.DeltaPrice, op => op.ResolveUsing(x => x.DeltaPriceValue.HasValue
                    ? new DC.ProductVariationDeltaPrice()
                    {
                 //       CurrencyCode = DEFAULT_CURRENCY_CODE,
                        Value = x.DeltaPriceValue,
                        MSRP = x.DeltaMSRP,
                        CreditValue = x.CreditValue
                    } : null))
                .ForMember(dc => dc.SupplierInfo, op => op.ResolveUsing(x => new DC.ProductSupplierInfo()
                {
                    DistPartNumber = x.DistPartNumber,
                    MfgPartNumber = x.MfgPartNumber,
                    Cost = new DC.ProductCost()
                    {
                        ISOCurrencyCode = x.CostCurrencyCode,
                        Cost = x.DeltaCost
                    }
                }))
                .ForMember(dc => dc.LocalizedDeltaPrice, op => op.Ignore()) // todo: xverify - Greg Murray on 2014-08-26
                ;

            Mapper.CreateMap<ProductAdmin.Contracts.ProductCodeRename, ProductCodeRename>();
            Mapper.CreateMap<ProductCodeRename, ProductAdmin.Contracts.ProductCodeRename>();

            Mapper.CreateMap<Mozu.ProductAdmin.Contracts.LocationInventory, LocationWithInventory>()
                .ForMember(x => x.Location, op => op.Ignore())
                .ForMember(x => x.Fulfillment, op => op.Ignore())
                ;

        }

        object OptionValuesResolver (DC.Product p)
        {
            if (p.VariationOptions != null && p.VariationOptions.Count > 0)
            {
                return string.Join(", ", p.VariationOptions.Where( x=> x.Value != null).Select(x =>  x.Value.ToString()  ));
            }
            return null;
        }

    }



}
