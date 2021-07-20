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

            CreateMap<Kibo.Fulfillment.Contracts.Model.Item, ShipmentInventoryDetails>()
                .ForMember(x => x.StockAvailable, config => config.Ignore())
                .ForMember(x => x.StockAllocated, config => config.Ignore())
                .ForMember(x => x.StockOnBackOrder, config => config.Ignore())
                .ForMember(x => x.SafetyStock, config => config.Ignore())
                .ForMember(x => x.Ltd, config => config.Ignore())
                .ForMember(x => x.Floor, config => config.Ignore())
                .ForMember(x => x.PendingStock, config => config.Ignore())
                .ForMember(x => x.StockOnHand, config => config.Ignore());
        }
    }
}
