using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Newtonsoft.Json.Linq;
using CR = Mozu.CommerceRuntime.Contracts.Fulfillment;
using F = Kibo.Fulfillment.Contracts.Model;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.ModelMapping
{
    public class FulfillmentMapping : Profile
    {
        public FulfillmentMapping()
        {
<<<<<<< HEAD
            CreateMap<F.ResourceOfShipment, CR.Shipment>()
                .ForMember(dest => dest.Number, op => op.MapFrom(src => src.ShipmentNumber))
=======
            CreateMap<F.EntityModelOfShipment, CR.Shipment>()
                .ForMember(dest => dest.Number, op => op.ResolveUsing(src => src.ShipmentNumber))
>>>>>>> feature/sitebuilder-storefront
                .ForMember(dest => dest.Data, op =>
                {
                    op.PreCondition(src => src.Data != null);
                    op.MapFrom(src => JObject.FromObject(src.Data));
                })
                .ForMember(dest => dest.Id, op => op.Ignore())
                .ForMember(dest => dest.Origin, op => op.Ignore())
                .ForMember(dest => dest.WorkflowProcessContainerId, op => op.Ignore())
                .ForMember(dest => dest.WorkflowProcessId, op => op.Ignore())
                .ForMember(dest => dest.BackorderCreatedDate, op => op.Ignore())
                .ForMember(dest => dest.Cost, op => op.MapFrom(_=>1m))
                .ForMember(x => x.Packages, op => op.Ignore());

            CreateMap<F.Item, CR.ShipmentItem>()
                .ForMember(dest => dest.Data, opt =>
                {
                    opt.PreCondition(src => src.Data != null);
                    opt.MapFrom(src => JObject.FromObject(src.Data));
                })
                .ForMember(x => x.FulfillmentLocationCode, opt => opt.Ignore())
                .ForMember(x => x.IsPackagedStandAlone, opt => opt.Ignore())
                .ForMember(x => x.Measurements, opt => opt.Ignore());

            CreateMap<F.ChangeMessage, Mozu.CommerceRuntime.Contracts.Commerce.ChangeMessage>()
                .ForMember(x => x.Id, opt => opt.Ignore())
                .ForMember(x => x.UserScopeType, opt => opt.Ignore())
                .ForMember(x => x.CreateDate, opt => opt.Ignore());

            CreateMap<F.CanceledItem, Mozu.CommerceRuntime.Contracts.Fulfillment.CanceledItem>()
                .ForMember(dest => dest.Data, opt =>
                {
                    opt.PreCondition(src => src.Data != null);
                    opt.MapFrom(src => JObject.FromObject(src.Data));
                })
                .ForMember(x => x.FulfillmentLocationCode, opt => opt.Ignore())
                .ForMember(x => x.IsPackagedStandAlone, opt => opt.Ignore())
                .ForMember(x => x.Measurements, opt => opt.Ignore());

            CreateMap<F.CanceledReason, Mozu.CommerceRuntime.Contracts.Orders.CanceledReason>()
                .ForMember(x => x.Description, opt => opt.Ignore());

            CreateMap<CR.Shipment, F.EntityModelOfShipment>()
                .ForMember(x => x.Data, opt => opt.Ignore()) // Mapping this would create a Dictionary<string, object>() where the values are JValue wrappers.
                .ForMember(x => x.ShipmentNumber, opt => opt.MapFrom(dc => dc.Number));

            CreateMap<CR.FulfillmentTask, F.Task>();
            CreateMap<F.Task, CR.FulfillmentTask>();
        }
    }
}