using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    using Contracts = ProductAdmin.Contracts;

    public class AttributeMapping : Profile
    {
        public override string ProfileName
        {
            get
            {
                return GetType().FullName;
            }
        }

        protected override void Configure()
        {
            Mapper.CreateMap<ProductType, Contracts.ProductType>()
                .ForMember(x => x.Options, opt => opt.MapFrom(x => x.Options))
                ;
            Mapper.CreateMap<Contracts.ProductType, ProductType>()
                ;

            Mapper.CreateMap<Contracts.AttributeInProductType, ProductTypeAttribute>()
                ;
            Mapper.CreateMap<ProductTypeAttribute, Contracts.AttributeInProductType>()
                ;
        }
    }
}