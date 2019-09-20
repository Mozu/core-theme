using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Newtonsoft.Json.Linq;
using CR = Mozu.CommerceRuntime.Contracts.Fulfillment;
using F = Mozu.Fulfillment.Contracts.Model;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class FulfillmentMapping : Profile
    {
        public FulfillmentMapping()
        {
            CreateMap<F.ResourceOfShipment, CR.Shipment>()
                .ForMember(x => x.Number, opt => opt.ResolveUsing(dc => dc.ShipmentNumber))
                .ForMember(x => x.Packages, opt => opt.Ignore());

            CreateMap<F.Item, CR.ShipmentItem>()
                .ForMember(x => x.FulfillmentLocationCode, opt => opt.Ignore())
                .ForMember(x => x.IsPackagedStandAlone, opt => opt.Ignore())
                .ForMember(x => x.Measurements, opt => opt.Ignore());

            CreateMap<F.ChangeMessage, Mozu.CommerceRuntime.Contracts.Commerce.ChangeMessage>()
                .ForMember(x => x.Id, opt => opt.Ignore())
                .ForMember(x => x.UserScopeType, opt => opt.Ignore())
                .ForMember(x => x.CreateDate, opt => opt.Ignore());

            CreateMap<CR.Shipment, F.ResourceOfShipment>()
                .ForMember(x => x.ShipmentNumber, opt => opt.ResolveUsing(dc => dc.Number));
        }
    }
}