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
//                .ForMember(x => x.AttributeFQN, op => op.ResolveUsing(dc => dc.AttributeFQN))
//                .ForMember(x => x.AttributeDetails, op => op.ResolveUsing(dc => dc.AttributeDetail))
//                .ForMember(x => x.IsMultiValue, op => op.ResolveUsing(dc => dc.IsMultiValue))
//                .ForMember(x => x.IsRequired, op => op.ResolveUsing(dc => dc.IsRequired))
//                .ForMember(x => x.Values, op => op.ResolveUsing(dc => dc.Values))
//                // TODO: Validation object? 
//                ;
//
//            Mapper.CreateMap<DC.AttributeDetail, RuntimeProductOption.AttributeDetail>()
//                .ForMember(x => x.Name, op => op.ResolveUsing(dc => dc.Name))
//                .ForMember(x => x.Description, op => op.ResolveUsing(dc => dc.Description))
//                .ForMember(x => x.UsageType, op => op.ResolveUsing(dc => dc.UsageType))
//                .ForMember(x => x.ValueType, op => op.ResolveUsing(dc => dc.ValueType))
//                .ForMember(x => x.InputType, op => op.ResolveUsing(dc => dc.InputType))
//                .ForMember(x => x.DataTypeSequence, op => op.ResolveUsing(dc => dc.DataTypeSequence))
//                .ForMember(x => x.Name, op => op.ResolveUsing(dc => dc.Name))
//                ;
//
//            Mapper.CreateMap<DC.ProductOptionValue, RuntimeProductOption.OptionValue>()
//                .ForMember(x => x.AttributeValueId, op => op.ResolveUsing(dc => dc.AttributeValueId))
//                .ForMember(x => x.DeltaPrice, op => op.ResolveUsing(dc => dc.DeltaPrice))
//                .ForMember(x => x.DeltaWeight, op => op.ResolveUsing(dc => dc.DeltaWeight))
//                .ForMember(x => x.IsDefault, op => op.ResolveUsing(dc => dc.IsDefault))
//                .ForMember(x => x.IsEnabled, op => op.ResolveUsing(dc => dc.IsEnabled))
//                .ForMember(x => x.IsSelected, op => op.ResolveUsing(dc => dc.IsSelected))
//                .ForMember(x => x.Value, op => op.ResolveUsing(dc => dc.Value))
//                ;
//
//            Mapper.CreateMap<RuntimeProductOption, DC.ProductOption>()
//                .ForMember(dc => dc.AttributeFQN, op => op.ResolveUsing(x => x.AttributeFQN))
//                .ForMember(dc => dc.AttributeDetail, op => op.ResolveUsing(x => x.AttributeDetails))
//                .ForMember(dc => dc.IsMultiValue, op => op.ResolveUsing(x => x.IsMultiValue))
//                .ForMember(dc => dc.IsRequired, op => op.ResolveUsing(x => x.IsRequired))
//                .ForMember(dc => dc.Values, op => op.ResolveUsing(x => x.Values))
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
//                .ForMember(dc => dc.Name, op => op.ResolveUsing(x => x.Name))
//                .ForMember(dc => dc.Description, op => op.ResolveUsing(x => x.Description))
//                .ForMember(dc => dc.UsageType, op => op.ResolveUsing(x => x.UsageType))
//                .ForMember(dc => dc.ValueType, op => op.ResolveUsing(x => x.ValueType))
//                .ForMember(dc => dc.InputType, op => op.ResolveUsing(x => x.InputType))
//                .ForMember(dc => dc.DataTypeSequence, op => op.ResolveUsing(x => x.DataTypeSequence))
//                .ForMember(dc => dc.Name, op => op.ResolveUsing(x => x.Name))
//                ;
//
//            Mapper.CreateMap<RuntimeProductOption.OptionValue, DC.ProductOptionValue>()
//                .ForMember(dc => dc.AttributeValueId, op => op.ResolveUsing(x => x.AttributeValueId))
//                .ForMember(dc => dc.DeltaPrice, op => op.ResolveUsing(x => x.DeltaPrice))
//                .ForMember(dc => dc.DeltaWeight, op => op.ResolveUsing(x => x.DeltaWeight))
//                .ForMember(dc => dc.IsDefault, op => op.ResolveUsing(x => x.IsDefault))
//                .ForMember(dc => dc.IsEnabled, op => op.ResolveUsing(x => x.IsEnabled))
//                .ForMember(dc => dc.IsSelected, op => op.ResolveUsing(x => x.IsSelected))
//                .ForMember(dc => dc.Value, op => op.ResolveUsing(x => x.Value))
//                ;
//
        }
    }
}
