using System;
using System.Data;
using System.Linq;
using System.Collections.Generic;
using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Product;
using Attribute = Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Product.Attribute;
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

            return selectedValues.Select((val, idx) => 
                new DC.AttributeVocabularyValueInProductType
                    {
                        Value = val.Id ,
                        Order = idx
                    }).ToList();
        }

        protected override void Configure()
        {
            #region Product Type
            Mapper.CreateMap<DC.ProductType, ProductType>()
                .ForMember(x => x.Id, opt => opt.ResolveUsing(dc => dc.Id))
                .ForMember(x => x.Name, opt => opt.ResolveUsing(dc => dc.Name))
                .ForMember(x => x.IsBase, opt => opt.ResolveUsing(dc => dc.IsBaseProductType))
//              .ForMember(x => x.NumberOfProducts, opt => opt.ResolveUsing(dc => dc.ProductCount))
                .ForMember(x => x.Options, opt => opt.ResolveUsing(dc => MapDCAttributeToAttribute(dc.Options, dc.Id)))
                .ForMember(x => x.Properties, opt => opt.ResolveUsing(dc => MapDCAttributeToAttribute(dc.Properties, dc.Id)))
                .ForMember(x => x.ModifiedDate, opt => opt.ResolveUsing(dc => (dc.AuditInfo != null) ? dc.AuditInfo.UpdateDate : null))
                .ForMember(x => x.Extras, opt => opt.ResolveUsing(dc => MapDCAttributeToAttribute(dc.Extras, dc.Id)))
                ;

            Mapper.CreateMap<ProductType, DC.ProductType>()
                .ForMember( dc=> dc.ProductUsages, opt=> opt.ResolveUsing( x=> x.ProductUsages))
                .ForMember(dc => dc.Id, opt => opt.ResolveUsing(x => x.Id))
                .ForMember(dc => dc.Name, opt => opt.ResolveUsing(x => x.Name))
                .ForMember(dc => dc.IsBaseProductType, opt => opt.ResolveUsing(x => x.IsBase))
                .ForMember(dc => dc.Options, opt => opt.ResolveUsing(x => MapAttributeToDCAttribute(x.Options)))
                .ForMember(dc => dc.Properties, opt => opt.ResolveUsing(x => MapAttributeToDCAttribute(x.Properties)))
                .ForMember(dc => dc.Extras, opt => opt.ResolveUsing(x => MapAttributeToDCAttribute(x.Extras)))
                .ForMember(dc => dc.GoodsType, op => op.ResolveUsing(x => (string.IsNullOrEmpty(x.GoodsType)) 
                    ? DC.ProductType.GoodsTypeConst.Physical : x.GoodsType))
                //ignores
                .ForMember(dc => dc.MasterCatalogId, op => op.Ignore())
                .ForMember(dc => dc.AuditInfo, op => op.Ignore())
                ;

            Mapper.CreateMap<DC.AttributeInProductType, ProductTypeAttribute>()
                .ForMember(x => x.AttributeFQN, opt => opt.ResolveUsing(dc => dc.AttributeFQN))
                .ForMember(x => x.Index, opt => opt.ResolveUsing(dc => dc.Order))
                .ForMember(x => x.IsRequired, opt => opt.ResolveUsing(dc => dc.IsRequiredByAdmin))
                .ForMember(x => x.AllowMulti, opt => opt.ResolveUsing(dc => dc.IsMultiValueProperty))
                .ForMember(x => x.IsHidden, opt => opt.ResolveUsing(dc => dc.IsHiddenProperty))
                .ForMember(x => x.IsAdminOnly, opt => opt.ResolveUsing(dc => dc.IsAdminOnlyProperty))
                .ForMember(x => x.IsLocked, opt => opt.ResolveUsing(dc => dc.IsInheritedFromBaseType))
                .ForMember(x => x.Order, opt => opt.ResolveUsing(dc => dc.Order ))

                .ForMember(x => x.AllValues, opt => opt.ResolveUsing(dc => (dc.AttributeDetail != null) ? dc.AttributeDetail.VocabularyValues : null))
                .ForMember(x => x.SelectedValues, opt => opt.ResolveUsing(dc => MapVocabularyValueInProductTypeListToSelectedValues(dc.VocabularyValues, dc.AttributeFQN)))
                .ForMember(x => x.DataType, opt => opt.ResolveUsing(dc => (dc.AttributeDetail != null) ? dc.AttributeDetail.DataType : null))
                .ForMember(x => x.InputType, opt => opt.ResolveUsing(dc => (dc.AttributeDetail != null) ? dc.AttributeDetail.InputType : null))
                .ForMember(x => x.AttributeMetadata, opt => opt.ResolveUsing(dc => (dc.AttributeDetail != null) ? dc.AttributeDetail.AttributeMetadata : null))
                .ForMember(x => x.AdminName, op => op.ResolveUsing(dc => dc.AttributeDetail != null ? dc.AttributeDetail.AdminName : null))
                .ForMember(x => x.AttributeName, opt => opt.ResolveUsing(dc => (dc.AttributeDetail != null && dc.AttributeDetail.Content != null) 
                        ? dc.AttributeDetail.Content.Name 
                        : (dc.AttributeDetail != null) 
                            ?  dc.AttributeDetail.AttributeCode 
                            : null))
                .ForMember(x => x.ProductTypeId, op => op.Ignore())
                ;

            Mapper.CreateMap<ProductTypeAttribute, DC.AttributeInProductType>()
                .ForMember(dc => dc.AttributeFQN, opt => opt.ResolveUsing(dc => dc.AttributeFQN))
                .ForMember(dc => dc.Order, opt => opt.ResolveUsing(x => x.Index))
                .ForMember(dc => dc.AttributeDetail, opt => opt.ResolveUsing(x => new DC.Attribute
                {
                    AttributeFQN = x.AttributeFQN,
                    AdminName = x.AdminName,
                    AttributeCode = x.AttributeName,
                    VocabularyValues = Mapper.Map<List<DC.AttributeVocabularyValue>>(x.AllValues),
                    DataType = x.DataType,
                    InputType = x.InputType
                }))
                .ForMember(dc => dc.IsHiddenProperty, opt => opt.ResolveUsing(x => x.IsHidden))
                .ForMember(dc => dc.IsAdminOnlyProperty, opt => opt.ResolveUsing(x => x.IsAdminOnly))
                .ForMember(x => x.Order, opt => opt.ResolveUsing(dc => dc.Order))
                .ForMember(dc => dc.IsInheritedFromBaseType, opt => opt.ResolveUsing(x => x.IsLocked))
                .ForMember(dc => dc.IsRequiredByAdmin, opt => opt.ResolveUsing(x => x.IsRequired))
                .ForMember(dc => dc.IsMultiValueProperty  , opt => opt.ResolveUsing(x => x.AllowMulti))
                .ForMember(dc => dc.VocabularyValues, opt => opt.ResolveUsing(x => MapSelectedValuesToVocabularyValueInProductTypeList(x.SelectedValues)))
                .ForMember(x => x.DisplayInfo, op => op.Ignore()) // todo: xverify - Greg Murray on 2014-08-26 
            
                ;

            Mapper.CreateMap<AttributeValue, DC.AttributeVocabularyValue>()
                .ForMember(dc => dc.Content, opt => opt.ResolveUsing((AttributeValue x) => x.Value is string
                    ? new DC.AttributeVocabularyValueLocalizedContent
                    {
                        //                LocaleCode = "??-??", 
                        StringValue = x.Value as string
                    }
                    : null))
                .ForMember(dc => dc.Value, opt => opt.ResolveUsing(x => x.Id))
                // TODO: do not hard code this.
                .ForMember(dc => dc.ValueSequence, opt => opt.ResolveUsing((AttributeValue x) => 0))
                .ForMember(dc => dc.LocalizedContent, op => op.Ignore()); // todo: xverify - Greg Murray on 2014-08-26 
            
            ;
            Mapper.CreateMap<DC.AttributeVocabularyValue, AttributeValue>()
                .ForMember(dc => dc.Value, opt => opt.ResolveUsing(x => x.Content != null &&!string.IsNullOrEmpty( x.Content.StringValue) 
                    ? x.Content.StringValue 
                    :  x.Value))
                .ForMember(x => x.Id, op => op.ResolveUsing(( DC.AttributeVocabularyValue x) => (x.Value != null) ? x.Value.ToString() : null))
                .ForMember(x => x.AttributeFQN, op => op.Ignore())
                ;

            Mapper.CreateMap<AttributeValue, DC.AttributeVocabularyValueInProductType>()
                .ForMember(dc => dc.Value, opt => opt.ResolveUsing(x => x.Id ))
                //ignores
                .ForMember(dc => dc.Order, op => op.Ignore())
                .ForMember(dc => dc.VocabularyValueDetail, op => op.Ignore())
                .ForMember(dc => dc.DisplayInfo, op => op.Ignore()) // todo: xverify - Greg Murray on 2014-08-26 
                ;

            Mapper.CreateMap<DC.AttributeVocabularyValueInProductType, AttributeValue>()
                .ForMember(x => x.Id , opt => opt.ResolveUsing(( DC.AttributeVocabularyValueInProductType dc) => dc.Value))
                .ForMember(x=> x.Value , opt => opt.ResolveUsing( dc=> dc.VocabularyValueDetail != null && dc.VocabularyValueDetail.Content != null && !string.IsNullOrEmpty( dc.VocabularyValueDetail.Content.StringValue) 
                    ? dc.VocabularyValueDetail.Content.StringValue 
                    : dc.Value ))
                .ForMember(x => x.AttributeFQN, op => op.Ignore());
            #endregion

            #region Attributes
            Mapper.CreateMap<Attribute, DC.Attribute>().ConvertUsing(new AttributeToContractConverter());

            Mapper.CreateMap<DC.Attribute, Attribute>()
                .ForMember(x => x.AdminName, op => op.ResolveUsing(x => x.AdminName))
                .ForMember(x => x.Values, opt => opt.ResolveUsing(x => x.VocabularyValues))
                .ForMember(x => x.Id, opt => opt.ResolveUsing(x => x.AttributeFQN))
                .ForMember(x => x.Name, opt => opt.ResolveUsing(x => (x.Content == null) ? null : x.Content.Name))
                .ForMember( x=> x.AttributeMetadata , opt=> opt.ResolveUsing(x=> x.AttributeMetadata))
                .ForMember(x => x.Regex, opt => opt.ResolveUsing(x => (x.Validation != null) 
                    ? x.Validation.RegularExpression 
                    : null))
                .ForMember(x => x.Min, opt => opt.ResolveUsing(dc => (dc.Validation != null) 
                    ? (dc.Validation.MinNumericValue ?? dc.Validation.MinStringLength) 
                    : null ))
                .ForMember(x => x.Max, opt => opt.ResolveUsing(dc => (dc.Validation != null)
                    ? (dc.Validation.MaxNumericValue ?? dc.Validation.MaxStringLength) 
                    : null))
                .ForMember(x => x.MinDate, opt => opt.ResolveUsing(dc => (dc.Validation != null) 
                    ? dc.Validation.MinDateValue 
                    : null))
                .ForMember(x => x.MaxDate, opt => opt.ResolveUsing(dc => (dc.Validation != null) 
                    ? dc.Validation.MaxDateValue 
                    : null))
                //ignores
                .ForMember(x => x.AttributeId, op => op.Ignore())
                .ForMember(x => x.IsActive, op => op.Ignore())
                .ForMember(x => x.IsRequired, op => op.Ignore())
                .ForMember(x => x.IsVisible, op => op.Ignore())
                .ForMember(x => x.DisplayGroup, op => op.Ignore());

            Mapper.CreateMap<DC.AttributeMetadataItem, AttributeMetadataItem>();
            Mapper.CreateMap<AttributeMetadataItem, DC.AttributeMetadataItem>();


            Mapper.CreateMap<DC.AttributeVocabularyValue, AttributeVocabularyValue>();

            Mapper.CreateMap<AttributeVocabularyValue, DC.AttributeVocabularyValue>()
                .ForMember(dc => dc.LocalizedContent, op => op.Ignore()) // todo: xverify - Greg Murray on 2014-08-26 
                ;

            Mapper.CreateMap<AttributeVocabularyValueLocalizedContent, DC.AttributeVocabularyValueLocalizedContent>();
            Mapper.CreateMap<DC.AttributeVocabularyValueLocalizedContent, AttributeVocabularyValueLocalizedContent>();

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
                     Id = l.Value.ToString()  ,
                     Value = l.VocabularyValueDetail != null && l.VocabularyValueDetail.Content != null && !string.IsNullOrEmpty( l.VocabularyValueDetail.Content.StringValue  )
                     ? l.VocabularyValueDetail.Content.StringValue : l.Value 
                     
                }).ToList();

            return r;
        }
    }
}
