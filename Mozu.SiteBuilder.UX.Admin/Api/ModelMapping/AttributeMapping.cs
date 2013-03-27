using System;
using System.Linq;
using System.Collections.Generic;
using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes;
using Attribute = Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Attribute;
using DC = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class AttributeMapping : Profile
    {
        public override string ProfileName
        {
            get
            {
                return GetType().FullName;
            }
        }

        private List<ProductTypeAttribute> MapDCAttributeToAttribute(List<DC.AttributeInProductType> dcAttributes, int? productTypeId)
        {
            List<ProductTypeAttribute> ret = Mapper.Map<List<ProductTypeAttribute>>(dcAttributes);
            
            // add the index.
            ret.Each(r => r.Index = dcAttributes.FindIndex(dc => dc.AttributeFQN == r.AttributeFQN));
            
            // add the product type id
            ret.Each(r => r.ProductTypeId = productTypeId);

            return ret;
        }

        private List<DC.AttributeInProductType> MapAttributeToDCAttribute(List<ProductTypeAttribute> attributes)
        {
            List<DC.AttributeInProductType> ret;

            if (attributes == null)
                ret = new List<DC.AttributeInProductType>();
            else
                ret = Mapper.Map<List<DC.AttributeInProductType>>(attributes.OrderBy(x => x.Index));

            return ret;
        }

        private List<DC.AttributeVocabularyValueInProductType> MapSelectedValuesToVocabularyValueInProductTypeList(List<AttributeValue> selectedValues)
        {
            if (selectedValues == null)
                return new List<DC.AttributeVocabularyValueInProductType>();

            return selectedValues.Select((val, idx) => new DC.AttributeVocabularyValueInProductType { Value = val.Value, Order = idx }).ToList();
        }

        protected override void Configure()
        {
            #region Product Type
            Mapper.CreateMap<DC.ProductType, ProductType>()
                .ForMember(x => x.Id, opt => opt.MapFrom(dc => dc.Id))
                .ForMember(x => x.Name, opt => opt.MapFrom(dc => dc.Name))
                .ForMember(x => x.IsBase, opt => opt.MapFrom(dc => dc.IsBaseProductType))
                .ForMember(x => x.NumberOfProducts, opt => opt.MapFrom(dc => -1))
                .ForMember(x => x.Options, opt => opt.ResolveUsing(dc => MapDCAttributeToAttribute(dc.Options, dc.Id)))
                .ForMember(x => x.Properties, opt => opt.ResolveUsing(dc => MapDCAttributeToAttribute(dc.Properties, dc.Id)))
                .ForMember(x => x.Extras, opt => opt.ResolveUsing(dc => MapDCAttributeToAttribute(dc.Extras, dc.Id)))
                ;

            Mapper.CreateMap<ProductType, DC.ProductType>()
                .ForMember(dc => dc.Id, opt => opt.MapFrom(x => x.Id))
                .ForMember(dc => dc.Name, opt => opt.MapFrom(x => x.Name))
                .ForMember(dc => dc.IsBaseProductType, opt => opt.MapFrom(x => x.IsBase))
                .ForMember(dc => dc.Options, opt => opt.ResolveUsing(x => MapAttributeToDCAttribute(x.Options)))
                .ForMember(dc => dc.Properties, opt => opt.ResolveUsing(x => MapAttributeToDCAttribute(x.Properties)))
                .ForMember(dc => dc.Extras, opt => opt.ResolveUsing(x => MapAttributeToDCAttribute(x.Extras)))
                ;

            Mapper.CreateMap<DC.AttributeInProductType, ProductTypeAttribute>()
                .ForMember(x => x.AttributeFQN, opt => opt.ResolveUsing(dc => dc.AttributeFQN))
                .ForMember(x => x.Index, opt => opt.ResolveUsing(dc => dc.Order))
                .ForMember(x => x.IsRequired, opt => opt.ResolveUsing(dc => dc.IsRequiredByAdmin))
                .ForMember(x => x.AllowMulti, opt => opt.ResolveUsing(dc => dc.IsMultiValueProperty))
                .ForMember(x => x.IsHidden, opt => opt.ResolveUsing(dc => dc.IsHiddenProperty))
                .ForMember(x => x.IsLocked, opt => opt.ResolveUsing(dc => dc.IsInheritedFromBaseType))
                .ForMember(x => x.AllValues, opt => opt.ResolveUsing(dc => dc.AttributeDetail.VocabularyValues))
                .ForMember(x => x.SelectedValues, opt => opt.ResolveUsing(dc => MapVocabularyValueInProductTypeListToSelectedValues(dc.VocabularyValues, dc.AttributeFQN)))
                .ForMember(x => x.DataType, opt => opt.ResolveUsing(dc => dc.AttributeDetail.DataType))
                .ForMember(x => x.InputType, opt => opt.ResolveUsing(dc => dc.AttributeDetail.InputType))
                .ForMember(x => x.AttributeName, opt => opt.ResolveUsing(dc => dc.AttributeDetail.Content != null ? dc.AttributeDetail.Content.Name : dc.AttributeDetail.AttributeCode))
                ;

            Mapper.CreateMap<ProductTypeAttribute, DC.AttributeInProductType>()
                .ForMember(dc => dc.AttributeFQN, opt => opt.MapFrom(dc => dc.AttributeFQN))
                .ForMember(dc => dc.Order, opt => opt.MapFrom(x => x.Index))
                .ForMember(dc => dc.AttributeDetail, opt => opt.MapFrom(x => new DC.Attribute
                {
                    AttributeFQN = x.AttributeFQN,
                    AttributeCode = x.AttributeName,
                    VocabularyValues = Mapper.Map<List<DC.AttributeVocabularyValue>>(x.AllValues),
                    DataType = x.DataType,
                    InputType = x.InputType
                }))
                .ForMember(dc => dc.IsHiddenProperty, opt => opt.MapFrom(x => x.IsHidden))
                .ForMember(dc => dc.IsInheritedFromBaseType, opt => opt.MapFrom(x => x.IsLocked))
                .ForMember(dc => dc.IsRequiredByAdmin, opt => opt.MapFrom(x => x.IsRequired))
                .ForMember(dc => dc.IsMultiValueProperty  , opt => opt.MapFrom(x => x.AllowMulti))
                .ForMember(dc => dc.VocabularyValues, opt => opt.ResolveUsing(x => MapSelectedValuesToVocabularyValueInProductTypeList(x.SelectedValues)))
                ;

            Mapper.CreateMap<AttributeValue, DC.AttributeVocabularyValue>()
                .ForMember(dc => dc.Content, opt => opt.MapFrom(x => new DC.AttributeVocabularyValueLocalizedContent { LocaleCode = "en-US", StringValue = (string)x.Value }))
                .ForMember(dc => dc.Value, opt => opt.MapFrom(x => x.Value))
                // TODO: do not hard code this.
                .ForMember(dc => dc.ValueSequence, opt => opt.MapFrom(x => 0))
            ;
            Mapper.CreateMap<DC.AttributeVocabularyValue, AttributeValue>();

            Mapper.CreateMap<AttributeValue, DC.AttributeVocabularyValueInProductType>()
                .ForMember(dc => dc.Value, opt => opt.MapFrom(x => x.Value));

            Mapper.CreateMap<DC.AttributeVocabularyValueInProductType, AttributeValue>()
                .ForMember(x => x.Value, opt => opt.MapFrom(dc => dc.Value))
                ;
            #endregion

            #region Attributes
            Mapper.CreateMap<Attribute, DC.Attribute>().ConvertUsing(new AttributeToContractConverter());

            Mapper.CreateMap<DC.Attribute, Attribute>()
                .ForMember(x => x.Values, opt => opt.MapFrom(x => x.VocabularyValues))
                .ForMember(x => x.Id, opt => opt.MapFrom(x => x.AttributeFQN))
                .ForMember(x => x.Name, opt => opt.MapFrom(x => x.Content.Name))
                .ForMember(x => x.Regex, opt => opt.MapFrom(x => x.Validation.RegularExpression))
                .ForMember(x => x.Min, opt => opt.ResolveUsing(new AttributeValidationMinResolver()))
                .ForMember(x => x.Max, opt => opt.ResolveUsing(new AttributeValidationMaxResolver()))
                ;
            #endregion
        }

        private List<AttributeValue> MapVocabularyValueInProductTypeListToSelectedValues(List<DC.AttributeVocabularyValueInProductType> list, string attributeFQN)
        {
            if (list == null)
                return new List<AttributeValue>();

            List<AttributeValue> r =
                (from l in list
                orderby l.Order
                select new AttributeValue {
                     AttributeFQN = attributeFQN,
                     Value = l.Value
                }).ToList();

            return r;
        }
    }
}
