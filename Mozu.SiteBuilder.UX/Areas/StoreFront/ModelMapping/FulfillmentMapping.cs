using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Newtonsoft.Json.Linq;
using CR = Mozu.CommerceRuntime.Contracts.Fulfillment;
using F = Mozu.Fulfillment.Contracts.Model;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.ModelMapping
{
    public class FulfillmentMapping : Profile
    {
        public FulfillmentMapping()
        {
            CreateMap<F.ResourceOfShipment, CR.Shipment>()
            .ForMember(dest => dest.Number, src => src.ResolveUsing(dc => dc.ShipmentNumber))
            .ForMember(dest => dest.Id, op => op.Ignore())
            .ForMember(dest => dest.Origin, op => op.Ignore())
            .ForMember(dest => dest.WorkflowProcessContainerId, op => op.Ignore())
            .ForMember(dest => dest.WorkflowProcessId, op => op.Ignore())
            .ForMember(dest => dest.BackorderCreatedDate, op => op.Ignore())
            .ForMember(dest => dest.Cost, op => op.UseValue(1m))
            .ForMember(x => x.Packages, op => op.Ignore());

            CreateMap<F.Item, CR.ShipmentItem>()
                .ForMember(x => x.FulfillmentLocationCode, opt => opt.Ignore())
                .ForMember(x => x.IsPackagedStandAlone, opt => opt.Ignore())
                .ForMember(x => x.Measurements, opt => opt.Ignore());

            CreateMap<F.ChangeMessage, Mozu.CommerceRuntime.Contracts.Commerce.ChangeMessage>()
                .ForMember(x => x.Id, opt => opt.Ignore())
                .ForMember(x => x.UserScopeType, opt => opt.Ignore())
                .ForMember(x => x.CreateDate, opt => opt.Ignore());

            CreateMap<F.CanceledItem, Mozu.CommerceRuntime.Contracts.Fulfillment.CanceledItem>()
                .ForMember(x => x.FulfillmentLocationCode, opt => opt.Ignore())
                .ForMember(x => x.IsPackagedStandAlone, opt => opt.Ignore())
                .ForMember(x => x.Measurements, opt => opt.Ignore());

            CreateMap<F.CanceledReason, Mozu.CommerceRuntime.Contracts.Orders.CanceledReason>()
                .ForMember(x => x.Description, opt => opt.Ignore());


            CreateMap<CR.Shipment, F.ResourceOfShipment>()
                .ForMember(x => x.ShipmentNumber, opt => opt.ResolveUsing(dc => dc.Number));
        }
    }
}