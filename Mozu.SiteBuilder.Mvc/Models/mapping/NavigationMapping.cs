using AutoMapper;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using System;
using Mozu.SiteBuilder.UX.Models.Navigation;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.ModelMapping
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

            Mapper.CreateMap<Product, NavigationRuntimeNode>()
                .ForMember(d => d.Name, opt => opt.MapFrom(x => x.ProductName))
                .ForMember(d => d.Url, opt => opt.MapFrom(x => "/product/" + x.ProductCode))
                .ForMember(dest => dest.Id, opt => opt.MapFrom(x => JoinParts("product", x.ProductCode )));
            Mapper.CreateMap<Mozu.ProductRuntime.Contracts.Product , NavigationRuntimeNode>()
              .ForMember(d => d.Name, opt => opt.MapFrom(x => x.Content.ProductName))
              .ForMember(d => d.Url, opt => opt.MapFrom(x => "/product/" + x.ProductCode))
              .ForMember(dest => dest.Id, opt => opt.MapFrom(x => JoinParts("product", x.ProductCode)));
   

            Mapper.CreateMap<Category, NavigationRuntimeNode>()
                 .ForMember(d => d.Name, opt => opt.MapFrom(x => x.Name))
                .ForMember(d => d.Url, opt => opt.MapFrom(x => "/category/" + x.CategoryId))
                .ForMember(d=>d.Index, opt=> opt.MapFrom( x=>x.Index ))
                .ForMember(dest => dest.Id, opt => opt.MapFrom(x => JoinParts("category", x.CategoryId)))
                .ForMember(dest => dest.ParentId, opt => opt.MapFrom(x => JoinParts("category", x.ParentCategoryId.GetValueOrDefault(0))));

            Mapper.CreateMap<NavigationNode , NavigationRuntimeNode>()
                .ForMember(d => d.Id , opt => opt.MapFrom(x => x.Id ));


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