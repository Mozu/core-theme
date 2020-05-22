using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Category;
using DC = Mozu.ProductAdmin.Contracts;
using System.Linq;
using Mozu.Core.Api.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class CategoryMapping : Profile
    {
        public CategoryMapping()
        {
            CreateMap<DC.Category, Category>()
                .ForMember(dest => dest.Id, opt => opt.ResolveUsing(c => c.Id))
                .ForMember(dest => dest.IsHidden, opt => opt.ResolveUsing(c => !c.IsDisplayed))
                .ForMember(dest => dest.CatalogId, opt => opt.ResolveUsing(c => c.CatalogId))

                .ForMember(dest => dest.DynamicExpression, opt => opt.ResolveUsing(c => c.DynamicExpression))
                .ForMember(dest => dest.CategoryType, opt => opt.ResolveUsing(c => c.CategoryType))

                .ForMember(dest => dest.ParentId, opt => opt.ResolveUsing(c => c.ParentCategoryId.HasValue ? c.ParentCategoryId : -1))
                .ForMember(dest => dest.ParentName, op => op.ResolveUsing(c => c.ParentCategoryName))
                .ForMember(dest => dest.ParentCode, op => op.ResolveUsing(c => c.ParentCategoryCode))

                .ForMember(dest => dest.Index, opt => opt.ResolveUsing(c => c.Sequence))
                .ForMember(dest => dest.Name, opt => opt.ResolveUsing(c => c.Content?.Name))
                .ForMember(dest => dest.Description, opt => opt.ResolveUsing(c => c.Content?.Description))
                .ForMember(dest => dest.PageTitle, opt => opt.ResolveUsing(c => c.Content?.PageTitle))
                .ForMember(dest => dest.MetaDescription, opt => opt.ResolveUsing(c => c.Content?.MetaTagDescription))
                .ForMember(dest => dest.MetaTitle, opt => opt.ResolveUsing(c => c.Content?.MetaTagTitle))
                .ForMember(dest => dest.MetaKeywords, opt => opt.ResolveUsing(c => c.Content?.MetaTagKeywords))
                .ForMember(dest => dest.Slug, opt => opt.ResolveUsing(c => c.Content?.Slug))
                .ForMember(dest => dest.CategoryImages, opt => opt.ResolveUsing(c => (c.Content?.CategoryImages?.OrderBy(o => o.Sequence))))
                .ForMember(dest => dest.IsLeaf, op => op.ResolveUsing(dc => dc.ChildCount.GetValueOrDefault() == 0))
                .ForMember(x => x.CreateBy, op => op.ResolveUsing(dc => dc.AuditInfo?.CreateBy))
                .ForMember(x => x.CreateDate, op => op.ResolveUsing(dc => dc.AuditInfo?.CreateDate))
                .ForMember(x => x.UpdateBy, op => op.ResolveUsing(dc => dc.AuditInfo?.UpdateBy))
                .ForMember(x => x.UpdateDate, op => op.ResolveUsing(dc => dc.AuditInfo?.UpdateDate))

                .ForMember(x => x.ShouldSlice, op => op.ResolveUsing(dc => dc.ShouldSlice ?? false))

                //ignores
                .ForMember(dest => dest.Path, opt => opt.Ignore())
                .ForMember(dest => dest.Code, opt => opt.Ignore())
                .ForMember(dest => dest.Parent, opt => opt.Ignore())
                .ForMember(dest => dest.PreviousSiblingCategoryId, opt => opt.Ignore())
                .ForMember(dest => dest.CascadeDelete, op => op.Ignore())
                ;

            CreateMap<DC.CategoryNode, CategoryNode>()
                 .ForMember(dest => dest.IsHidden, opt => opt.ResolveUsing(c => !c.IsDisplayed))
                 .ForMember(dest => dest.ParentId, opt => opt.ResolveUsing(c => c.ParentCategoryId.HasValue ? c.ParentCategoryId : -1))
                .ForMember(dest => dest.Index, opt => opt.ResolveUsing(c => c.Sequence))
                .ForMember(dest => dest.Name, opt => opt.ResolveUsing(c => c.Content?.Name))
                 .ForMember(dest => dest.IsLeaf, op => op.ResolveUsing(s => s.Children != null ? s.Children.Count <= 0 : true))
                .ForMember(d=> d.Description, o=>o.ResolveUsing(s=>s.Content?.Description ))
                .ForMember(d=>d.Code, o=>o.ResolveUsing(s=>s.CategoryCode))
                .ForMember(x=>x.IsLeaf, o=>o.ResolveUsing(s=> s.IsLeafNode))
                 ;

            CreateMap<DC.Category, CategoryTreeNode>()
                .ForMember(dest => dest.Id, opt => opt.ResolveUsing(c => c.Id))
                
                .ForMember(dest => dest.ParentId, opt => opt.ResolveUsing(c => c.ParentCategoryId))
                .ForMember(dest => dest.Name, opt => opt.ResolveUsing(c => c.Content?.Name))
                .ForMember(dest => dest.Index, opt => opt.ResolveUsing(c => c.Sequence))
                .ForMember(dest => dest.IsHidden, opt => opt.ResolveUsing(c => !c.IsDisplayed))
                .ForMember(dest => dest.ProductCount, opt => opt.ResolveUsing(c => c.ProductCount))
                //ignores
                .ForMember(dest => dest.Items, opt => opt.Ignore())
                .ForMember(dest => dest.leaf, opt => opt.Ignore())

                ;

            CreateMap<Category, DC.Category>()
                .ForMember(dest => dest.Id, opt => opt.ResolveUsing(c => c.Id))
                .ForMember(dest => dest.CatalogId, opt => opt.ResolveUsing(c => c.CatalogId))
                .ForMember(dest => dest.DynamicExpression, opt => opt.ResolveUsing(c => c.DynamicExpression))
                .ForMember(dest => dest.CategoryType, opt => opt.ResolveUsing(c => c.CategoryType))
                .ForMember(dest => dest.ParentCategoryId, opt => opt.ResolveUsing(c => c.ParentId.GetValueOrDefault(-1) == -1 ? null : c.ParentId))
                .ForMember(dest => dest.Sequence, opt => opt.ResolveUsing(c => c.Sequence))
                .ForMember(dest => dest.Content, opt => opt.ResolveUsing((Category c) => c))
                .ForMember(dest => dest.IsDisplayed, opt => opt.ResolveUsing(c => !c.IsHidden))
                .ForMember(dest => dest.CategoryType, opt => opt.ResolveUsing(c => c.CategoryType))
                .ForMember(dc => dc.AuditInfo, op => op.ResolveUsing(x => new AuditInfo
                {
                    CreateBy = x.CreateBy,
                    CreateDate = x.CreateDate,
                    UpdateBy = x.UpdateBy,
                    UpdateDate = x.UpdateDate
                }))
                .ForMember(dest => dest.ShouldSlice, opt => opt.ResolveUsing(c => c.ShouldSlice))
                //ignores
                .ForMember(dest => dest.ChildCount, opt => opt.Ignore())
                .ForMember(dest => dest.ParentCategoryName, opt => opt.Ignore())
                .ForMember(dest => dest.ParentCategoryCode, opt => opt.Ignore())
                .ForMember(dest => dest.ParentIsActive, op => op.Ignore())
                
                ;

            CreateMap<Category, DC.CategoryLocalizedContent>()
                .ForMember(dc => dc.Description, op => op.ResolveUsing(x => x.Description))
                .ForMember(dc => dc.Name, op => op.ResolveUsing(x => x.Name))
                .ForMember(dc => dc.PageTitle, op => op.ResolveUsing(x => x.PageTitle))
                .ForMember(dc => dc.MetaTagDescription, op => op.ResolveUsing(x => x.MetaDescription))
                .ForMember(dc => dc.MetaTagTitle, op => op.ResolveUsing(x => x.MetaTitle))
                .ForMember(dc => dc.MetaTagKeywords, op => op.ResolveUsing(x => x.MetaKeywords))
                .ForMember(dc => dc.Slug, op => op.ResolveUsing(x => x.Slug))
                .ForMember(dc => dc.CategoryImages, op => op.ResolveUsing(x => x.CategoryImages))
                .ForMember(dc => dc.LocaleCode, op => op.Ignore()) // todo: xverify - Greg Murray on 2014-08-26 
                ;


            CreateMap<CategoryImage, DC.CategoryLocalizedImage>()
                .ForMember(dc => dc.ImageUrl, op => op.ResolveUsing(x => string.IsNullOrEmpty(x.CmsId) ? x.Url : null))
                .ForMember(dc => dc.AltText, op => op.ResolveUsing(x => x.Alt))
                .ForMember(dc => dc.CmsId, op => op.ResolveUsing(x => x.CmsId))
                //ignores
                .ForMember(dc => dc.Id, op => op.Ignore())
                .ForMember(dc => dc.LocaleCode, op => op.Ignore())
                .ForMember(dc => dc.ImageLabel, op => op.Ignore())
               
                .ForMember(dc => dc.VideoUrl, op => op.Ignore())
                .ForMember(dc => dc.MediaType, op => op.Ignore())
                .ForMember(dc => dc.Sequence, op => op.Ignore())
                ;

            CreateMap<DC.CategoryLocalizedImage, CategoryImage>()
                .ForMember(x => x.Url, op => op.ResolveUsing(x => x.ImageUrl))
                .ForMember(x => x.Alt, op => op.ResolveUsing(x => x.AltText))
                .ForMember(dc => dc.CmsId, op => op.ResolveUsing(x => x.CmsId))
                ;
        }
    }
}