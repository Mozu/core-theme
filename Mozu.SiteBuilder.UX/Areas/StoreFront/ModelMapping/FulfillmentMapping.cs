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
            CreateMap<F.EntityModelOfShipment, CR.Shipment>()
                .ForMember(dest => dest.Number, op => op.MapFrom(src => src.ShipmentNumber))
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
                .ForMember(x => x.Packages, op => op.MapFrom(x => x.Packages))
                .ForMember(dest => dest.PickupInfo, op =>
                {
                    op.PreCondition(src => src.PickupInfo != null);
                    op.MapFrom(src => JObject.FromObject(src.PickupInfo));
                })
                .ForMember(dest => dest.AlternateContact, op =>
                {
                    op.PreCondition(src => src.AlternateContact != null);
                    op.MapFrom(src => src.AlternateContact);
                });

            CreateMap<F.Contact, CR.AlternateContact>()
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.PhoneNumbers.Home ?? src.PhoneNumbers.Mobile ?? src.PhoneNumbers.Work))
                .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.FirstName))
                .ForMember(dest => dest.LastNameOrSurname, opt => opt.MapFrom(src => src.LastNameOrSurname));

            CreateMap<F.Item, CR.ShipmentItem>()
                .ForMember(dest => dest.Data, opt =>
                {
                    opt.PreCondition(src => src.Data != null);
                    opt.MapFrom(src => JObject.FromObject(src.Data));
                })
                .ForMember(x => x.FulfillmentLocationCode, opt => opt.Ignore())
                .ForMember(x => x.IsPackagedStandAlone, opt => opt.Ignore())
                .ForMember(x => x.Measurements, opt => opt.Ignore());

            CreateMap<F.ChangeMessage, CommerceRuntime.Contracts.Commerce.ChangeMessage>()
                .ForMember(x => x.Id, opt => opt.Ignore())
                .ForMember(x => x.UserScopeType, opt => opt.Ignore())
                .ForMember(x => x.CreateDate, opt => opt.Ignore());

            CreateMap<F.CanceledItem, CR.CanceledItem>()
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

            CreateMap<F.Destination, CR.Destination>()
                .ForMember(dest => dest.Id, op => op.Ignore());

            CreateMap<CR.Destination, F.Destination>()
                .ForMember(dest => dest.LocationCode, op => op.Ignore());

            CreateMap<Core.Api.Contracts.Contact, F.Contact>()
                .ForMember(dest => dest.Attributes, op => op.Ignore())
                .ForMember(dest => dest.FullName, op => op.Ignore())
                .ForMember(dest => dest.ShortFullName, op => op.Ignore());

            CreateMap<Core.Api.Contracts.Address, F.Address>()
                .ForMember(dest => dest.Attributes, op => op.Ignore())
                .ForMember(dest => dest.Latitude, op => op.Ignore())
                .ForMember(dest => dest.Longitude, op => op.Ignore());

            CreateMap<Core.Api.Contracts.Phone, F.Phone>()
                .ForMember(dest => dest.Attributes, op => op.Ignore());

            CreateMap<CR.Shipment, F.EntityModelOfShipment>()
                .ForMember(x => x.Data, opt => opt.Ignore()) // Mapping this would create a Dictionary<string, object>() where the values are JValue wrappers.
                .ForMember(x => x.ShipmentNumber, opt => opt.MapFrom(dc => dc.Number));

            CreateMap<CR.FulfillmentTask, F.Task>();
            CreateMap<F.Task, CR.FulfillmentTask>();

            CreateMap<F.Package, CR.Package>()
                .ForMember(dest => dest.Id, o => o.MapFrom(v => v.PackageId))
                .ForMember(dest => dest.PackingSlipNumber, o => o.MapFrom(v => v.PackingSlipNumber))
                .ForMember( dest => dest.TrackingNumbers, o=> o.MapFrom(x => x.TrackingNumbers))
                .ForMember(dest => dest.Trackings, o => o.MapFrom(v => v.Trackings))
                .ForMember(dest => dest.Measurements, o => o.MapFrom(v => v.Measurements))
                .ForMember(dest => dest.PackingSlipItemDetails, o => o.MapFrom(v => v.PackingSlipItemDetails))
                ;

            CreateMap<F.PackingSlipItemDetailDto, CR.PackingSlipItemDetail>()
                .ForMember(dest => dest.LineId, o => o.MapFrom(v => v.LineId))
                .ForMember(dest => dest.OriginalOrderItemId, o => o.MapFrom(v => v.OriginalOrderItemId))
                .ForMember(dest => dest.Quantity, o => o.MapFrom(v => v.Quantity))
                .ForMember(dest => dest.Attributes, o => o.MapFrom(v => v.Attributes));

        }
    }
}