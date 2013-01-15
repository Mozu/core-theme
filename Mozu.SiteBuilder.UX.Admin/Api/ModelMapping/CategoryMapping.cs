using AutoMapper;
using Mozu.ProductAdmin.Contracts;
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
            Mapper.CreateMap<Category, Models.Category.Category>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(c => c.Id))
                .ForMember(dest => dest.IsHidden, opt => opt.MapFrom(c => !c.IsDisplayed))
                .ForMember(dest => dest.ParentId, opt => opt.MapFrom(c => c.ParentCategoryId))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(c => ((c.Content != null) ? c.Content.Name : null)))
                .ForMember(dest => dest.Description, opt => opt.MapFrom(c => ((c.Content != null) ? c.Content.Description : null)))
                .ForMember(dest => dest.PageTitle, opt => opt.MapFrom(c => ((c.Content != null) ? c.Content.PageTitle : null)))
                .ForMember(dest => dest.MetaDescription, opt => opt.MapFrom(c => ((c.Content != null) ? c.Content.MetaTagDescription : null)))
                .ForMember(dest => dest.MetaTitle, opt => opt.MapFrom(c => ((c.Content != null) ? c.Content.MetaTagTitle : null)))
                .ForMember(dest => dest.MetaKeywords, opt => opt.MapFrom(c => ((c.Content != null) ? c.Content.MetaTagKeywords : null)))
                .ForMember(dest => dest.Slug, opt => opt.MapFrom(c => ((c.Content != null) ? c.Content.Slug : null)))
                .ForMember(dest => dest.Path, opt => opt.Ignore());

            Mapper.CreateMap<Category, Mozu.SiteBuilder.UX.Admin.Api.Models.Category.CategoryTreeNode>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(c => c.Id))
                .ForMember(dest => dest.ParentId, opt => opt.MapFrom(c => c.ParentCategoryId))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(c => ((c.Content != null) ? c.Content.Name : null)))
                .ForMember(dest => dest.Index, opt => opt.MapFrom(c => c.Sequence))
                .ForMember(dest => dest.IsHidden, opt => opt.MapFrom(c => !c.IsDisplayed))
                .ForMember(dest => dest.ProductCount, opt => opt.MapFrom(c => c.ProductCount))
                .ForMember(dest => dest.Items, opt => opt.Ignore());

            // TODO: Ignore these for now  
            Mapper.CreateMap<Models.Category.Category, Category>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(c => c.Id))
                .ForMember(dest => dest.ParentCategoryId, opt => opt.MapFrom(c => c.ParentId.GetValueOrDefault(0) == 0 ? null : c.ParentId))

                .ForMember(dest => dest.Content, opt => opt.MapFrom(c =>
                                                                    new CategoryLocalizedContent
                                                                    {
                                                                        //CategoryId = c.Id.GetValueOrDefault (-1), 
                                                                        Description = c.Description,
                                                                        Name = c.Name,
                                                                        PageTitle = c.PageTitle,
                                                                        MetaTagDescription = c.MetaDescription,
                                                                        MetaTagTitle = c.MetaTitle,
                                                                        MetaTagKeywords = c.MetaKeywords,
                                                                        Slug = c.Slug,
                                                                        LocaleCode = "en-US" // Hack

                                                                    }))
                //.ForMember(dest => dest.Catalogs, opt => opt.Ignore())

                //.ForMember(dest => dest.ProductSet, opt => opt.Ignore())

                .ForMember(dest => dest.IsDisplayed, opt => opt.MapFrom(c => !c.IsHidden));

            //.ForMember(dest => dest.ProductSetId, opt => opt.MapFrom(c => 1)); // Default 1 for now

            //Mapper.AssertConfigurationIsValid();

            // moved to CmsPagesMapping in MVC project.
            //Mapper.CreateMap<Mozu.Content.Contracts.Document, Mvc.Models.CMS.Admin.Document>()
            //    .ForMember(x => x.Items, m => m.MapFrom(x => x.Properties));
            //Mapper.CreateMap<Mvc.Models.CMS.Admin.Document, Mozu.Content.Contracts.Document>()
            //    .ForMember(x => x.Properties, m => m.MapFrom(x => x.Items));
            //
            //Mapper.CreateMap<Mozu.Content.Contracts.PropertyValue, Mvc.Models.CMS.Admin.DocumentProperty>()
            //    .ForMember(x => x.Key, m => m.MapFrom(x => x.PropertyType));
            //Mapper.CreateMap<Mvc.Models.CMS.Admin.DocumentProperty, Mozu.Content.Contracts.PropertyValue>()
            //    .ForMember(x => x.PropertyType, m => m.MapFrom(x => x.Key));
        }
    }
}