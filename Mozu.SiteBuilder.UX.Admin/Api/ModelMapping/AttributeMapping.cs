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
            Mapper.CreateMap<ProductType, Contracts.ProductType>();
            Mapper.CreateMap<Contracts.ProductType, ProductType>();

            Mapper.CreateMap<Contracts.AttributeInProductType, ProductTypeAttribute>();
            Mapper.CreateMap<ProductTypeAttribute, Contracts.AttributeInProductType>();

            Mapper.CreateMap<Attribute, Contracts.Attribute>()
                .ForMember(x => x.AttributeFQN, opt => opt.MapFrom(x => x.Id))
                ;
            Mapper.CreateMap<Contracts.Attribute, Attribute>()
                .ForMember(x => x.Id, opt => opt.MapFrom(x => x.AttributeFQN))
                ;
        }
    }
}