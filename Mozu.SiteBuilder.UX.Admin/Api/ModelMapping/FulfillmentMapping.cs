using System.Linq;
using AutoMapper;
using CR = Mozu.CommerceRuntime.Contracts.Fulfillment;
using F = Kibo.Fulfillment.Contracts.Model;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class FulfillmentMapping : Profile
    {
        public FulfillmentMapping()
        {
            CreateMap<F.ResourceOfShipment, CR.Shipment>()
                .ForMember(x => x.Number, opt => opt.ResolveUsing(dc => dc.ShipmentNumber))
                .ForMember(x => x.Data, opt => opt.Ignore());

            CreateMap<F.Package, CR.Package>()
                .ForMember(x => x.ShippingMethodCode , opt => opt.ResolveUsing(dc => dc.ShippingMethodCode))
                .ForMember(x => x.TrackingNumbers, opt => opt.ResolveUsing(dc => dc.TrackingNumbers))
                .ForMember(x => x.AuditInfo, opt => opt.Ignore())
                .ForMember(x => x.ChangeMessages, opt => opt.Ignore())
                .ForMember(x => x.AvailableActions, opt => opt.Ignore())
                .ForMember(x => x.Measurements, opt => opt.Ignore())
                .ForMember(x => x.Items, opt => opt.Ignore())
                .ForMember(x => x.AuditInfo, opt => opt.Ignore());

            CreateMap<F.Tracking, CR.Tracking>()
               .ForMember(x => x.Attributes, opt => opt.ResolveUsing(dc => dc.Attributes))
               .ForMember(x => x.Number, opt => opt.ResolveUsing(dc => dc.Number))
               .ForMember(x => x.Url, opt => opt.ResolveUsing(dc => dc.Url));

            CreateMap<F.Item, CR.ShipmentItem>()
                .ForMember(x => x.FulfillmentLocationCode, opt => opt.Ignore())
                .ForMember(x => x.IsPackagedStandAlone, opt => opt.Ignore())
                .ForMember(x => x.Measurements, opt => opt.Ignore())
                .ForMember(x => x.Data, opt => opt.Ignore());

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