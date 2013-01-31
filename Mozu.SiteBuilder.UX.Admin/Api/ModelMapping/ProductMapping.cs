using AutoMapper;
//using Volusion.ProductAdmin.Contracts;
//using DC = Volusion.ProductAdmin.Contracts;
using Mozu.Core.Api.Contracts;
using Mozu.ProductAdmin.Contracts;
using System.Collections.Generic;
using System.Linq;
using DC = Mozu.ProductAdmin.Contracts;
using OldProduct = Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels.OldProduct;
using Product = Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels.Product;
using ProductInSiteInfo = Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels.ProductInSiteInfo;

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
                .ForMember(x => x.ShortDescription, op => op.MapFrom(dc => (dc.Content ?? NULLCONTENT).ProductShortDescription))
                .ForMember(x => x.FullDescription, op => op.MapFrom(dc => (dc.Content ?? NULLCONTENT).ProductFullDescription))
                //.ForMember(x => x.ListPrice, op => op.MapFrom(dc => (dc.Price ?? NULLPRICE).ListPrice))
                .ForMember(x => x.Price, op => op.MapFrom(dc => (dc.Price ?? NULLPRICE).Price))
                .ForMember(x => x.SalePrice, op => op.MapFrom(dc => (dc.Price ?? NULLPRICE).SalePrice))
                .ForMember(x => x.StockOnHand, op => op.MapFrom(dc => dc.StockOnHand))
                .ForMember(x => x.IsHiddenWhenOutOfStock, op => op.MapFrom(dc => dc.IsHiddenWhenOutOfStock))
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
                .ForMember(dc => dc.BaseProductCode, op => op.MapFrom(p => p.BaseProductCode))
                .ForMember(dc => dc.Content, op => op.MapFrom(p =>
                    new DC.ProductLocalizedContent()
                    {
                        ProductName = p.ProductName,
                        ProductShortDescription = p.ShortDescription,
                        ProductFullDescription = p.FullDescription
                    }
                ))
                .ForMember(dc => dc.Price, op => op.MapFrom(p =>
                    new DC.ProductPrice()
                    {
                        ISOCurrencyCode = "USD",
                        // ListPrice = p.ListPrice,
                        Price = p.Price,
                        SalePrice = p.SalePrice
                    }
                ))
                .ForMember(x => x.PackageHeight, op => op.MapFrom(x => new Measurement { Unit = "in", Value = x.PackageHeight }))
                .ForMember(x => x.PackageLength, op => op.MapFrom(x => new Measurement { Unit = "in", Value = x.PackageLength }))
                .ForMember(x => x.PackageWidth, op => op.MapFrom(x => new Measurement { Unit = "in", Value = x.PackageWidth }))
                .ForMember(x => x.PackageWeight, op => op.MapFrom(x => new Measurement { Unit = "lbs", Value = x.PackageWeight }))
                ;

            Mapper.CreateMap<DC.ProductInSiteInfo, ProductInSiteInfo>()
                .ForMember(x => x.SiteId, op => op.MapFrom(dc => dc.SiteId))
                .ForMember(x => x.IsContentOverridden, op => op.MapFrom(dc => dc.IsContentOverridden))
                .ForMember(x => x.ProductName, op => op.MapFrom(dc => (dc.Content ?? NULLCONTENT).ProductName))
                .ForMember(x => x.ShortDescription, op => op.MapFrom(dc => (dc.Content ?? NULLCONTENT).ProductShortDescription))
                .ForMember(x => x.FullDescription, op => op.MapFrom(dc => (dc.Content ?? NULLCONTENT).ProductFullDescription))
                .ForMember(x => x.IsPriceOverridden, op => op.MapFrom(dc => dc.IsPriceOverridden))
                .ForMember(x => x.Price, op => op.MapFrom(dc => (dc.Price ?? NULLPRICE).Price))
                .ForMember(x => x.SalePrice, op => op.MapFrom(dc => (dc.Price ?? NULLPRICE).SalePrice))
                .ForMember(x => x.IsSEOContentOverridden, op => op.MapFrom(dc => dc.IsSEOContentOverridden))
                .ForMember(x => x.MetaTagTitle, op => op.MapFrom(dc => dc.SEOContent == null ? null : dc.SEOContent.MetaTagTitle))
                .ForMember(x => x.MetaTagDescription, op => op.MapFrom(dc => dc.SEOContent == null ? null : dc.SEOContent.MetaTagDescription))
                .ForMember(x => x.MetaTagKeywords, op => op.MapFrom(dc => dc.SEOContent == null ? null : dc.SEOContent.MetaTagKeywords))
                .ForMember(x => x.SEOFriendlyUrl, op => op.MapFrom(dc => dc.SEOContent == null ? null : dc.SEOContent.SEOFriendlyUrl))
                ;

            Mapper.CreateMap<ProductInSiteInfo, DC.ProductInSiteInfo>()
                .ForMember(dc => dc.IsContentOverridden, op => op.MapFrom(piso => piso.IsContentOverridden))
                .ForMember(dc => dc.Content, op => op.MapFrom(piso =>
                    new DC.ProductLocalizedContent
                    {
                        ProductName = piso.ProductName,
                        ProductShortDescription = piso.ShortDescription,
                        ProductFullDescription = piso.FullDescription
                    }
                ))
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

            Mapper.CreateMap<DC.Product, OldProduct>()
                  .ForMember(x => x.ContentLocaleCode,
                             op => op.MapFrom(x => (x.Content ?? NULLCONTENT).LocaleCode))
                //.ForMember(x => x.FreeShipping, op => op.MapFrom(x => (x.Content ?? NULLCONTENTE).FreeShipping))
                //.ForMember(x => x.MetaTagDescription,
                //             op => op.MapFrom(x => (x.Content ?? NULLCONTENT).MetaTagDescription))
                //.ForMember(x => x.MetaTagKeywords, op => op.MapFrom(x => (x.Content ?? NULLCONTENT).MetaTagKeywords))
                //.ForMember(x => x.MetaTagTitle, op => op.MapFrom(x => (x.Content ?? NULLCONTENT).MetaTagTitle))
                  .ForMember(x => x.ProductFullDescription,
                             op => op.MapFrom(x => (x.Content ?? NULLCONTENT).ProductFullDescription))
                  .ForMember(x => x.ProductImages, op => op.MapFrom(x => (x.Content ?? NULLCONTENT).ProductImages))
                  .ForMember(x => x.ProductName, op => op.MapFrom(x => (x.Content ?? NULLCONTENT).ProductName))
                  .ForMember(x => x.ProductShortDescription,
                             op => op.MapFrom(x => (x.Content ?? NULLCONTENT).ProductShortDescription))
                //.ForMember(x => x.SEOFriendlyUrl, op => op.MapFrom(x => (x.Content ?? NULLCONTENT).SEOFriendlyUrl))
                //.ForMember(x => x.ListPrice, op => op.MapFrom(x => (x.Price ?? NULLPRICE).ListPrice))
                  .ForMember(x => x.ISOCurrencyCode, op => op.MapFrom(x => (x.Price ?? NULLPRICE).ISOCurrencyCode))
                  .ForMember(x => x.InventoryHandling, op => op.ResolveUsing(InventoryHandlingResolver))
                  .ForMember(x => x.ParentProductCode, op => op.MapFrom(x => x.BaseProductCode))
                  .ForMember(x => x.OptionValues, op => op.ResolveUsing(OptionValuesResolver))
                  .ForMember(x => x.Price, op => op.MapFrom(x => (x.Price ?? NULLPRICE).Price))
                  .ForMember(x => x.SalePrice, op => op.MapFrom(x => (x.Price ?? NULLPRICE).SalePrice))
                  .ForMember(x => x.ManageStock, op => op.MapFrom(x => x.ManageStock.GetValueOrDefault(false)))
                  .ForMember(x => x.PackageHeight, op => op.MapFrom(x => (x.PackageHeight == null) ? null : x.PackageHeight.Value))
                  .ForMember(x => x.PackageLength, op => op.MapFrom(x => (x.PackageLength == null) ? null : x.PackageLength.Value))
                  .ForMember(x => x.PackageWidth, op => op.MapFrom(x => (x.PackageWidth == null) ? null : x.PackageWidth.Value))
                  .ForMember(x => x.PackageWeight, op => op.MapFrom(x => (x.PackageWeight == null) ? null : x.PackageWeight.Value));
                //.ForMember(x => x.CategoryIds, op => op.MapFrom(x => (x.ProductInSites().ProductCategories == null ? null : x.ProductCategories.Where(pc => pc.CategoryId != 1).Select(pc => pc.CategoryId).ToList())));
               

 //.ForMember(x => x.TaxAmount, op => op.MapFrom(x => (x.Price ?? NULLPRICE).TaxAmount));
            Mapper.CreateMap<Models.ProductModels.ProductLocalizedImage, DC.ProductLocalizedImage>()
                .ForMember(x => x.Sequence, op => op.Ignore());

            Mapper.CreateMap<DC.ProductLocalizedImage, Models.ProductModels.ProductLocalizedImage>();

            Mapper.CreateMap<Models.ProductModels.StockOnHandAdjustment, DC.StockOnHandAdjustment>();
            Mapper.CreateMap<DC.StockOnHandAdjustment, Models.ProductModels.StockOnHandAdjustment>();

            Mapper.CreateMap<Mozu.Core.Api.Contracts.Measurement, UnitOfMeasure>();
            Mapper.CreateMap<UnitOfMeasure, Mozu.Core.Api.Contracts.Measurement>();

            Mapper.CreateMap<OldProduct, DC.Product>()
               // .ForMember(x => x.ProductCategories, op => op.MapFrom(x => x.CategoryIds == null ? null : x.CategoryIds.Select(pc => new ProductCategory() { CategoryId = pc })))
                //.ForMember(x => x.ProductType , op=> op.MapFrom ( x=> string.IsNullOrEmpty ( x.ProductType ) ? "Simple": x.ProductType ))
                .ForMember(x => x.Content, op => op.ResolveUsing(ContentResolver))
                .ForMember(x=>x.IsTaxable , op=> op.MapFrom( x=> x.IsTaxable.GetValueOrDefault( false )))
                //.ForMember(x => x.IsActive , op => op.MapFrom(x => x.IsActive.GetValueOrDefault( true)))
                .ForMember (x=> x.IsBackOrderAllowed , op=> op.MapFrom ( x=> x.InventoryHandling.GetValueOrDefault(0) == 1 ))
                .ForMember(x => x.IsHiddenWhenOutOfStock , op => op.MapFrom(x => x.InventoryHandling.GetValueOrDefault(0) == 2))
                .ForMember(x => x.ManageStock, op => op.MapFrom(x => x.ManageStock.GetValueOrDefault(false)))
                .ForMember(x => x.PackageHeight, op => op.MapFrom(x => new Measurement { Unit = "in", Value = x.PackageHeight }))
                .ForMember(x => x.PackageLength, op => op.MapFrom(x => new Measurement { Unit = "in", Value = x.PackageLength }))
                .ForMember(x => x.PackageWidth, op => op.MapFrom(x => new Measurement { Unit = "in", Value = x.PackageWidth }))
                .ForMember(x => x.PackageWeight, op => op.MapFrom(x => new Measurement {Unit ="lbs" , Value=x.PackageWeight }))
                .ForMember(x => x.Price, op => op.ResolveUsing(PriceResolver));
                
        }
        object OptionValuesResolver (DC.Product p)
        {
            if (p.VariationOptions != null && p.VariationOptions.Count > 0)
            {
                return string.Join(", ", p.VariationOptions.Select(x => x.AttributeValueInternal));
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
        
        DC.ProductPrice PriceResolver(OldProduct p)
        {
            if (p == null)
                return null;
            return new DC.ProductPrice()
            {
                ISOCurrencyCode = string.IsNullOrEmpty (p.ISOCurrencyCode) ? "USD" : p.ISOCurrencyCode  ,
                //IsTaxAmountPercent = p.IsTaxAmountPercent,
                //ListPrice = p.ListPrice,
                Price = p.Price,
                //ProductId = p.ProductId,
                SalePrice = p.SalePrice,
                //TaxAmount = p.TaxAmount
            };
        }
        DC.ProductLocalizedContent ContentResolver ( OldProduct p )
        {
            if (p == null)
                return null;

            var cnt= new DC.ProductLocalizedContent()
            {
                //ContentLocaleCode = string.IsNullOrEmpty(p.ContentLocaleCode) ? "en-US" : p.ContentLocaleCode,
               
               // FreeShipping = p.FreeShipping,
                //MetaTagDescription = p.MetaTagDescription,
                //MetaTagKeywords = p.MetaTagKeywords,
                //MetaTagTitle = p.MetaTagTitle,
                ProductFullDescription = p.ProductFullDescription,
                //ProductId = p.ProductId,
                ProductImages = Mapper.Map<List<ProductLocalizedImage>>(p.ProductImages),
                ProductName = p.ProductName,
                ProductShortDescription = p.ProductShortDescription,
         //       SEOFriendlyUrl = p.SEOFriendlyUrl
            };
            if (cnt.ProductImages != null)
            {
                for (int i = 0; i < cnt.ProductImages.Count; i++)
                {
                    cnt.ProductImages[i].ImageId = cnt.ProductImages[i].ImageId.GetValueOrDefault(i);

                }
            }
            return cnt;
        }
    }
}
