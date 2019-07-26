using AutoMapper;
using Mozu.SiteBuilder.UX.Areas.StoreFront.Models;
using DC = Mozu.CommerceRuntime.Contracts;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.ModelMapping
{
    public class OrderMapping : Profile
    {
        public OrderMapping()
        {
            CreateMap<DC.Fulfillment.PackageItem, DetailedPackageItem>()
                .ForMember(x => x.AdjustedWeight, config => config.Ignore())
                .ForMember(x => x.ProductName, config => config.Ignore())
                ;

            CreateMap<DC.Fulfillment.PickupItem, DetailedPickupItem>()
                .ForMember(x => x.AdjustedWeight, config => config.Ignore())
                .ForMember(x => x.ProductName, config => config.Ignore())
                ;

            CreateMap<DC.Fulfillment.ShipmentItem, DetailedShipmentItem>()
                .ForMember(x => x.AdjustedWeight, config => config.Ignore())
                .ForMember(x => x.ProductName, config => config.Ignore())
                ;
        }
    }
}
