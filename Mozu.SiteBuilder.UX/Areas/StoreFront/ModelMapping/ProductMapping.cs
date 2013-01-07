//using AutoMapper;
//using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;

//namespace Mozu.SiteBuilder.UX.Areas.StoreFront.ModelMapping
//{
//    public class ProductMapping: Profile
//    {
//        public override string ProfileName
//        {
//            get
//            {
//                return this.GetType().FullName;
//            }
//        }

//        protected override void Configure()
//        {
//            Mapper.CreateMap<ProductRuntime.Contracts.AttributeValueDateTime, AttributeValueDateTime>();
//            Mapper.CreateMap<ProductRuntime.Contracts.AttributeValueDecimal, AttributeValueDecimal>();
//            Mapper.CreateMap<ProductRuntime.Contracts.AttributeValueInteger, AttributeValueInteger>();
//            Mapper.CreateMap<ProductRuntime.Contracts.AttributeValueString, AttributeValueString>();
//            Mapper.CreateMap<ProductRuntime.Contracts.BaseProductAttribute, BaseProductAttribute>();
//            Mapper.CreateMap<ProductRuntime.Contracts.BaseProductAttributeValue, BaseProductAttributeValue>();
//            Mapper.CreateMap<ProductRuntime.Contracts.ProductAttribute, ProductAttribute>();
//            Mapper.CreateMap<ProductRuntime.Contracts.ProductAttributeValue, ProductAttributeValue>();
//            Mapper.CreateMap<ProductRuntime.Contracts.ProductConfigurationOption, ProductConfigurationOption>();
//            Mapper.CreateMap<ProductRuntime.Contracts.ProductConfigurationOptionValue, ProductConfigurationOptionValue>();
//            Mapper.CreateMap<ProductRuntime.Contracts.ProductImage, ProductImage>();
//            Mapper.CreateMap<ProductRuntime.Contracts.ProductStandaloneOptionValue, ProductStandaloneOptionValue>();
//            Mapper.CreateMap<ProductRuntime.Contracts.UnitOfMeasure, UnitOfMeasure>();

//            Mapper.CreateMap<ProductRuntime.Contracts.ProductStandaloneOption, ProductStandaloneOption>()
//                .ForMember(x => x.MaxLength, op => op.MapFrom(x => x.StringValidation.MaxLength))
//                .ForMember(x => x.MinLength, op => op.MapFrom(x => x.StringValidation.MinLength))
//                .ForMember(x => x.RegularExpression, op => op.MapFrom(x => x.StringValidation.RegularExpression));

//            Mapper.CreateMap<ProductRuntime.Contracts.Category, Category>()
//                .ForMember(x => x.Name, op => op.MapFrom(x => x.Content.Name))
//                .ForMember(x => x.MetaTagDescription, op => op.MapFrom(x => x.Content.MetaTagDescription))
//                .ForMember(x => x.MetaTagKeywords, op => op.MapFrom(x => x.Content.MetaTagKeywords))
//                .ForMember(x => x.MetaTagTitle, op => op.MapFrom(x => x.Content.MetaTagTitle))
//                .ForMember(x => x.PageTitle, op => op.MapFrom(x => x.Content.PageTitle))
//                .ForMember(x => x.ParentCategoryId, op => op.MapFrom(x => x.ParentCategory != null ? (int?)x.ParentCategory.CategoryId : (int?)null))
//                .ForMember(x => x.Slug, op => op.MapFrom(x => x.Content.Slug));
                
//            //Mapper.CreateMap<ProductRuntime.Contracts.CategoryNode, Category>()
//            //    .ForMember(x => x.Name, op => op.MapFrom(x => x.Content.Name))
//            //    .ForMember(x => x.CategoryId, op => op.MapFrom(x => x.CategoryId))
//            //    .ForMember(x => x.ParentCategoryId, op => op.MapFrom(x => x.ParentCategoryId))
//            //    .ForMember(x => x.Description, op => op.MapFrom(x => x.Content.Description));
               


//            Mapper.CreateMap<ProductRuntime.Contracts.Product, Product>()
//                .ForMember(x => x.ProductName, op => op.MapFrom(x => x.Content.ProductName))
//                .ForMember(x => x.ProductFullDescription, op => op.MapFrom(x => x.Content.ProductFullDescription))
//                .ForMember(x => x.ProductShortDescription, op => op.MapFrom(x => x.Content.ProductShortDescription))
//                .ForMember(x => x.MetaTagTitle, op => op.MapFrom(x => x.Content.MetaTagTitle))
//                .ForMember(x => x.MetaTagDescription, op => op.MapFrom(x => x.Content.MetaTagDescription))
//                .ForMember(x => x.MetaTagKeywords, op => op.MapFrom(x => x.Content.MetaTagKeywords))
//                .ForMember(x => x.SEOFriendlyUrl, op => op.MapFrom(x => x.Content.SEOFriendlyUrl))
//                .ForMember(x => x.ProductImages, op => op.MapFrom(x => x.Content.ProductImages))
//                .ForMember(x => x.IsPurchasable, op => op.MapFrom(x => x.PurchasableState.IsPurchasable))
//                .ForMember(x => x.PurchasableMessage , op => op.MapFrom(x => x.PurchasableState.Messages ))
//                .ForMember(x => x.Price, op => op.MapFrom(x => x.Price.Price))
//                .ForMember(x => x.SalePrice, op => op.MapFrom(x => x.Price.SalePrice))
//                .ForMember(x => x.DiscountEndDate , op => op.MapFrom(x => x.Price.Discount.Discount.EndDate ))
//                .ForMember(x => x.DiscountId, op => op.MapFrom(x => x.Price.Discount.Discount.DiscountId ))
//                .ForMember(x => x.DiscountName, op => op.MapFrom(x => x.Price.Discount.Discount.Name))
//                .ForMember(x => x.LowerBoundPrice, op => op.MapFrom(x => x.PriceRange.Lower.Price ))
//                .ForMember(x => x.LowerBoundSalePrice, op => op.MapFrom(x => x.PriceRange.Lower.SalePrice ))
//                .ForMember(x => x.UpperBoundPrice, op => op.MapFrom(x => x.PriceRange.Upper.Price))
//                .ForMember(x => x.PackageHeight, op => op.MapFrom(x => x.Measurements.PackageHeight))
//                .ForMember(x => x.PackageLength, op => op.MapFrom(x => x.Measurements.PackageLength))
//                .ForMember(x => x.PackageWeight, op => op.MapFrom(x => x.Measurements.PackageWeight))
//                .ForMember(x => x.PackageWidth, op => op.MapFrom(x => x.Measurements.PackageWidth));
//        }
//    }
//}