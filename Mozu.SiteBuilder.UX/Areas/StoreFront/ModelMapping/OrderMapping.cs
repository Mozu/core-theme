using System.Linq;
using AutoMapper;
using Mozu.Core.Api.Contracts;
using Mozu.SiteBuilder.UX.Areas.StoreFront.Models;
using DC = Mozu.CommerceRuntime.Contracts;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.ModelMapping
{
    public class OrderMapping : Profile
    {
        public override string ProfileName
        {
            get { return GetType().FullName; }
        }

        protected override void Configure()
        {
            Mapper.CreateMap<DC.Fulfillment.PackageItem, DetailedPackageItem>()
                .ForMember(x => x.AdjustedWeight, config => config.Ignore())
                .ForMember(x => x.ProductName, config => config.Ignore())
                ;

            Mapper.CreateMap<DC.Fulfillment.PickupItem, DetailedPickupItem>()
                .ForMember(x => x.AdjustedWeight, config => config.Ignore())
                .ForMember(x => x.ProductName, config => config.Ignore())
                ;
        }
    }
}
