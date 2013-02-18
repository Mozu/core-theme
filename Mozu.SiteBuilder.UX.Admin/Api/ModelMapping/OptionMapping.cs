

using AutoMapper;

using DC = Mozu.ProductAdmin.Contracts;
           
using Mozu.SiteBuilder.UX.Admin.Api.Models.Options;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class OptionMapping : Profile
    {
        public override string ProfileName
        {
            get
            {
                return this.GetType().FullName;
            }
        }
        protected override void Configure()
        {

           // DC.AttributeLocalizedContent NULLCONTENTE = new DC.AttributeLocalizedContent();

            //Mapper.CreateMap<DC.Attribute, Option>()
            //  ;//  .AfterMap(AfterOptionMap);
            //Mapper.CreateMap<Option, DC.Attribute>()
            //    .ForMember(x => x.Content, op => op.ResolveUsing(_ => new DC.AttributeLocalizedContent() { Description = _.ContentDescription, LocaleCode = "en-us", Name = _.ContentName }))
            //    .ForMember(x => x.DataType, op => op.ResolveUsing(_ => /*_.StandardInputTypeIntention == "CheckBox" ? DC.AttributeDataType.Boolean :*/ DC.AttributeDataType.String))
            //    .ForMember(x => x.StringValidation, op => op.ResolveUsing(_ => new DC.AttributeValidationString() { MaxLength = _.StringValidationMaxLength, MinLength = _.StringValidationMinLength }))
            //    .ForMember(x => x.DataType, op => op.ResolveUsing(_ => /*_.StandardInputTypeIntention == "CheckBox" ? DC.AttributeDataType.Boolean :*/ DC.AttributeDataType.String))
            //    .ForMember(x=>x.IsMultiValue ,op=> op.ResolveUsing(_=>_.IsMultiValue.GetValueOrDefault(true)))
            //    .ForMember(x => x.IsShopperEntered, op => op.ResolveUsing(_ => _.StandardInputTypeIntention == "Textbox"));
                


                //Mapper.CreateMap<OptionValue, DC.AttributeValue>()
                //    .ForMember(x => x.StringValue, op => op.ResolveUsing(x => new DC.AttributeValueString() { Content = new DC.AttributeValueStringLocalizedContent() { Value = x.StringValueContentValue, LocaleCode = "en-us" }, InternalValue = ( !string.IsNullOrEmpty ( x.StringValueInternalValue ) ?  x.StringValueInternalValue : x.StringValueContentValue) }));
                    

                //Mapper.CreateMap<DC.AttributeValue, OptionValue>();

            //Mapper.CreateMap<DC.ProductOption, ProductOption>()
            //    .ForMember(x => x.InternalName, op => op.MapFrom(x => x.InternalName))
            //    .ForMember(x => x.IsRequired, op => op.MapFrom(x => x.AttributeDetail.IsRequired))
            //    .ForMember(x => x.StandardInputTypeIntention, op => op.MapFrom(x => x.AttributeDetail.StandardInputTypeIntention.ToString()))
            //    .ForMember (x=> x.StringValidationMaxLength , op=> op.MapFrom (x=> x.AttributeDetail.StringValidation.MaxLength))
            //    .ForMember(x => x.StringValidationMinLength , op => op.MapFrom(x => x.AttributeDetail.StringValidation.MaxLength ))

            //    .ForMember(x => x.ContentName, op => op.MapFrom(x => x.AttributeDetail.Content.Name));
                

            //Mapper.CreateMap<ProductOption, DC.ProductOption>();
            //Mapper.CreateMap<DC.ProductOptionValue, ProductOptionValue>()
            //    .ForMember(x => x.StringValueContentValue, op => op.MapFrom(x => x.AttributeValueDetail.StringValue.Content.Value))
            //    .ForMember(x => x.StringValueInternalValue, op => op.MapFrom(x => x.InternalValue ));

            //    .ForMember(x=> x.string , op=> op.MapFrom ( x=> x.InternalValue !! x.AttributeValueDetail.StringValue.Content.Value ))
            //Mapper.CreateMap<ProductOptionValue, DC.ProductOptionValue>()
            //    .ForMember(x => x.InternalValue, op => op.MapFrom(x => string.IsNullOrEmpty(x.StringValueInternalValue) ? x.StringValueContentValue : x.StringValueInternalValue))
            //    .ForMember(x => x.DeltaWeight, op => op.MapFrom(x => x.DeltaWeight))
            //    .ForMember(x => x.DeltaPrice , op => op.MapFrom(x => x.DeltaPriceValue .GetValueOrDefault (0) > 0 ? new DC.ProductOptionValueDeltaPrice(){ Value = x.DeltaPriceValue.GetValueOrDefault (), CurrencyCode = "USD" } : null));


            //Mapper.CreateMap<ProductVariation, DC.ProductVariation>()
            //    .ForMember(x => x.IsActive, op => op.ResolveUsing ( x=> x.IsActive.GetValueOrDefault ( false )))
            //    .ForMember(x => x.DeltaPrice, op => op.ResolveUsing(x => new DC.ProductVariationDeltaPrice() { CurrencyCode="USD",  Value = x.DeltaPriceValue.GetValueOrDefault (0) }));
            //Mapper.CreateMap<DC.ProductVariation, ProductVariation>()
            //    .ForMember(x => x.OptionValue1, op => op.ResolveUsing(x => x.Options != null && x.Options.Count > 0 ? x.Options[0].AttributeValueInternal : null))
            //    .ForMember(x => x.OptionValue2, op => op.ResolveUsing(x => x.Options != null && x.Options.Count > 1 ? x.Options[1].AttributeValueInternal : null))
            //    .ForMember(x => x.OptionValue3, op => op.ResolveUsing(x => x.Options != null && x.Options.Count > 2 ? x.Options[2].AttributeValueInternal : null));

          

          
          



        }
        //void AfterOptionMap(DC.Attribute att, Option opt)
        //{
        //    if (opt != null && opt.Values != null)
        //    {
        //        foreach (var val in opt.Values)
        //        {
        //            val.option_id = opt.Id;
        //        }
        //    }
           
        //}
    }
}