using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using DC = Mozu.ProductRuntime.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    // TODO: I thought I needed this, but I really didn't. These aren't used anywhere right now.
    public class RuntimeProductMapping : Profile
    {
        public override string ProfileName
        {
            get { return GetType().FullName; }
        }

        protected override void Configure()
        {
//            Mozu.ProductRuntime.Contracts.ProductOption optionA;
//            Mozu.CommerceRuntime.Contracts.Products.ProductOption optionB;
//
//
//            Mapper.CreateMap<DC.ProductOption, RuntimeProductOption>()
//                .ForMember(x => x.AttributeFQN, op => op.MapFrom(dc => dc.AttributeFQN))
//                .ForMember(x => x.AttributeDetails, op => op.MapFrom(dc => dc.AttributeDetail))
//                .ForMember(x => x.IsMultiValue, op => op.MapFrom(dc => dc.IsMultiValue))
//                .ForMember(x => x.IsRequired, op => op.MapFrom(dc => dc.IsRequired))
//                .ForMember(x => x.Values, op => op.MapFrom(dc => dc.Values))
//                // TODO: Validation object? 
//                ;
//
//            Mapper.CreateMap<DC.AttributeDetail, RuntimeProductOption.AttributeDetail>()
//                .ForMember(x => x.Name, op => op.MapFrom(dc => dc.Name))
//                .ForMember(x => x.Description, op => op.MapFrom(dc => dc.Description))
//                .ForMember(x => x.UsageType, op => op.MapFrom(dc => dc.UsageType))
//                .ForMember(x => x.ValueType, op => op.MapFrom(dc => dc.ValueType))
//                .ForMember(x => x.InputType, op => op.MapFrom(dc => dc.InputType))
//                .ForMember(x => x.DataTypeSequence, op => op.MapFrom(dc => dc.DataTypeSequence))
//                .ForMember(x => x.Name, op => op.MapFrom(dc => dc.Name))
//                ;
//
//            Mapper.CreateMap<DC.ProductOptionValue, RuntimeProductOption.OptionValue>()
//                .ForMember(x => x.AttributeValueId, op => op.MapFrom(dc => dc.AttributeValueId))
//                .ForMember(x => x.DeltaPrice, op => op.MapFrom(dc => dc.DeltaPrice))
//                .ForMember(x => x.DeltaWeight, op => op.MapFrom(dc => dc.DeltaWeight))
//                .ForMember(x => x.IsDefault, op => op.MapFrom(dc => dc.IsDefault))
//                .ForMember(x => x.IsEnabled, op => op.MapFrom(dc => dc.IsEnabled))
//                .ForMember(x => x.IsSelected, op => op.MapFrom(dc => dc.IsSelected))
//                .ForMember(x => x.Value, op => op.MapFrom(dc => dc.Value))
//                ;
//
//            Mapper.CreateMap<RuntimeProductOption, DC.ProductOption>()
//                .ForMember(dc => dc.AttributeFQN, op => op.MapFrom(x => x.AttributeFQN))
//                .ForMember(dc => dc.AttributeDetail, op => op.MapFrom(x => x.AttributeDetails))
//                .ForMember(dc => dc.IsMultiValue, op => op.MapFrom(x => x.IsMultiValue))
//                .ForMember(dc => dc.IsRequired, op => op.MapFrom(x => x.IsRequired))
//                .ForMember(dc => dc.Values, op => op.MapFrom(x => x.Values))
//                .AfterMap((rpo, dc) =>
//                {
//                    switch (dc.AttributeDetail.DataType)
//                    {
//                        case "Number":
//                            dc.Values.Each(v => v.Value = Convert.ToDecimal(v.Value));
//                            break;
//                        case "DateTime":
//                            dc.Values.Each(v => v.Value = Convert.ToDateTime(v.Value));
//                            break;
//                        case "Bool":
//                            dc.Values.Each(v => v.Value = Convert.ToBoolean(v.Value));
//                            break;
//                        case "String":
//                            break;
//                    }
//                })
//                ;
//
//            Mapper.CreateMap<RuntimeProductOption.AttributeDetail, DC.AttributeDetail>()
//                .ForMember(dc => dc.Name, op => op.MapFrom(x => x.Name))
//                .ForMember(dc => dc.Description, op => op.MapFrom(x => x.Description))
//                .ForMember(dc => dc.UsageType, op => op.MapFrom(x => x.UsageType))
//                .ForMember(dc => dc.ValueType, op => op.MapFrom(x => x.ValueType))
//                .ForMember(dc => dc.InputType, op => op.MapFrom(x => x.InputType))
//                .ForMember(dc => dc.DataTypeSequence, op => op.MapFrom(x => x.DataTypeSequence))
//                .ForMember(dc => dc.Name, op => op.MapFrom(x => x.Name))
//                ;
//
//            Mapper.CreateMap<RuntimeProductOption.OptionValue, DC.ProductOptionValue>()
//                .ForMember(dc => dc.AttributeValueId, op => op.MapFrom(x => x.AttributeValueId))
//                .ForMember(dc => dc.DeltaPrice, op => op.MapFrom(x => x.DeltaPrice))
//                .ForMember(dc => dc.DeltaWeight, op => op.MapFrom(x => x.DeltaWeight))
//                .ForMember(dc => dc.IsDefault, op => op.MapFrom(x => x.IsDefault))
//                .ForMember(dc => dc.IsEnabled, op => op.MapFrom(x => x.IsEnabled))
//                .ForMember(dc => dc.IsSelected, op => op.MapFrom(x => x.IsSelected))
//                .ForMember(dc => dc.Value, op => op.MapFrom(x => x.Value))
//                ;
//
        }
    }
}
