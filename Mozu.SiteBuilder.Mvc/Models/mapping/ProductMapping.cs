using AutoMapper;
using System;
using System.Collections.Generic;
using Mozu.Core.Api.Contracts;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using System.Linq;
using Mozu.SiteBuilder.Mvc.SEO.Constraints;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.ModelMapping
{
    public class ProductMapping: Profile
    {
        private class CategoryToDictionaryConverter : ITypeConverter<Category, IDictionary<string, object>>
        {
            public IDictionary<string, object> Convert(Category source, IDictionary<string, object> destination, ResolutionContext context)
            {
                var dic = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);

                PopulateDictionary(source, dic);

                return dic;
            }
        }
        private class ProductToDictionaryConverter : ITypeConverter<Product, IDictionary<string, object>>
        {
            public IDictionary<string, object> Convert(Product source, IDictionary<string, object> destination, ResolutionContext context)
            {
                var dic = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase)
                {
                    ["productCode"] = source.ProductCode,
                    ["productName"] = source.ProductName,
                    ["productSlug"] = source.Content?.SEOFriendlyUrl,
                    ["productType"] = source.ProductType,
                    ["productTypeId"] = source.ProductTypeId,
                    ["variationProductCode"] = source.VariationProductCode
                };
                if (source.Categories != null && source.Categories.Count > 0)
                {
                    var cat = source.Categories.FirstOrDefault(x => x.IsDisplayed) ?? source.Categories.First();
                    PopulateDictionary(cat, dic);
                }

                if (source.Properties == null) return dic;

                foreach (var prop in source.Properties.Where(x => !x.IsMultiValue.GetValueOrDefault(false) && x.Values != null && x.Values.Count > 0))
                {
                    dic[prop.AttributeFqn] = prop.Values.First().Value;
                }

                return dic;
            }
        }

        public ProductMapping()
        {
           CreateMap<Category, IDictionary<string, object>>()
                .ConvertUsing<CategoryToDictionaryConverter>();

            CreateMap<Product, IDictionary<string, object>>()
               .ConvertUsing<ProductToDictionaryConverter>();

            CreateMap<Mozu.ProductRuntime.Contracts.ProductSearchResult, ProductSearchResult>();
            
            CreateMap<Mozu.ProductRuntime.Contracts.Spellcheck, Spellcheck>();
              
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
                  .ForMember(x => x.ProductImages, op => op.MapFrom(x => x.ProductImages == null ?
                      new ProductImageCollection() : 
                      new ProductImageCollection(x.ProductImages.Select(Mapper.Map<ProductImage>))));
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

        private static void PopulateDictionary( Category category, IDictionary<string, object> dic)
        {
            var token = new CategoryToken(CategoryToken.CategoryIdentifierType.Id, 0, null);
            for (var i = 0; category != null && category.IsDisplayed && i < 10; i++)
            {
                token.IdType = CategoryToken.CategoryIdentifierType.Id;
                dic[token.Raw] = category.CategoryId;
                token.IdType = CategoryToken.CategoryIdentifierType.Code;
                dic[token.Raw] = category.CategoryCode;
                token.IdType = CategoryToken.CategoryIdentifierType.Slug;
                dic[token.Raw] = category.Content?.Slug;

                category = category.ParentCategory;
                token = token.GetParent();

            }
        }
    }
}