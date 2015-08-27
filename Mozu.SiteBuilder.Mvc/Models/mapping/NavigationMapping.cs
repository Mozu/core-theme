using System;
using System.Linq;
using AutoMapper;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Models.Navigation;

namespace Mozu.SiteBuilder.Mvc.Models.Mapping
{
    public class NavigationMapping : Profile
    {
        public override string ProfileName  { get { return this.GetType().FullName; } }

        protected override void Configure()
        {

            // this mapping is used by Mozu.SiteBuilder.Mvc.Contexts.NavContext
            Mapper.CreateMap<Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Product, SimpleRuntimeNavigationNode>()
                .ForMember(d => d.Id, opt => opt.ResolveUsing(x => JoinParts("product", x.ProductCode)))
                .ForMember(d => d.OriginalId, opt => opt.ResolveUsing(x => x.ProductCode))
                .ForMember(d => d.Name, opt => opt.ResolveUsing(x => x.ProductName))
                .ForMember(d => d.Url, opt => opt.ResolveUsing(x => (x.Content == null || string.IsNullOrEmpty(x.Content.SEOFriendlyUrl)) ? "/p/" + x.ProductCode : "/" + x.Content.SEOFriendlyUrl + "/p/" + x.ProductCode))
                .ForMember(dest => dest.NodeType, opt => opt.UseValue(NavigationNodeType.Product))
                //.ForMember(dest => dest.IsLeaf, opt => opt.UseValue(true))
                //   .As<IRuntimeNavigationNode>()

                //.ConstructUsing(product => new SimpleRuntimeNavigationNode() {OriginalId = product.ProductCode});
                ;

            Mapper.CreateMap<Mozu.ProductRuntime.Contracts.Product, SimpleRuntimeNavigationNode>()
                .ForMember(d => d.Id, opt => opt.ResolveUsing(x => JoinParts("product", x.ProductCode)))
                .ForMember(d => d.OriginalId, opt => opt.ResolveUsing(x => x.ProductCode))
                .ForMember(d => d.Name, opt => opt.ResolveUsing(x => x.Content.ProductName))
                .ForMember(d => d.Url, opt => opt.ResolveUsing(x => (x.Content == null || string.IsNullOrEmpty(x.Content.SEOFriendlyUrl)) ? "/p/" + x.ProductCode : "/" + x.Content.SEOFriendlyUrl + "/p/" + x.ProductCode))//"/product/" + x.ProductCode))
                .ForMember(dest => dest.NodeType, opt => opt.UseValue(NavigationNodeType.Product))
                //.ForMember(dest => dest.IsLeaf, opt => opt.UseValue(true))
              //  .As<IRuntimeNavigationNode>()
                ;

            Mapper.CreateMap<Mozu.ProductAdmin.Contracts.Product, SimpleRuntimeNavigationNode>()
                .ForMember(d => d.Id, opt => opt.ResolveUsing(x => JoinParts("product", x.ProductCode)))
                .ForMember(d => d.OriginalId, opt => opt.ResolveUsing(x => x.ProductCode))
                .ForMember(d => d.Name, opt => opt.ResolveUsing(x => x.Content.ProductName))
                .ForMember(d => d.Url, opt => opt.ResolveUsing(x => (x.SEOContent == null || string.IsNullOrEmpty(x.SEOContent.SEOFriendlyUrl)) ? "/p/" + x.ProductCode : "/" + x.SEOContent.SEOFriendlyUrl + "/p/" + x.ProductCode))//"/product/" + x.ProductCode))
                .ForMember(dest => dest.NodeType, opt => opt.UseValue(NavigationNodeType.Product))
                //.ForMember(dest => dest.IsLeaf, opt => opt.UseValue(true))
             //   .As<IRuntimeNavigationNode>()
                ;

            // this mapping is used by Mozu.SiteBuilder.Mvc.Contexts.NavContext
            Mapper.CreateMap<Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Product, SimpleRuntimeNavigationNode>()
                .ForMember(d => d.Id, op => op.ResolveUsing(x => JoinParts("product", x.ProductCode)))
                .ForMember(d => d.OriginalId, op => op.ResolveUsing(x => x.ProductCode))
                .ForMember(d => d.Name, opt => opt.ResolveUsing(x => x.Content.ProductName))
                .ForMember(d => d.Url, opt => opt.ResolveUsing(x => (x.Content == null || string.IsNullOrEmpty(x.Content.SEOFriendlyUrl)) ? "/p/" + x.ProductCode : "/" + x.Content.SEOFriendlyUrl + "/p/" + x.ProductCode))
                .ForMember(dest => dest.NodeType, opt => opt.UseValue(NavigationNodeType.Product))
             //   .As<IRuntimeNavigationNode>()
                ;

            // this mapping is used by Mozu.SiteBuilder.Mvc.Contexts.NavContext
            Mapper.CreateMap<Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.Category, SimpleRuntimeNavigationNode>()
                .ForMember(d => d.Id, opt => opt.ResolveUsing(x => JoinParts("category", x.CategoryId)))
                .ForMember(d => d.IsHidden, opt => opt.ResolveUsing(x => !x.IsDisplayed))
                .ForMember(d => d.OriginalId, opt => opt.ResolveUsing(x => x.CategoryId))
                //.ForMember(d => d.ParentId, opt => opt.ResolveUsing(x => x.ParentCategoryId.HasValue ? JoinParts("category", x.ParentCategoryId.Value) : null))
                .ForMember(d => d.Name, opt => opt.ResolveUsing(x => x.Name))
                .ForMember(d => d.Url, opt => opt.ResolveUsing(x => (x.Content == null || string.IsNullOrEmpty(x.Content.Slug)) ? "/c/" + x.Id :"/"+ x.Content.Slug + "/c/" + x.CategoryId ))
                .ForMember(d => d.NodeType, opt => opt.UseValue(NavigationNodeType.Category))
                .ForMember(d => d.Index, opt => opt.ResolveUsing(x => x.Index))
                //.ForMember(d => d.IsLeaf, opt => opt.UseValue(false))
            //    .As<IRuntimeNavigationNode>()
                ;

            Mapper.CreateMap<Mozu.ProductAdmin.Contracts.Category, SimpleTreeNavigationNode>()
                .ForMember(d => d.Id, opt => opt.ResolveUsing(x => JoinParts("category", x.Id)))
                .ForMember(d => d.IsHidden, opt => opt.ResolveUsing(x => !x.IsDisplayed.GetValueOrDefault(true)))
                .ForMember(d => d.OriginalId, opt => opt.ResolveUsing(x => x.Id))
                .ForMember(d => d.ParentId, opt => opt.ResolveUsing(x => x.ParentCategoryId.HasValue ? JoinParts("category", x.ParentCategoryId.Value) : null))
                .ForMember(d => d.Name, opt => opt.ResolveUsing(x => x.Content.Name))
                .ForMember(d => d.Url, opt => opt.ResolveUsing(x => (x.Content == null || string.IsNullOrEmpty(x.Content.Slug)) ? "/c/" + x.Id : "/" + x.Content.Slug + "/c/" + x.Id))
                .ForMember(d => d.NodeType, opt => opt.UseValue(NavigationNodeType.Category))
                .ForMember(d => d.Index, opt => opt.ResolveUsing(x => x.Sequence))
                .ForMember(d => d.IsLeaf, opt => opt.UseValue(false))
                ;

            Mapper.CreateMap<Mozu.Content.Contracts.Document, SimpleTreeNavigationNode>()
               .ForMember(d => d.Id, opt => opt.ResolveUsing(x => JoinParts("page", x.ListFQN, x.Id)))
               .ForMember(d => d.OriginalId, opt => opt.ResolveUsing(x => x.Id))
               .ForMember(d => d.OriginalDocumentListName, opt => opt.ResolveUsing(x => x.ListFQN))
               .ForMember(d => d.ParentId, opt => opt.UseValue(null))
               .ForMember(d => d.Name, opt => opt.ResolveUsing(x =>
                   x.Get<string>("link_title").GetNullIfWhiteSpace() ?? x.Get<string>("title").GetNullIfWhiteSpace() ?? x.Name))
                   .ForMember(d => d.Url, opt => opt.ResolveUsing(x => string.Equals(x.ListFQN, "pages@mozu", StringComparison.OrdinalIgnoreCase) ? "/" + x.Name : "/" + x.ListFQN + "/" + x.Name))
               .ForMember(d => d.NodeType, opt => opt.UseValue(NavigationNodeType.Page))
               .ForMember(d => d.Index, opt => opt.UseValue(null))
               .ForMember(d => d.IsLeaf, opt => opt.ResolveUsing(x => x.DocumentTypeFQN == "blog" || x.DocumentTypeFQN == "page"))
               ;

            // this mapping is used by Mozu.SiteBuilder.Mvc.Contexts.NavContext
            Mapper.CreateMap<Mozu.Content.Contracts.Document, SimpleRuntimeNavigationNode>()
               .ForMember(d => d.Id, opt => opt.ResolveUsing(x => JoinParts("page", x.ListFQN, x.Id)))
               .ForMember(d => d.OriginalId, opt => opt.ResolveUsing(x => x.Id))
               .ForMember(d => d.OriginalDocumentListName, opt => opt.ResolveUsing(x => x.ListFQN))
               .ForMember(d => d.ParentId, opt => opt.UseValue(null))
               .ForMember(d => d.Name, opt => opt.ResolveUsing(x => x.Name))
               .ForMember(d => d.Url, opt => opt.ResolveUsing(x => string.Equals(x.ListFQN, "pages@mozu", StringComparison.OrdinalIgnoreCase) ? "/" + x.Name : "/" + x.ListFQN + "/" + x.Name))
               .ForMember(d => d.NodeType, opt => opt.UseValue(NavigationNodeType.Page))
               .ForMember(d => d.Index, opt => opt.UseValue(null))
             //  .ForMember(d => d.IsLeaf, opt => opt.ResolveUsing(x => x.DocumentTypeFQN == "blog"))
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
