using System;
using AutoMapper;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Models.Navigation;

namespace Mozu.SiteBuilder.Mvc.Models.Mapping
{
    public class NavigationMapping : Profile
    {
        public NavigationMapping() {
            // this mapping is used by Mozu.SiteBuilder.Mvc.Contexts.NavContext
            CreateMap<UX.Models.StoreFront.Catalog.Product, SimpleRuntimeNavigationNode>()
                .ForMember(d => d.Id, opt => opt.MapFrom(x => JoinParts("product", x.ProductCode)))
                .ForMember(d => d.OriginalId, opt => opt.MapFrom(x => x.ProductCode))
                .ForMember(d => d.Name, opt => opt.MapFrom(x =>
                    x.Content != null && !string.IsNullOrEmpty(x.Content.ProductName) ?
                        x.Content.ProductName :
                        x.ProductName))
                .ForMember(d => d.Url,
                    opt => opt.MapFrom(x => (x.Content == null || string.IsNullOrEmpty(x.Content.SEOFriendlyUrl))
                        ? "/p/" + x.ProductCode
                        : "/" + x.Content.SEOFriendlyUrl + "/p/" + x.ProductCode))
                .ForMember(dest => dest.NodeType, opt => opt.MapFrom(v => NavigationNodeType.Product))
                ;

            CreateMap<Mozu.ProductRuntime.Contracts.Product, SimpleRuntimeNavigationNode>()
                .ForMember(d => d.Id, opt => opt.MapFrom(x => JoinParts("product", x.ProductCode)))
                .ForMember(d => d.OriginalId, opt => opt.MapFrom(x => x.ProductCode))
                .ForMember(d => d.Name, opt => opt.MapFrom(x => x.Content.ProductName))
                .ForMember(d => d.Url, opt => opt.MapFrom(x => (x.Content == null || string.IsNullOrEmpty(x.Content.SEOFriendlyUrl)) ? "/p/" + x.ProductCode : "/" + x.Content.SEOFriendlyUrl + "/p/" + x.ProductCode))//"/product/" + x.ProductCode))
                .ForMember(dest => dest.NodeType, opt => opt.MapFrom(v => NavigationNodeType.Product))
                //.ForMember(dest => dest.IsLeaf, opt => opt.MapFrom(true))
              //  .As<IRuntimeNavigationNode>()
                ;

            CreateMap<Mozu.ProductAdmin.Contracts.Product, SimpleRuntimeNavigationNode>()
                .ForMember(d => d.Id, opt => opt.MapFrom(x => JoinParts("product", x.ProductCode)))
                .ForMember(d => d.OriginalId, opt => opt.MapFrom(x => x.ProductCode))
                .ForMember(d => d.Name, opt => opt.MapFrom(x => x.Content.ProductName))
                .ForMember(d => d.Url, opt => opt.MapFrom(x => (x.SEOContent == null || string.IsNullOrEmpty(x.SEOContent.SEOFriendlyUrl)) ? "/p/" + x.ProductCode : "/" + x.SEOContent.SEOFriendlyUrl + "/p/" + x.ProductCode))//"/product/" + x.ProductCode))
                .ForMember(dest => dest.NodeType, opt => opt.MapFrom(v => NavigationNodeType.Product))
                //.ForMember(dest => dest.IsLeaf, opt => opt.MapFrom(true))
             //   .As<IRuntimeNavigationNode>()
                ;

            // this mapping is used by Mozu.SiteBuilder.Mvc.Contexts.NavContext
            CreateMap<Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Product, SimpleRuntimeNavigationNode>()
                .ForMember(d => d.Id, op => op.MapFrom(x => JoinParts("product", x.ProductCode)))
                .ForMember(d => d.OriginalId, op => op.MapFrom(x => x.ProductCode))
                .ForMember(d => d.Name, opt => opt.MapFrom(x => x.Content.ProductName))
                .ForMember(d => d.Url, opt => opt.MapFrom(x => (x.Content == null || string.IsNullOrEmpty(x.Content.SEOFriendlyUrl)) ? "/p/" + x.ProductCode : "/" + x.Content.SEOFriendlyUrl + "/p/" + x.ProductCode))
                .ForMember(dest => dest.NodeType, opt => opt.MapFrom(v => NavigationNodeType.Product))
             //   .As<IRuntimeNavigationNode>()
                ;

            // this mapping is used by Mozu.SiteBuilder.Mvc.Contexts.NavContext
            CreateMap<Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Category, SimpleRuntimeNavigationNode>()
                .ForMember(d => d.Id, opt => opt.MapFrom(x => JoinParts("category", x.CategoryId)))
                .ForMember(d => d.IsHidden, opt => opt.MapFrom(x => !x.IsDisplayed))
                .ForMember(d => d.OriginalId, opt => opt.MapFrom(x => x.CategoryId))
                //.ForMember(d => d.ParentId, opt => opt.ResolveUsing(x => x.ParentCategoryId.HasValue ? JoinParts("category", x.ParentCategoryId.Value) : null))
                .ForMember(d => d.Name, opt => opt.MapFrom(x => x.Name))
                .ForMember(d => d.Url, opt => opt.MapFrom(x => (x.Content == null || string.IsNullOrEmpty(x.Content.Slug)) ? "/c/" + x.Id :"/"+ x.Content.Slug + "/c/" + x.CategoryId ))
                .ForMember(d => d.NodeType, opt => opt.MapFrom(v => NavigationNodeType.Category))
                .ForMember(d => d.Index, opt => opt.MapFrom(x => x.Index))
                //.ForMember(d => d.IsLeaf, opt => opt.MapFrom(false))
            //    .As<IRuntimeNavigationNode>()
                ;

            CreateMap<Mozu.ProductAdmin.Contracts.Category, SimpleTreeNavigationNode>()
                .ForMember(d => d.Id, opt => opt.MapFrom(x => JoinParts("category", x.Id)))
                .ForMember(d => d.IsHidden, opt => opt.MapFrom(x => !x.IsDisplayed.GetValueOrDefault(true)))
                .ForMember(d => d.OriginalId, opt => opt.MapFrom(x => x.Id))
                .ForMember(d => d.ParentId, opt => opt.MapFrom(x => x.ParentCategoryId.HasValue ? JoinParts("category", x.ParentCategoryId.Value) : null))
                .ForMember(d => d.Name, opt => opt.MapFrom(x => x.Content.Name))
                .ForMember(d => d.Url, opt => opt.MapFrom(x => (x.Content == null || string.IsNullOrEmpty(x.Content.Slug)) ? "/c/" + x.Id : "/" + x.Content.Slug + "/c/" + x.Id))
                .ForMember(d => d.NodeType, opt => opt.MapFrom(v => NavigationNodeType.Category))
                .ForMember(d => d.Index, opt => opt.MapFrom(x => x.Sequence))
                .ForMember(d => d.IsLeaf, opt => opt.MapFrom(c => false))
                ;

            CreateMap<Mozu.Content.Contracts.Document, SimpleTreeNavigationNode>()
               .ForMember(d => d.Id, opt => opt.MapFrom(x => JoinParts("page", x.ListFQN, x.Id)))
               .ForMember(d => d.OriginalId, opt => opt.MapFrom(x => x.Id))
               .ForMember(d => d.OriginalDocumentListName, opt => opt.MapFrom(x => x.ListFQN))
               .ForMember(d => d.ParentId, opt => opt.MapFrom(v => (string)null))
               .ForMember(d => d.Name, opt => opt.MapFrom(x =>
                   x.Get<string>("link_title", null).GetNullIfWhiteSpace() ??
                   x.Get<string>("title", null).GetNullIfWhiteSpace() ??
                   x.Name))
               .ForMember(d => d.Url, opt => opt.MapFrom(x => string.Equals(x.ListFQN, "pages@mozu", StringComparison.OrdinalIgnoreCase) ? "/" + x.Name : "/" + x.ListFQN + "/" + x.Name))
               .ForMember(d => d.NodeType, opt => opt.MapFrom(v => NavigationNodeType.Page))
               .ForMember(d => d.Index, opt => opt.MapFrom(d => -1))
               .ForMember(d => d.IsLeaf, opt => opt.MapFrom(x => x.DocumentTypeFQN == "blog" || x.DocumentTypeFQN == "page"))
               ;

            // this mapping is used by Mozu.SiteBuilder.Mvc.Contexts.NavContext
            CreateMap<Mozu.Content.Contracts.Document, SimpleRuntimeNavigationNode>()
               .ForMember(d => d.Id, opt => opt.MapFrom(x => JoinParts("page", x.ListFQN, x.Id)))
               .ForMember(d => d.OriginalId, opt => opt.MapFrom(x => x.Id))
               .ForMember(d => d.OriginalDocumentListName, opt => opt.MapFrom(x => x.ListFQN))
               .ForMember(d => d.ParentId, opt => opt.MapFrom(v => (string)null))
               .ForMember(d => d.Name, opt => opt.MapFrom(x => x.Name))
               .ForMember(d => d.Url, opt => opt.MapFrom(x => string.Equals(x.ListFQN, "pages@mozu", StringComparison.OrdinalIgnoreCase) ? "/" + x.Name : "/" + x.ListFQN + "/" + x.Name))
               .ForMember(d => d.NodeType, opt => opt.MapFrom(v => NavigationNodeType.Page))
               .ForMember(d => d.Index, opt => opt.MapFrom(d => -1))
             //  .ForMember(d => d.IsLeaf, opt => opt.MapFrom(x => x.DocumentTypeFQN == "blog"))
              // .As<IRuntimeNavigationNode>()
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
