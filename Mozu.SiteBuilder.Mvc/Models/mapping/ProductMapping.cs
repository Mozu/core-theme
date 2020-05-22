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
        public ProductMapping()
        {
           CreateMap<Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Category, IDictionary<string, object>>()
                .ConvertUsing((Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Category parent) =>
                {

                    var dic = new System.Collections.Generic.Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);

                    

                    PopulateDictionary( parent, dic);

                    return dic;
                });

            CreateMap<Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Product, IDictionary<string, object>>()
               .ConvertUsing((Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Product  product) =>
               {

                   var dic = new System.Collections.Generic.Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);
                   dic["productCode"] = product.ProductCode;
                   dic["productName"] = product.ProductName;
                   dic["productSlug"] = product.Content?.SEOFriendlyUrl;
                   dic["productType"] = product.ProductType;
                   dic["productTypeId"] = product.ProductTypeId;
                   dic["variationProductCode"] = product.VariationProductCode;
                   if ( product.Categories != null && product.Categories.Count>0)
                   {
                       var cat = product.Categories.FirstOrDefault(x => x.IsDisplayed) ?? product.Categories.First();
                       PopulateDictionary(cat, dic);
                   }
                   
                   if ( product.Properties != null)
                   {
                       foreach (var prop in product.Properties.Where(x => !x.IsMultiValue.GetValueOrDefault(false) && x.Values != null && x.Values.Count > 0 ))
                       {
                           dic[prop.AttributeFqn] = prop.Values.First().Value;
                       }

                   }

                   return dic;
               });



            CreateMap<Mozu.ProductRuntime.Contracts.ProductSearchResult, ProductSearchResult>();
            CreateMap<Mozu.ProductRuntime.Contracts.Facet, Facet>();
          
     
            CreateMap<Mozu.ProductRuntime.Contracts.ProductOption, ProductOption>();
                //ForMember(x => x.StandardInputTypeIntention, op => op.MapFrom(x => (x.StandardInputTypeIntention == "Undefined" || x.OptionType == "Configurable")  ? "Dropdown" : x.StandardInputTypeIntention));

            CreateMap<Mozu.ProductRuntime.Contracts.ProductImage, ProductImage>();


            CreateMap<Mozu.ProductRuntime.Contracts.Category, Category>();
              

            CreateMap<Mozu.ProductRuntime.Contracts.ConfiguredProduct, ConfiguredProduct>();
                

            CreateMap<Mozu.ProductRuntime.Contracts.ProductPrice, ProductPrice>();
          
            CreateMap<Mozu.ProductRuntime.Contracts.ProductPriceRange, ProductPriceRange>();
            CreateMap<Mozu.ProductRuntime.Contracts.ProductVolumePrice, ProductVolumePrice>();

            CreateMap<Mozu.ProductRuntime.Contracts.Product, Product>();
              
            CreateMap<Mozu.ProductRuntime.Contracts.ProductContent, ProductContent>()
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
            CreateMap<Mozu.ProductRuntime.Contracts.ProductCollection, ProductCollection>();
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

            CreateMap<Mozu.ProductRuntime.Contracts.ProductSearchResult, ProductSearchResult>();
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

        private static void PopulateDictionary( Category category, Dictionary<string, object> dic)
        {
            var token = new CategoryToken(CategoryToken.CategoryIdentifierType.Id, 0, null);
            for (var i = 0; category != null && category.IsDisplayed && i < 10; i++)
            {
                token.IdType = CategoryToken.CategoryIdentifierType.Id;
                dic[token.Raw] = category.CategoryId;
                token.IdType = CategoryToken.CategoryIdentifierType.Code;
                dic[token.Raw] = category.CategoryCode;
                token.IdType = CategoryToken.CategoryIdentifierType.Slug;
                dic[token.Raw] = category.Content == null ? null : category.Content.Slug;

                category = category.ParentCategory;
                token = token.GetParent();

            }
        }
    }
}