using AutoMapper;
using System;
using System.Collections.Generic;
using Mozu.Core.Api.Contracts;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.Mvc.MessageHandler;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using System.Linq;
using Mozu.SiteBuilder.Mvc.SEO.Constraints;

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
                .ConstructUsing((Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Category parent) =>
                {
                    
                    var dic = new System.Collections.Generic.Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);

                    var token = new CategoryToken(CategoryToken.CategoryIdentifierType.Id, 0, null);
                   
                    for (var i = 0; parent != null && parent.IsDisplayed && i < 10; i++)
                    {
                        token.IdType = CategoryToken.CategoryIdentifierType.Id;
                        dic[token.Raw] = parent.CategoryId;
                        token.IdType = CategoryToken.CategoryIdentifierType.Code;
                        dic[token.Raw] = parent.CategoryCode;
                        token.IdType = CategoryToken.CategoryIdentifierType.Slug;
                        dic[token.Raw] = parent.Content == null ? null : parent.Content.Slug;

                        parent = parent.ParentCategory;
                        token = token.GetParent();
                      
                    }

                    return dic;
                });

            Mapper.CreateMap<Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Product, IDictionary<string, object>>()
               .ConstructUsing((Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Product  product) =>
               {

                   var dic = new System.Collections.Generic.Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);
                   dic["productCode"] = product.ProductCode;
                   dic["productName"] = product.ProductName;
                   dic["productSlug"] = product.Content == null ? null : product.Content.SEOFriendlyUrl;
                   if ( product.Categories != null && product.Categories.Count>0)
                   {
                       var cat = product.Categories.First();
                       var token = new CategoryToken(CategoryToken.CategoryIdentifierType.Id, 0, null);
                       token.IdType = CategoryToken.CategoryIdentifierType.Id;
                       dic[token.Raw] = cat.CategoryId;
                       token.IdType = CategoryToken.CategoryIdentifierType.Code;
                       dic[token.Raw] = cat.CategoryCode;
                       token.IdType = CategoryToken.CategoryIdentifierType.Slug;
                       dic[token.Raw] = cat.Content == null ? null : cat.Content.Slug;

                   }
                   return dic;
               });



            Mapper.CreateMap<Mozu.ProductRuntime.Contracts.ProductSearchResult, ProductSearchResult>();
            Mapper.CreateMap<Mozu.ProductRuntime.Contracts.Facet, Facet>();
          
     
            Mapper.CreateMap<Mozu.ProductRuntime.Contracts.ProductOption, ProductOption>();
                //ForMember(x => x.StandardInputTypeIntention, op => op.MapFrom(x => (x.StandardInputTypeIntention == "Undefined" || x.OptionType == "Configurable")  ? "Dropdown" : x.StandardInputTypeIntention));

            Mapper.CreateMap<Mozu.ProductRuntime.Contracts.ProductImage, ProductImage>();


            Mapper.CreateMap<Mozu.ProductRuntime.Contracts.Category, Category>();
              

            Mapper.CreateMap<Mozu.ProductRuntime.Contracts.ConfiguredProduct, ConfiguredProduct>();
                

            Mapper.CreateMap<Mozu.ProductRuntime.Contracts.ProductPrice, ProductPrice>();
          
            Mapper.CreateMap<Mozu.ProductRuntime.Contracts.ProductPriceRange, ProductPriceRange>();
            Mapper.CreateMap<Mozu.ProductRuntime.Contracts.Product, Product>();
              
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