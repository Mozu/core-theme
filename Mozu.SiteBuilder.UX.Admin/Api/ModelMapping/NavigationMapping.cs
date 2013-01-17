using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper;


namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
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
        const string _STRINGSPLITDELIM = "^^";
        static string JoinParts(params object[] parts)
        {
            return string.Join(_STRINGSPLITDELIM, parts);
        }
        static string[] SplitParts(string str)
        {
            return str.Split(new string[] { _STRINGSPLITDELIM }, StringSplitOptions.None);
        }


        protected override void Configure()
        {
            Mapper.CreateMap<Mozu.SiteBuilder.UX.Models.Navigation.NavigationTreeNode, Mozu.SiteBuilder.UX.Models.Navigation.NavigationNode>()
                 .ForMember(x => x.IdParts, opt => opt.Ignore());
                ;

            Mapper.CreateMap<Mozu.SiteBuilder.UX.Models.Navigation.NavigationNode, Mozu.SiteBuilder.UX.Models.Navigation.NavigationTreeNode>()
                //.ForMember(dest => dest.Leaf , opt => opt.MapFrom(x => x.ChildNodes == null || x.ChildNodes.Count == 0))
                  .ForMember(dest => dest.Items, opt => opt.Ignore())
                  .ForMember(x => x.IdParts, opt => opt.Ignore());


            Mapper.CreateMap<Mozu.ProductAdmin.Contracts.Product, Mozu.SiteBuilder.UX.Models.Navigation.NavigationTreeNode>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(x => JoinParts("product", x.ProductCode )))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(x => x.Content.ProductName))
                .ForMember(dest => dest.NodeType, opt => opt.UseValue("product"))
                .ForMember(dest => dest.Leaf, opt => opt.UseValue(true))
                .ForMember(dest => dest.Url , opt => opt.MapFrom ( x => ("/product/"+ x.ProductCode )));

            Mapper.CreateMap<Mozu.ProductAdmin.Contracts.Category , Mozu.SiteBuilder.UX.Models.Navigation.NavigationTreeNode>()
               .ForMember(dest => dest.Id, opt => opt.MapFrom(x => JoinParts("category", x.Id )))
               .ForMember(dest => dest.Name, opt => opt.MapFrom(x => x.Content.Name ))
               .ForMember(dest => dest.NodeType, opt => opt.UseValue("category"))
               .ForMember(dest => dest.Leaf, opt => opt.UseValue(false))
               .ForMember(dest => dest.Index , opt => opt.MapFrom( x=> x.Sequence.GetValueOrDefault(0)))
               .ForMember(dest => dest.Url, opt => opt.MapFrom(x => ("/category/" + x.Id )));


            Mapper.CreateMap<Mozu.Content.Contracts.Document, Mozu.SiteBuilder.UX.Models.Navigation.NavigationTreeNode>()
               .ForMember(dest => dest.Id, opt => opt.MapFrom(x => JoinParts("page",x.ContentCollection, x.Id )))
               .ForMember(dest => dest.Name, opt => opt.MapFrom(x => x.Properties.Where  ( prop=> prop.PropertyType == "title").Select( val=> val.Value ).FirstOrDefault () ?? x.Name ))
               .ForMember(dest => dest.NodeType, opt => opt.UseValue("page"))
               .ForMember(dest => dest.Leaf, opt => opt.MapFrom (x=> x.DocumentType =="blog") )
               .ForMember(dest => dest.Url, opt => opt.MapFrom(x =>  "/" + x.ContentCollection + "/" + x.Name ));


        }
    }
}