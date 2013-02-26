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
            List<DC.AttributeInProductType> ret = Mapper.Map<List<DC.AttributeInProductType>>(attributes.OrderBy(x => x.Index));
            return ret;
        }

        private List<DC.AttributeVocabularyValueInProductType> MapSelectedValuesToVocabularyValueInProductTypeList(List<AttributeValue> selectedValues)
        {
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
                .ForMember(dc => dc.Properties, opt => opt.ResolveUsing(x => Mapper.Map<List<DC.AttributeInProductType>>(x.Properties.OrderBy(x1 => x1.Index))))
                .ForMember(dc => dc.Extras, opt => opt.ResolveUsing(x => Mapper.Map<List<DC.AttributeInProductType>>(x.Extras.OrderBy(x1 => x1.Index))))
                ;

            Mapper.CreateMap<DC.AttributeInProductType, ProductTypeAttribute>()
                .ForMember(x => x.AttributeFQN, opt => opt.MapFrom(dc => dc.AttributeFQN))
                .ForMember(x => x.Index, opt => opt.MapFrom(dc => dc.Order))                
                .ForMember(x => x.IsRequired, opt => opt.MapFrom(dc => dc.IsRequiredByAdmin))
                .ForMember(x => x.AllowMulti, opt => opt.MapFrom(dc => dc.IsMultiSelectProperty))
                .ForMember(x => x.IsHidden, opt => opt.MapFrom(dc => dc.IsHiddenProperty))
                .ForMember(x => x.IsLocked, opt => opt.MapFrom(dc => dc.IsInheretedFromBaseType))
                .ForMember(x => x.AllValues, opt => opt.MapFrom(dc => dc.Attribute.VocabularyValues))
                .ForMember(x => x.SelectedValues, opt => opt.ResolveUsing(dc => MapVocabularyValueInProductTypeListToSelectedValues(dc.VocabularyValues, dc.AttributeFQN)))
                .ForMember(x => x.DataType, opt => opt.MapFrom(dc => dc.Attribute.DataType))
                .ForMember(x => x.InputType, opt => opt.MapFrom(dc => dc.Attribute.InputType))
                .ForMember(x => x.AttributeName, opt => opt.MapFrom(dc => dc.Attribute.AttributeCode))
                ;

            Mapper.CreateMap<ProductTypeAttribute, DC.AttributeInProductType>()
                .ForMember(dc => dc.AttributeFQN, opt => opt.MapFrom(dc => dc.AttributeFQN))
                .ForMember(dc => dc.Order, opt => opt.MapFrom(x => x.Index))
                .ForMember(dc => dc.Attribute, opt => opt.MapFrom(x => new DC.Attribute
                {
                    AttributeFQN = x.AttributeFQN,
                    AttributeCode = x.AttributeName,
                    VocabularyValues = Mapper.Map<List<DC.AttributeVocabularyValue>>(x.AllValues),
                    DataType = x.DataType,
                    InputType = x.InputType
                }))
                .ForMember(dc => dc.IsHiddenProperty, opt => opt.MapFrom(x => x.IsHidden))
                .ForMember(dc => dc.IsInheretedFromBaseType, opt => opt.MapFrom(x => x.IsLocked))
                .ForMember(dc => dc.IsRequiredByAdmin, opt => opt.MapFrom(x => x.IsRequired))
                .ForMember(dc => dc.IsMultiSelectProperty, opt => opt.MapFrom(x => x.AllowMulti))
                .ForMember(dc => dc.VocabularyValues, opt => opt.ResolveUsing(x => MapSelectedValuesToVocabularyValueInProductTypeList(x.SelectedValues)))
                ;

            Mapper.CreateMap<AttributeValue, DC.AttributeVocabularyValue>();
            Mapper.CreateMap<DC.AttributeVocabularyValue, AttributeValue>();

            Mapper.CreateMap<AttributeValue, DC.AttributeVocabularyValueInProductType>()
                .ForMember(dc => dc.Value, opt => opt.MapFrom(x => x.Value));

            Mapper.CreateMap<DC.AttributeVocabularyValueInProductType, AttributeValue>()
                .ForMember(x => x.Value, opt => opt.MapFrom(dc => dc.Value))
                ;
            #endregion

            #region Attributes
            Mapper.CreateMap<Attribute, DC.Attribute>()
                .ForMember(x => x.VocabularyValues, opt => opt.MapFrom(x => x.Values))
                .ForMember(x => x.AttributeFQN, opt => opt.MapFrom(x => x.Id))
                .ForMember(x => x.Content, opt => opt.ResolveUsing(x => new DC.AttributeLocalizedContent
                    {
                        Description = "",
                        Name = x.Name,
                        LocaleCode = "en-US",
                    }))
                //.ForMember(x => x.Validation, opt => opt.ResolveUsing(x => new DC.AttributeValidation{ RegularExpression = x.Regex }))
                .AfterMap((a, b) => b.Validation = new DC.AttributeValidation { RegularExpression = a.Regex })
                //.AfterMap<AttributeValidationMappingAction>()
                ;
            Mapper.CreateMap<DC.Attribute, Attribute>()
                .ForMember(x => x.Values, opt => opt.MapFrom(x => x.VocabularyValues))
                .ForMember(x => x.Id, opt => opt.MapFrom(x => x.AttributeFQN))
                .ForMember(x => x.Name, opt => opt.MapFrom(x => x.Content.Name))
                .ForMember(x => x.Regex, opt => opt.MapFrom(x => x.Validation.RegularExpression))
                //.ForMember(x => x.Max, opt => opt.ResolveUsing<AttributeValidationMaxResolver>())
                //.ForMember(x => x.Min, opt => opt.ResolveUsing<AttributeValidationMinResolver>())
                //.AfterMap<AttributeValidationMappingAction>()
                ;
            #endregion
        }

        private List<AttributeValue> MapVocabularyValueInProductTypeListToSelectedValues(List<DC.AttributeVocabularyValueInProductType> list, string attributeFQN)
        {
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
