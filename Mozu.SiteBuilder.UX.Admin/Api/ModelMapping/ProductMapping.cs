using AutoMapper;
//using Volusion.ProductAdmin.Contracts;
//using DC = Volusion.ProductAdmin.Contracts;
using Mozu.Core.Api.Contracts;

using System.Collections.Generic;
using System.Linq;
using DC = Mozu.ProductAdmin.Contracts;
using Product = Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels.Product;
using ProductProperty = Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels.ProductProperty ;

using ProductInSiteInfo = Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels.ProductInSiteInfo;
using Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class ProductMapping : Profile
    {
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


            Mapper.CreateMap<DC.Product, Product>()
                .ForMember(x => x.ProductCode, op => op.MapFrom(dc => dc.ProductCode))
                .ForMember(x => x.BaseProductCode, op => op.MapFrom(dc => dc.BaseProductCode))
                .ForMember(x => x.ProductName, op => op.MapFrom(dc => (dc.Content ?? NULLCONTENT).ProductName))
                .ForMember(x => x.ProductShortDescription, op => op.MapFrom(dc => (dc.Content ?? NULLCONTENT).ProductShortDescription))
                .ForMember(x => x.ProductFullDescription, op => op.MapFrom(dc => (dc.Content ?? NULLCONTENT).ProductFullDescription))
                //.ForMember(x => x.ListPrice, op => op.MapFrom(dc => (dc.Price ?? NULLPRICE).ListPrice))
                .ForMember(x => x.Price, op => op.MapFrom(dc => (dc.Price ?? NULLPRICE).Price))
                .ForMember(x => x.SalePrice, op => op.MapFrom(dc => (dc.Price ?? NULLPRICE).SalePrice))
                .ForMember(x => x.StockOnHand, op => op.MapFrom(dc => dc.StockOnHand))
                .ForMember(x => x.IsHiddenWhenOutOfStock, op => op.MapFrom(dc => dc.IsHiddenWhenOutOfStock))
                .ForMember(x => x.ProductTypeId, op => op.MapFrom(dc => dc.ProductTypeId))

                .ForMember(x => x.IsBackOrderAllowed, op => op.MapFrom(dc => dc.IsBackOrderAllowed))
                .ForMember(x => x.PackageWeight, op => op.MapFrom(dc => dc.PackageWeight == null ? null : dc.PackageWeight.Value))
                .ForMember(x => x.PackageHeight, op => op.MapFrom(dc => dc.PackageHeight == null ? null : dc.PackageHeight.Value))
                .ForMember(x => x.PackageLength, op => op.MapFrom(dc => dc.PackageLength == null ? null : dc.PackageLength.Value))
                .ForMember(x => x.PackageWidth, op => op.MapFrom(dc => dc.PackageWidth == null ? null : dc.PackageWidth.Value))
                .ForMember(x => x.MetaTagTitle, op => op.MapFrom(dc => dc.SEOContent == null ? null : dc.SEOContent.MetaTagTitle))
                .ForMember(x => x.MetaTagDescription, op => op.MapFrom(dc => dc.SEOContent == null ? null : dc.SEOContent.MetaTagDescription))
                .ForMember(x => x.MetaTagKeywords, op => op.MapFrom(dc => dc.SEOContent == null ? null : dc.SEOContent.MetaTagKeywords))
                .ForMember(x => x.SEOFriendlyUrl, op => op.MapFrom(dc => dc.SEOContent == null ? null : dc.SEOContent.SEOFriendlyUrl))
                .ForMember(x => x.ProductInSites, op => op.MapFrom(dc => dc.ProductInSites))
                .ForMember( x=> x.Properties , op=> op.MapFrom(dc=> dc.Properties ))
                .ForMember(x => x.Options, op => op.MapFrom(dc => dc.Options))
                .ForMember(x => x.ProductImages, op => op.MapFrom(dc => (dc.Content ?? NULLCONTENT).ProductImages))
                .AfterMap((x, y) =>
                    {
                        if (y.ProductInSites != null)
                        {
                            y.ProductInSites.Each(p => p.ProductCode = y.ProductCode);
                        }
                    })
                ;

            Mapper.CreateMap<Product, DC.Product>()
                .ForMember(dc => dc.ProductCode, op => op.MapFrom(p => p.ProductCode))
                .ForMember(dc => dc.Properties, op => op.MapFrom(p => p.Properties))
                .ForMember(dc => dc.Options, op => op.MapFrom(p => p.Options))
                .ForMember(dc => dc.BaseProductCode, op => op.MapFrom(p => p.BaseProductCode))
                .ForMember(dc => dc.ProductTypeId, op => op.MapFrom(dc => dc.ProductTypeId))
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
                .ForMember(dc => dc.Price, op => op.MapFrom(p =>
                    new DC.ProductPrice()
                    {
                        ISOCurrencyCode = "USD",
                        // ListPrice = p.ListPrice,
                        Price = p.Price,
                        SalePrice = p.SalePrice
                    }
                ))
                .ForMember(x => x.PackageHeight, op => op.MapFrom(x => x.PackageHeight == null ? null: new Measurement { Unit = "in", Value = x.PackageHeight }))
                .ForMember(x => x.PackageLength, op => op.MapFrom(x => x.PackageLength == null ? null : new Measurement { Unit = "in", Value = x.PackageLength }))
                .ForMember(x => x.PackageWidth, op => op.MapFrom(x => x.PackageWidth == null ? null : new Measurement { Unit = "in", Value = x.PackageWidth }))
                .ForMember(x => x.PackageWeight, op => op.MapFrom(x => x.PackageWeight == null ? new Measurement { Unit = "lbs", Value = 0} : new Measurement { Unit = "lbs", Value = x.PackageWeight }))
                ;

            Mapper.CreateMap<DC.ProductProperty, ProductProperty>()
                  .ForMember(x => x.AttributeFQN, op => op.MapFrom(x => x.AttributeFQN))
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
                      }));




            Mapper.CreateMap<ProductProperty, DC.ProductProperty>()
                  //.ForMember(x => x., op => op.Ignore())
                  .ForMember(x => x.AttributeFQN, op => op.MapFrom(x => x.AttributeFQN))
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
                                   ppv.Content = new DC.ProductPropertyValueLocalizedContent()
                                                     {
                                                         StringValue = (string) v
                                                     };
                               }
                               return ppv;
                           }).ToList();
                   }));


            Mapper.CreateMap<DC.ProductOption , ProductProperty>()
                  .ForMember(x => x.AttributeFQN, op => op.MapFrom(x => x.AttributeFQN))
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
                  .ForMember(x => x.AttributeFQN, op => op.MapFrom(x => x.AttributeFQN))
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
                              ppv.Content = new DC.ProductPropertyValueLocalizedContent()
                              {
                                  StringValue = (string)v
                              };
                          }
                          return ppv;
                      }).ToList();
                  }));


            Mapper.CreateMap<ProductVariation, DC.ProductVariation>();
            Mapper.CreateMap<DC.ProductVariation, ProductVariation>();

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
            //      .ForMember(x => x.Value, op => op.MapFrom(x => x.Value))
            //      .ForMember(x => x.LocalizedValue, op => op.ResolveUsing(x =>
            //          {
            //              if (x.Content != null)
            //              {
            //                  return x.Content.StringValue;
            //              }
            //              return null;
            //          }));
            


            Mapper.CreateMap<DC.ProductInSiteInfo, ProductInSiteInfo>()
                .ForMember(x => x.SiteId, op => op.MapFrom(dc => dc.SiteId))
                .ForMember( x=> x.ProductCategories, op=> op.MapFrom( dc=> dc.ProductCategories != null ? dc.ProductCategories.Select( x=> x.CategoryId ).ToList() : null))
                .ForMember(x => x.IsPriceOverridden , op => op.MapFrom(dc => dc.IsContentOverridden))
                .ForMember(x => x.ProductName, op => op.MapFrom(dc => (dc.Content ?? NULLCONTENT).ProductName))
                .ForMember(x => x.ProductShortDescription, op => op.MapFrom(dc => (dc.Content ?? NULLCONTENT).ProductShortDescription))
                .ForMember(x => x.ProductFullDescription, op => op.MapFrom(dc => (dc.Content ?? NULLCONTENT).ProductFullDescription))
                .ForMember(x => x.IsPriceOverridden, op => op.MapFrom(dc => dc.IsPriceOverridden))
                .ForMember(x => x.Price, op => op.MapFrom(dc => (dc.Price ?? NULLPRICE).Price))
                .ForMember(x => x.SalePrice, op => op.MapFrom(dc => (dc.Price ?? NULLPRICE).SalePrice))
                .ForMember(x => x.IsSEOContentOverridden, op => op.MapFrom(dc => dc.IsSEOContentOverridden))
                .ForMember(x => x.MetaTagTitle, op => op.MapFrom(dc => dc.SEOContent == null ? null : dc.SEOContent.MetaTagTitle))
                .ForMember(x => x.MetaTagDescription, op => op.MapFrom(dc => dc.SEOContent == null ? null : dc.SEOContent.MetaTagDescription))
                .ForMember(x => x.MetaTagKeywords, op => op.MapFrom(dc => dc.SEOContent == null ? null : dc.SEOContent.MetaTagKeywords))
                .ForMember(x => x.SEOFriendlyUrl, op => op.MapFrom(dc => dc.SEOContent == null ? null : dc.SEOContent.SEOFriendlyUrl))
                .ForMember(x => x.ProductImages, op => op.MapFrom(dc => (dc.Content ?? NULLCONTENT).ProductImages))
                ;

            Mapper.CreateMap<ProductInSiteInfo, DC.ProductInSiteInfo>()
                .ForMember(dc => dc.SiteId, op => op.MapFrom(pisi => pisi.SiteId))
                .ForMember(x => x.ProductCategories, op => op.MapFrom(pisi => pisi.ProductCategories != null ? pisi.ProductCategories.Select(catid => new DC.ProductCategory() { CategoryId = catid }).ToArray()  : null))
                .ForMember(dc => dc.IsContentOverridden, op => op.MapFrom(pisi => pisi.IsContentOverridden))
                .ForMember(dc => dc.IsPriceOverridden, op => op.MapFrom(pisi => pisi.IsPriceOverridden))
                .ForMember(dc => dc.IsSEOContentOverridden, op => op.MapFrom(pisi => pisi.IsSEOContentOverridden))
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
                .ForMember(dc => dc.Price, op => op.MapFrom(p =>
                    new DC.ProductPrice
                    {
                        ISOCurrencyCode = "USD",
                        // ListPrice = p.ListPrice,
                        Price = p.Price,
                        SalePrice = p.SalePrice
                    }
                ))
                .ForMember(dc => dc.SEOContent, op => op.MapFrom(piso =>
                    new DC.ProductLocalizedSEOContent
                    {
                        MetaTagTitle = piso.MetaTagTitle,
                        MetaTagDescription = piso.MetaTagDescription,
                        MetaTagKeywords = piso.MetaTagKeywords,
                        SEOFriendlyUrl = piso.SEOFriendlyUrl
                    }
                ))
                ;

            Mapper.CreateMap<Models.ProductModels.ProductLocalizedImage, DC.ProductLocalizedImage>()
                .ForMember(x => x.Sequence, op => op.Ignore());

            Mapper.CreateMap<DC.ProductLocalizedImage, Models.ProductModels.ProductLocalizedImage>();

            Mapper.CreateMap<Models.ProductModels.StockOnHandAdjustment, DC.StockOnHandAdjustment>();
            Mapper.CreateMap<DC.StockOnHandAdjustment, Models.ProductModels.StockOnHandAdjustment>();

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
                  //.ForMember(x => x.Options, op => op.MapFrom(x => x.Options))
                  .ForMember(x => x.DeltaPriceValue, op => op.MapFrom(x => x.DeltaPrice != null ? x.DeltaPrice.Value : null));
            Mapper.CreateMap<ProductVariation, DC.ProductVariation>()
                .ForMember(x => x.DeltaPrice, op => op.MapFrom(x => x.DeltaPriceValue.HasValue ? new DC.ProductVariationDeltaPrice() {CurrencyCode = "usd", Value = x.DeltaPriceValue} : null));

            Mapper.CreateMap<DC.ProductVariationOption, ProductVariationOption>();
            Mapper.CreateMap<ProductVariationOption, DC.ProductVariationOption>();




        }

        object OptionValuesResolver (DC.Product p)
        {
            if (p.VariationOptions != null && p.VariationOptions.Count > 0)
            {
                return string.Join(", ", p.VariationOptions.Where( x=> x.Value != null).Select(x =>  x.Value.ToString()  ));
            }
            return null;
        }
        object InventoryHandlingResolver(DC.Product p)
        {
            
            if (p.ManageStock.GetValueOrDefault(false) == false)
            {
                return 0;
            }
            if (p.IsBackOrderAllowed.GetValueOrDefault(false))
            {
                return 1;
            }
            if (p.IsHiddenWhenOutOfStock.GetValueOrDefault(false))
            {
                return 2;
            }
            else
            {
                return 3;
            }
        }
    }
}
