using AutoMapper;
using C = Mozu.ProductAdmin.Contracts;
using D = Mozu.SiteBuilder.UX.Admin.Api.Models.DiscountSettings;


namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class DiscountSettingsMapping : Profile
    {

        public DiscountSettingsMapping()
        {
            CreateMap<C.DiscountSettings, D.DiscountSettings>();
            CreateMap<D.DiscountSettings, C.DiscountSettings>();
            CreateMap<C.StackingConfiguration, D.StackingConfiguration>();
            CreateMap<D.StackingConfiguration, C.StackingConfiguration>();
        }

    }
}