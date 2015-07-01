using AutoMapper;
using System;
using System.Collections.Generic;
using Mozu.Core.Api.Contracts;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.Mvc.MessageHandler;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using System.Linq;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.ModelMapping
{
    public class ProductMapping: Profile
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

            Mapper.CreateMap<Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Category, IDictionary<string, object>>()
                .ConstructUsing((Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Category cat) =>
                {
                    var dic = new System.Collections.Generic.Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);
                    dic["code"] = cat.CategoryCode;
                    dic["categoryCode"] = cat.CategoryCode;
                    dic["id"] = cat.Id;
                    dic["slug"] = cat.Content == null ? null : cat.Content.Slug;
                    if (cat.ParentCategory != null)
                    {
                        dic["parent-CategoryCode"] = cat.ParentCategory.CategoryCode;
                        dic["parent-Code"] = cat.ParentCategory.CategoryCode;
                        dic["parent-CategorySlug"] = cat.ParentCategory.Content == null ? null :cat.ParentCategory.Content.Slug;

                        if (cat.ParentCategory.ParentCategory != null)
                        {
                            dic["grandParent-CategoryCode"] = cat.ParentCategory.ParentCategory.CategoryCode;
                            dic["grandParent-Code"] = cat.ParentCategory.ParentCategory.CategoryCode;
                            dic["grandParent-CategorySlug"] = cat.ParentCategory.ParentCategory.Content == null ? null : cat.ParentCategory.ParentCategory.Content.Slug;
                        }
                    }
                    

                    return dic;
                });



            Mapper.CreateMap<Mozu.ProductRuntime.Contracts.ProductSearchResult, ProductSearchResult>();
            Mapper.CreateMap<Mozu.ProductRuntime.Contracts.Facet, Facet>();
          
          //  Mapper.CreateMap<Mozu.ProductRuntime.Contracts.CategoryFacet, CategoryFacet>();
          //  Mapper.CreateMap<Mozu.ProductRuntime.Contracts.CategoryFacetItem, CategoryFacetItem>();
           // Mapper.CreateMap<ProductRuntime.Contracts.CategoryFacet, CategoryFacet>();


         
            //Mapper.CreateMap<Mozu.ProductRuntime.Contracts.ProductAttribute, ProductAttribute>();

            Mapper.CreateMap<Mozu.ProductRuntime.Contracts.ProductOption, ProductOption>();
                //ForMember(x => x.StandardInputTypeIntention, op => op.MapFrom(x => (x.StandardInputTypeIntention == "Undefined" || x.OptionType == "Configurable")  ? "Dropdown" : x.StandardInputTypeIntention));

            Mapper.CreateMap<Mozu.ProductRuntime.Contracts.ProductImage, ProductImage>();

          //  Mapper.CreateMap<Mozu.Core.Api.Contracts.Measurement, UnitOfMeasure>();

          //  Mapper.CreateMap<Mozu.ProductRuntime.Contracts.ProductOptionValue, ProductOptionValue>();

            Mapper.CreateMap<Mozu.ProductRuntime.Contracts.Category, Category>();
                //.ForMember( x=> x.ParentCategory , op=> op.Ignore ())
                //.ForMember(x => x.Name, op => op.MapFrom(x => x.Content.Name))
                //.ForMember(x => x.MetaTagDescription, op => op.MapFrom(x => x.Content.MetaTagDescription))
                //.ForMember(x => x.MetaTagKeywords, op => op.MapFrom(x => x.Content.MetaTagKeywords))
                //.ForMember(x => x.MetaTagTitle, op => op.MapFrom(x => x.Content.MetaTagTitle))
                //.ForMember(x => x.PageTitle, op => op.MapFrom(x => x.Content.PageTitle))
                //.ForMember(x => x.ParentCategoryId, op => op.MapFrom(x => x.ParentCategory != null ? (int?)x.ParentCategory.CategoryId : (int?)null))
                //.ForMember(x => x.Slug, op => op.MapFrom(x => x.Content.Slug));

            //Mapper.CreateMap<Mozu.ProductRuntime.Contracts.ProductPurchasableState, ProductPurchasableState>();
            //Mapper.CreateMap<Mozu.ProductRuntime.Contracts.ValidationMessage, ValidationMessage>();



            //Mapper.CreateMap<ProductConfigurationRequest, Mozu.ProductRuntime.Contracts.ProductSelections>();
            //Mapper.CreateMap<ProductOptionSelection, Mozu.ProductRuntime.Contracts.ProductOptionSelection>();



                
            //Mapper.CreateMap<ProductRuntime.Contracts.CategoryNode, Category>()
            //    .ForMember(x => x.Name, op => op.MapFrom(x => x.Content.Name))
            //    .ForMember(x => x.CategoryId, op => op.MapFrom(x => x.CategoryId))
            //    .ForMember(x => x.ParentCategoryId, op => op.MapFrom(x => x.ParentCategoryId))
            //    .ForMember(x => x.Description, op => op.MapFrom(x => x.Content.Description));

            Mapper.CreateMap<Mozu.ProductRuntime.Contracts.ConfiguredProduct, ConfiguredProduct>();
                

            Mapper.CreateMap<Mozu.ProductRuntime.Contracts.ProductPrice, ProductPrice>();
                //.ForMember(x => x.SalePrice, op => op.MapFrom(x => x.SalePrice))
                //.ForMember(x => x.Price, op => op.MapFrom(x => x.Price));



            //Mapper.CreateMap<Mozu.ProductRuntime.Contracts.ProductPriceRange, ProductPrice>();
                //.ForMember(x => x.LowerBoundPrice, op => op.MapFrom(x => x.Lower.Price))
                //.ForMember(x => x.LowerBoundSalePrice, op => op.MapFrom(x => x.Lower.SalePrice))
                //.ForMember(x => x.UpperBoundPrice, op => op.MapFrom(x => x.Upper.Price))
                //.ForAllMembers(x => x.Ignore());

                //.ForMember(x => x.DiscountEndDate, op => op.MapFrom(x => x.Price.Discount == null ? (DateTime?)null : x.Price.Discount.Discount.EndDate))
                //.ForMember(x => x.DiscountId, op => op.MapFrom(x => x.Price.Discount == null ? (int?)null : x.Price.Discount.Discount.DiscountId))
               // .ForMember(x => x.DiscountName, op => op.MapFrom(x => x.Price.Discount == null ? null : x.Price.Discount.Discount.Name))
                //.ForMember(x => x.LowerBoundPrice, op => op.MapFrom(x => x. == null ? 0 : x.PriceRange.Lower.Price))
                //.ForMember(x => x.LowerBoundSalePrice, op => op.MapFrom(x => x.PriceRange == null ? 0 : x.PriceRange.Lower.SalePrice))
                //.ForMember(x => x.UpperBoundPrice, op => op.MapFrom(x => x.PriceRange == null ? 0 : x.PriceRange.Upper.Price));

            Mapper.CreateMap<Mozu.ProductRuntime.Contracts.ProductPriceRange, ProductPriceRange>();
            Mapper.CreateMap<Mozu.ProductRuntime.Contracts.Product, Product>();
                //.ForMember(x => x.ProductName, op => op.MapFrom(x => x.Content.ProductName))
                //.ForMember(x => x.ProductFullDescription, op => op.MapFrom(x => x.Content.ProductFullDescription))
                //.ForMember(x => x.ProductShortDescription, op => op.MapFrom(x => x.Content.ProductShortDescription))
                //.ForMember(x => x.MetaTagTitle, op => op.MapFrom(x => x.Content.MetaTagTitle))
                //.ForMember(x => x.MetaTagDescription, op => op.MapFrom(x => x.Content.MetaTagDescription))
                //.ForMember(x => x.MetaTagKeywords, op => op.MapFrom(x => x.Content.MetaTagKeywords))
                //.ForMember(x => x.SEOFriendlyUrl, op => op.MapFrom(x => x.Content.SEOFriendlyUrl))
                //.ForMember(x => x.ProductImages, op => op.MapFrom(x => x.Content.ProductImages))
                //.ForMember(x => x.IsPurchasable, op => op.MapFrom(x => x.PurchasableState.IsPurchasable))
                //.ForMember(x => x.PurchasableMessage, op => op.MapFrom(x => x.PurchasableState.Messages))
                 //.ForMember(x => x.Price, op => op.MapFrom(_ =>
                 //                                           new ProductPrice()
                 //                                               {
                 //                                                   Price = _.Price != null ? _.Price.Price : null,
                 //                                                   SalePrice = _.Price != null ? _.Price.SalePrice : null,
                 //                                                   DiscountId = _.Price != null && _.Price.Discount != null && _.Price.Discount.Discount != null ? _.Price.Discount.Discount.DiscountId : (int?) null,
                 //                                                   DiscountName = _.Price != null && _.Price.Discount != null && _.Price.Discount.Discount != null ? _.Price.Discount.Discount.Name : null,
                 //                                                   LowerBoundPrice = _.PriceRange != null ? _.PriceRange.Lower.Price : (decimal?) null,
                 //                                                   UpperBoundPrice = _.PriceRange != null ? _.PriceRange.Upper.Price : (decimal?) null,
                 //                                                   LowerBoundSalePrice = _.PriceRange != null && _.PriceRange != null ? _.PriceRange.Lower.SalePrice : null

                 //                                               }));
                //)).AfterMap((dc, vm) =>
                //{
                //    vm.ProductImages.Product = vm;
                //    vm.ProductImages.ForEach(x => x.Collection = vm.ProductImages);
                //});
            Mapper.CreateMap<Mozu.ProductRuntime.Contracts.ProductContent, ProductContent>()
                  .ForMember(x => x.ProductImages, op => op.ResolveUsing(x =>
                      {
                          var pic = new ProductImageCollection();
                          if (x.ProductImages != null)
                          {
                              pic.AddRange(x.ProductImages.Select(pi => Mapper.Map<ProductImage>(pi)));
                              ;
                          }

                          return pic;

                      }));
            ;
            Mapper.CreateMap<Mozu.ProductRuntime.Contracts.ProductCollection, ProductCollection>();
                //.ForMember(x => x.Items, op => op.MapFrom(x => x.Items))
                //.ForMember(x => x.Paging, op => op.MapFrom(x =>
                //    new PagingModel()
                //    {
                //        PageCount = Convert.ToInt32 (x.PageCount),
                //        TotalCount = Convert.ToInt32 (x.TotalCount),
                //        StartIndex = x.StartIndex,
                //        PageSize = x.PageSize
                //    }));
                //   // .AfterMap((x, y) => y.Paging.Init());

            Mapper.CreateMap<Mozu.ProductRuntime.Contracts.ProductSearchResult, ProductSearchResult>();
            //.ForMember(x => x.Items, op => op.MapFrom(x => x.Items))
            //.ForMember(x => x.Paging, op => op.MapFrom(x =>
            //    new PagingModel()
            //    {
            //        PageCount = Convert.ToInt32(x.PageCount),
            //        TotalCount = Convert.ToInt32(x.TotalCount),
            //        StartIndex = x.StartIndex,
            //        PageSize = x.PageSize
            //    }));
            //   // .AfterMap((x, y) => y.Paging.Init());

        }
    }
}