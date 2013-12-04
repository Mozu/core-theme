using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Category;
using DC = Mozu.ProductAdmin.Contracts;
using System.Linq;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class CategoryMapping : Profile
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
            Mapper.CreateMap<DC.Category, Category>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(c => c.Id))
                .ForMember(dest => dest.IsHidden, opt => opt.MapFrom(c => !c.IsDisplayed))
                .ForMember(dest => dest.CatalogId, opt => opt.MapFrom(c => c.CatalogId))
                
                .ForMember(dest => dest.ParentId, opt => opt.MapFrom(c => c.ParentCategoryId.HasValue ? c.ParentCategoryId : -1 ))
                .ForMember(dest => dest.Index, opt => opt.MapFrom(c => c.Sequence))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(c => ((c.Content != null) ? c.Content.Name : null)))
                .ForMember(dest => dest.Description, opt => opt.MapFrom(c => ((c.Content != null) ? c.Content.Description : null)))
                .ForMember(dest => dest.PageTitle, opt => opt.MapFrom(c => ((c.Content != null) ? c.Content.PageTitle : null)))
                .ForMember(dest => dest.MetaDescription, opt => opt.MapFrom(c => ((c.Content != null) ? c.Content.MetaTagDescription : null)))
                .ForMember(dest => dest.MetaTitle, opt => opt.MapFrom(c => ((c.Content != null) ? c.Content.MetaTagTitle : null)))
                .ForMember(dest => dest.MetaKeywords, opt => opt.MapFrom(c => ((c.Content != null) ? c.Content.MetaTagKeywords : null)))
                .ForMember(dest => dest.Slug, opt => opt.MapFrom(c => ((c.Content != null) ? c.Content.Slug : null)))
                .ForMember(dest => dest.CategoryImages, opt => opt.MapFrom(c => (c.Content != null ? c.Content.CategoryImages : null)))

                .ForMember(dest => dest.Path, opt => opt.Ignore());

            Mapper.CreateMap<DC.Category, CategoryTreeNode>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(c => c.Id))
                
                .ForMember(dest => dest.ParentId, opt => opt.MapFrom(c => c.ParentCategoryId))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(c => ((c.Content != null) ? c.Content.Name : null)))
                .ForMember(dest => dest.Index, opt => opt.MapFrom(c => c.Sequence))
                .ForMember(dest => dest.IsHidden, opt => opt.MapFrom(c => !c.IsDisplayed))
                .ForMember(dest => dest.ProductCount, opt => opt.MapFrom(c => c.ProductCount))
                .ForMember(dest => dest.Items, opt => opt.Ignore());

            Mapper.CreateMap<Category, DC.Category>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(c => c.Id))
                .ForMember(dest => dest.CatalogId, opt => opt.MapFrom(c => c.CatalogId))
                .ForMember(dest => dest.ParentCategoryId, opt => opt.MapFrom(c => c.ParentId.GetValueOrDefault(-1) == -1 ? null : c.ParentId))
                .ForMember(dest => dest.Sequence, opt => opt.MapFrom(c => c.Index))

                .ForMember(dest => dest.Content, opt => opt.MapFrom(c => c))

                .ForMember(dest => dest.IsDisplayed, opt => opt.MapFrom(c => !c.IsHidden))
                ;

            Mapper.CreateMap<Category, DC.CategoryLocalizedContent>()
                .ForMember(dc => dc.Description, op => op.MapFrom(x => x.Description))
                .ForMember(dc => dc.Name, op => op.MapFrom(x => x.Name))
                .ForMember(dc => dc.PageTitle, op => op.MapFrom(x => x.PageTitle))
                .ForMember(dc => dc.MetaTagDescription, op => op.MapFrom(x => x.MetaDescription))
                .ForMember(dc => dc.MetaTagTitle, op => op.MapFrom(x => x.MetaTitle))
                .ForMember(dc => dc.MetaTagKeywords, op => op.MapFrom(x => x.MetaKeywords))
                .ForMember(dc => dc.Slug, op => op.MapFrom(x => x.Slug))
                .ForMember(dc => dc.CategoryImages, op => op.MapFrom(x => x.CategoryImages))
                .ForMember(dc => dc.LocaleCode, op => op.UseValue("en-US"))
                ;

            Mapper.CreateMap<CategoryImage, DC.CategoryLocalizedImage>()
                .ForMember(dc => dc.ImageUrl, op => op.MapFrom(x => x.Url))
                ;

            Mapper.CreateMap<DC.CategoryLocalizedImage, CategoryImage>()
                .ForMember(x => x.Url, op => op.MapFrom(x => x.ImageUrl))
                ;
        }
    }
}