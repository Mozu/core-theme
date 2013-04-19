using System;
using AutoMapper;
using Mozu.SiteBuilder.UX.Models.Navigation;
using Mozu.SiteBuilder.Mvc.Extensions;

namespace Mozu.SiteBuilder.Mvc.Models.Mappings
{
    public class NavigationMapping : Profile
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
            Mapper.CreateMap<Mozu.SiteBuilder.UX.Models.Navigation.NavigationTreeNode, Mozu.SiteBuilder.UX.Models.Navigation.NavigationNode>()
                // .ForMember(x => x.IdParts, opt => opt.Ignore());
                ;

            Mapper.CreateMap<Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Product, NavigationRuntimeNode>()
                .ForMember(d => d.Name, opt => opt.MapFrom(x => x.ProductName))
                .ForMember(d => d.Url, opt => opt.MapFrom(x => "/product/" + x.ProductCode))
                .ForMember(dest => dest.Id, opt => opt.MapFrom(x => JoinParts("product", x.ProductCode )));

            Mapper.CreateMap<Mozu.ProductRuntime.Contracts.Product , NavigationRuntimeNode>()
              .ForMember(d => d.Name, opt => opt.MapFrom(x => x.Content.ProductName))
              .ForMember(d => d.Url, opt => opt.MapFrom(x => "/product/" + x.ProductCode))
              .ForMember(dest => dest.Id, opt => opt.MapFrom(x => JoinParts("product", x.ProductCode)));

            Mapper.CreateMap<Mozu.ProductAdmin.Contracts.Product, Mozu.SiteBuilder.UX.Models.Navigation.NavigationTreeNode>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(x => JoinParts("product", x.ProductCode)))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(x => x.Content.ProductName))
                .ForMember(dest => dest.NodeType, opt => opt.UseValue("product"))
                .ForMember(dest => dest.Leaf, opt => opt.UseValue(true))
                .ForMember(dest => dest.Url, opt => opt.MapFrom(x => ("/product/" + x.ProductCode)));

            Mapper.CreateMap<Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Category, NavigationRuntimeNode>()
                 .ForMember(d => d.Name, opt => opt.MapFrom(x => x.Name))
                .ForMember(d => d.Url, opt => opt.MapFrom(x => "/category/" + x.CategoryId))
                .ForMember(d=>d.Index, opt=> opt.MapFrom( x=>x.Index ))
                .ForMember(dest => dest.Id, opt => opt.MapFrom(x => JoinParts("category", x.CategoryId)))
                .ForMember(dest => dest.ParentId, opt => opt.MapFrom(x => JoinParts("category", x.ParentCategoryId.GetValueOrDefault(0))));

            Mapper.CreateMap<Mozu.ProductAdmin.Contracts.Category, Mozu.SiteBuilder.UX.Models.Navigation.NavigationTreeNode>()
               .ForMember(dest => dest.Id, opt => opt.MapFrom(x => JoinParts("category", x.Id)))
               .ForMember(dest => dest.Name, opt => opt.MapFrom(x => x.Content.Name))
               .ForMember(dest => dest.NodeType, opt => opt.UseValue("category"))
               .ForMember(dest => dest.Leaf, opt => opt.UseValue(false))
               .ForMember(dest => dest.Index, opt => opt.MapFrom(x => x.Sequence.GetValueOrDefault(0)))
               .ForMember(dest => dest.Url, opt => opt.MapFrom(x => ("/category/" + x.Id)));



            Mapper.CreateMap<NavigationNode , NavigationRuntimeNode>()
                .ForMember(d => d.Id , opt => opt.MapFrom(x => x.Id ));

            Mapper.CreateMap<NavigationTreeNode, NavigationRuntimeNode>()
                ;

            Mapper.CreateMap<Mozu.SiteBuilder.UX.Models.Navigation.NavigationNode, Mozu.SiteBuilder.UX.Models.Navigation.NavigationTreeNode>()
                //.ForMember(dest => dest.Leaf , opt => opt.MapFrom(x => x.ChildNodes == null || x.ChildNodes.Count == 0))
                  .ForMember(x => x.IdParts, opt => opt.Ignore());

            Mapper.CreateMap<Mozu.Content.Contracts.Document, Mozu.SiteBuilder.UX.Models.Navigation.NavigationTreeNode>()
               .ForMember(dest => dest.Id, opt => opt.MapFrom(x => JoinParts("page", x.DocumentListName, x.Id)))
                // .ForMember(dest => dest.Name, opt => opt.MapFrom(x => x.Properties.Where  ( prop=> prop.PropertyType == "title").Select( val=> val.Value ).FirstOrDefault () ?? x.Name ))
               .ForMember(dest => dest.Name, opt => opt.MapFrom(x => x.Get("link_title") ?? x.Get("title") ?? x.Name))
               .ForMember(dest => dest.NodeType, opt => opt.UseValue("page"))
               .ForMember(dest => dest.Leaf, opt => opt.MapFrom(x => x.DocumentType == "blog"))
               .ForMember(dest => dest.Url, opt => opt.MapFrom(x => "/" + x.DocumentListName + "/" + x.Name));

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