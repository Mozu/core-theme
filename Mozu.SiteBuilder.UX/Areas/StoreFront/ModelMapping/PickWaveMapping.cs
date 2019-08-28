using AutoMapper;
using System.Collections.Generic;
using CR = Mozu.CommerceRuntime.Contracts.Fulfillment;
using FC = Mozu.Fulfiller.Contracts.Model;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.ModelMapping
{
    public class PickWaveMapping : Profile
    {
        public PickWaveMapping()
        {
            CreateMap<FC.PickWaveContent, CR.ShipmentItem>()
                .ForMember(d => d.Id, op => op.Ignore())
                .ForMember(d => d.LineId, op => op.MapFrom(s => s.ItemLineId))
                .ForMember(d => d.OriginalOrderItemId, op => op.Ignore())
                .ForMember(d => d.ParentId, op => op.Ignore())
                .ForMember(d => d.ProductCode, op => op.MapFrom(s => s.ProductCode))
                .ForMember(d => d.VariationProductCode, op => op.MapFrom(s => s.VariationProductCode))
                .ForMember(d => d.OptionAttributeFQN, op => op.MapFrom(s => s.OptionAttributeFQN))
                .ForMember(d => d.Name, op => op.MapFrom(s => s.Name))
                .ForMember(d => d.FulfillmentLocationCode, op => op.Ignore())
                .ForMember(d => d.ImageUrl, op => op.MapFrom(s => s.ImageUrl))
                .ForMember(d => d.IsTaxable, op => op.Ignore())
                .ForMember(d => d.Quantity, op => op.MapFrom(s => s.Quantity))
                .ForMember(d => d.UnitPrice, op => op.Ignore())
                .ForMember(d => d.ActualPrice, op => op.Ignore())
                .ForMember(d => d.ItemDiscount, op => op.Ignore())
                .ForMember(d => d.LineItemCost, op => op.Ignore())
                .ForMember(d => d.ItemTax, op => op.Ignore())
                .ForMember(d => d.Shipping, op => op.Ignore())
                .ForMember(d => d.ShippingDiscount, op => op.Ignore())
                .ForMember(d => d.ShippingTax, op => op.Ignore())
                .ForMember(d => d.Handling, op => op.Ignore())
                .ForMember(d => d.HandlingDiscount, op => op.Ignore())
                .ForMember(d => d.HandlingTax, op => op.Ignore())
                .ForMember(d => d.Duty, op => op.Ignore())
                .ForMember(d => d.Weight, op => op.Ignore())
                .ForMember(d => d.WeightUnit, op => op.Ignore())
                ;

            CreateMap<FC.ResourceOfShipment, CR.Shipment>()
                .ForMember(d => d.ChangeMessages, op => op.Ignore())
                .ForMember(d => d.Packages, op => op.Ignore())
                .ForMember(d => d.Items, op => op.ResolveUsing(d => Mapper.Map<List<CR.ShipmentItem>>(d.Items)))
                ;

            CreateMap<FC.Item, CR.ShipmentItem>()
                .ForMember(d => d.Id, op => op.Ignore())
                .ForMember(d => d.LineId, op => op.MapFrom(d => d.LineId))
                .ForMember(d => d.OriginalOrderItemId, op => op.MapFrom(d => d.OriginalOrderItemId))
                .ForMember(d => d.ParentId, op => op.MapFrom(d => d.ParentId))
                .ForMember(d => d.ProductCode, op => op.MapFrom(d => d.ProductCode))
                .ForMember(d => d.VariationProductCode, op => op.MapFrom(d => d.VariationProductCode))
                .ForMember(d => d.OptionAttributeFQN, op => op.MapFrom(d => d.OptionAttributeFQN))
                .ForMember(d => d.Name, op => op.MapFrom(d => d.Name))
                .ForMember(d => d.FulfillmentLocationCode, op => op.MapFrom(d => d.FulfillmentLocationCode))
                .ForMember(d => d.ImageUrl, op => op.MapFrom(d => d.ImageUrl))
                .ForMember(d => d.IsTaxable, op => op.MapFrom(d => d.IsTaxable))
                .ForMember(d => d.Quantity, op => op.MapFrom(d => d.Quantity))
                .ForMember(d => d.UnitPrice, op => op.MapFrom(d => d.UnitPrice))
                .ForMember(d => d.ActualPrice, op => op.MapFrom(d => d.ActualPrice))
                .ForMember(d => d.ItemDiscount, op => op.MapFrom(d => d.ItemDiscount))
                .ForMember(d => d.LineItemCost, op => op.MapFrom(d => d.LineItemCost))
                .ForMember(d => d.ItemTax, op => op.MapFrom(d => d.ItemTax))
                .ForMember(d => d.Shipping, op => op.MapFrom(d => d.Shipping))
                .ForMember(d => d.ShippingDiscount, op => op.MapFrom(d => d.ShippingDiscount))
                .ForMember(d => d.ShippingTax, op => op.MapFrom(d => d.ShippingTax))
                .ForMember(d => d.Handling, op => op.MapFrom(d => d.Handling))
                .ForMember(d => d.HandlingDiscount, op => op.MapFrom(d => d.HandlingDiscount))
                .ForMember(d => d.HandlingTax, op => op.MapFrom(d => d.HandlingTax))
                .ForMember(d => d.Duty, op => op.MapFrom(d => d.Duty))
                .ForMember(d => d.Weight, op => op.MapFrom(d => d.Weight))
                .ForMember(d => d.WeightUnit, op => op.MapFrom(d => d.WeightUnit))
                ;
        }
    }
}