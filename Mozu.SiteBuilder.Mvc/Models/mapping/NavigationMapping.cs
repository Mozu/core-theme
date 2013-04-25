using System;
using AutoMapper;
using Mozu.SiteBuilder.UX.Models.Navigation;
using Mozu.SiteBuilder.Mvc.Extensions;

namespace Mozu.SiteBuilder.Mvc.Models.Mappings
{
    public class NavigationMapping : Profile
    {
        public override string ProfileName  { get { return this.GetType().FullName; } }

        protected override void Configure()
        {
            Mapper.CreateMap<Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Product, NavigationNode>()
                .ForMember(d => d.Id, opt => opt.MapFrom(x => JoinParts("product", x.ProductCode)))
                .ForMember(d => d.OriginalId, opt => opt.MapFrom(x => x.ProductCode))
                .ForMember(d => d.Name, opt => opt.MapFrom(x => x.ProductName))
                .ForMember(d => d.Url, opt => opt.MapFrom(x => "/product/" + x.ProductCode))
                .ForMember(dest => dest.NodeType, opt => opt.UseValue(NavigationNodeType.Product))
                .ForMember(dest => dest.IsLeaf, opt => opt.UseValue(true))
                ;

            Mapper.CreateMap<Mozu.ProductRuntime.Contracts.Product, NavigationNode>()
                .ForMember(d => d.Id, opt => opt.MapFrom(x => JoinParts("product", x.ProductCode)))
                .ForMember(d => d.OriginalId, opt => opt.MapFrom(x => x.ProductCode))
                .ForMember(d => d.Name, opt => opt.MapFrom(x => x.Content.ProductName))
                .ForMember(d => d.Url, opt => opt.MapFrom(x => "/product/" + x.ProductCode))
                .ForMember(dest => dest.NodeType, opt => opt.UseValue(NavigationNodeType.Product))
                .ForMember(dest => dest.IsLeaf, opt => opt.UseValue(true))
                ;

            Mapper.CreateMap<Mozu.ProductAdmin.Contracts.Product, NavigationNode>()
                .ForMember(d => d.Id, opt => opt.MapFrom(x => JoinParts("product", x.ProductCode)))
                .ForMember(d => d.OriginalId, opt => opt.MapFrom(x => x.ProductCode))
                .ForMember(d => d.Name, opt => opt.MapFrom(x => x.Content.ProductName))
                .ForMember(d => d.Url, opt => opt.MapFrom(x => "/product/" + x.ProductCode))
                .ForMember(dest => dest.NodeType, opt => opt.UseValue(NavigationNodeType.Product))
                .ForMember(dest => dest.IsLeaf, opt => opt.UseValue(true))
                ;

            Mapper.CreateMap<Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Category, NavigationNode>()
                .ForMember(d => d.Id, opt => opt.MapFrom(x => JoinParts("category", x.CategoryId)))
                .ForMember(d => d.OriginalId, opt => opt.MapFrom(x => x.CategoryId))
                .ForMember(d => d.ParentId, opt => opt.MapFrom(x => x.ParentCategoryId.HasValue ? JoinParts("category", x.ParentCategoryId.Value) : null))
                .ForMember(d => d.Name, opt => opt.MapFrom(x => x.Name))
                .ForMember(d => d.Url, opt => opt.MapFrom(x => "/category/" + x.CategoryId))
                .ForMember(d => d.NodeType, opt => opt.UseValue(NavigationNodeType.Category))
                .ForMember(d => d.Index, opt => opt.MapFrom(x => x.Index))
                .ForMember(d => d.IsLeaf, opt => opt.UseValue(false))
                ;

            Mapper.CreateMap<Mozu.ProductAdmin.Contracts.Category, NavigationNode>()
                .ForMember(d => d.Id, opt => opt.MapFrom(x => JoinParts("category", x.Id)))
                .ForMember(d => d.OriginalId, opt => opt.MapFrom(x => x.Id))
                .ForMember(d => d.ParentId, opt => opt.MapFrom(x => x.ParentCategoryId.HasValue ? JoinParts("category", x.ParentCategoryId.Value) : null))
                .ForMember(d => d.Name, opt => opt.MapFrom(x => x.Content.Name))
                .ForMember(d => d.Url, opt => opt.MapFrom(x => "/category/" + x.Id))
                .ForMember(d => d.NodeType, opt => opt.UseValue(NavigationNodeType.Category))
                .ForMember(d => d.Index, opt => opt.MapFrom(x => x.Sequence))
                .ForMember(d => d.IsLeaf, opt => opt.UseValue(false))
                ;

            Mapper.CreateMap<Mozu.Content.Contracts.Document, NavigationNode>()
               .ForMember(d => d.Id, opt => opt.MapFrom(x => JoinParts("page", x.DocumentListName, x.Id)))
               .ForMember(d => d.OriginalId, opt => opt.MapFrom(x => x.Id))
               .ForMember(d => d.OriginalCollection, opt => opt.MapFrom(x => x.DocumentListName))
               .ForMember(d => d.ParentId, opt => opt.UseValue(null))
               .ForMember(d => d.Name, opt => opt.MapFrom(x => x.Get("link_title") ?? x.Get("title") ?? x.Name))
               .ForMember(d => d.Url, opt => opt.MapFrom(x => "/" + x.DocumentListName + "/" + x.Name))
               .ForMember(d => d.NodeType, opt => opt.UseValue(NavigationNodeType.Page))
               .ForMember(d => d.Index, opt => opt.UseValue(null))
               .ForMember(d => d.IsLeaf, opt => opt.MapFrom(x => x.DocumentType == "blog"))
               ;

            Mapper.CreateMap<Mozu.SiteBuilder.Mvc.Models.CMS.Document, NavigationNode>()
               .ForMember(d => d.Id, opt => opt.MapFrom(x => JoinParts("page", x.Collection, x.Id)))
               .ForMember(d => d.OriginalId, opt => opt.MapFrom(x => x.Id))
               .ForMember(d => d.OriginalCollection, opt => opt.MapFrom(x => x.Collection))
               .ForMember(d => d.ParentId, opt => opt.UseValue(null))
               .ForMember(d => d.Name, opt => opt.MapFrom(x => x.Name))
               .ForMember(d => d.Url, opt => opt.MapFrom(x => "/" + x.Collection + "/" + x.Name))
               .ForMember(d => d.NodeType, opt => opt.UseValue(NavigationNodeType.Page))
               .ForMember(d => d.Index, opt => opt.UseValue(null))
               .ForMember(d => d.IsLeaf, opt => opt.MapFrom(x => x.DocumentType == "blog"))
               ;

            Mapper.CreateMap<NavigationNode, NavigationRuntimeNode>()
                ;

            Mapper.CreateMap<NavigationNode, NavigationTreeNode>()
                ;

            Mapper.CreateMap<NavigationTreeNode, NavigationNode>()
                ;
        }

        const string _STRINGSPLITDELIM = "^^";
        static string JoinParts(params object[] parts)
        {
            return string.Join(_STRINGSPLITDELIM, parts);
        }
        static string[] SplitParts(string str)
        {
            return str.Split(new string[] { _STRINGSPLITDELIM }, StringSplitOptions.None);
        }
    }
}