using System;
using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models.PhoneOrder;
using RuntimeProductContract = Volusion.ProductRuntime.Contracts.Product;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    /// <summary>
    /// Defines AutoMapper mappings from <code>Volusion.ProductRuntime.Contracts.Product</code> 
    /// to <code>Mozu.SiteBuilder.UX.Admin.Api.Models.PhoneOrder.RuntimeProduct</code>
    /// </summary>
    public class RuntimeProductMapping : Profile
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
            Mapper.CreateMap<RuntimeProductContract, RuntimeProduct>()
                .ForMember(p => p.Name,
                           m => m.MapFrom(p => p.Content.ProductName))
                .ForMember(p => p.FullDescription,
                           m => m.MapFrom(p => p.Content.ProductFullDescription));
        }
    }
}