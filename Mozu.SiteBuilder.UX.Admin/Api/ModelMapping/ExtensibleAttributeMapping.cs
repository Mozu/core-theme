using System;
using System.ComponentModel;
using System.Linq;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using AutoMapper;

using Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes;
using Attribute = Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Attribute;
using AttributeMetadataItem = Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.AttributeMetadataItem;
using AttributeModel = Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Attribute;
using AttributeVocabularyValue = Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.AttributeVocabularyValue;
using AttributeVocabularyValueLocalizedContent = Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.AttributeVocabularyValueLocalizedContent;
using DC = Mozu.Core.Extensible.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class ExtensibleAttributeMapping : Profile
    {
        public override string ProfileName
        {
            get
            {
                return GetType().FullName;
            }
        }

        //private List<ProductTypeAttribute> MapDCAttributeToAttribute(List<DC.AttributeInProductType> dcAttributes, int? productTypeId)
        //{
        //    List<ProductTypeAttribute> ret = Mapper.Map<List<ProductTypeAttribute>>(dcAttributes);
            
        //    // add the index.
        //    ret.Each(r => r.Index = dcAttributes.FindIndex(dc => dc.AttributeFQN == r.AttributeFQN));
            
        //    // add the product type id
        //    ret.Each(r => r.ProductTypeId = productTypeId);

        //    return ret;
        //}

        //private List<DC.AttributeInProductType> MapAttributeToDCAttribute(List<ProductTypeAttribute> attributes)
        //{
        //    List<DC.AttributeInProductType> ret;

        //    if (attributes == null)
        //        ret = new List<DC.AttributeInProductType>();
        //    else
        //        ret = Mapper.Map<List<DC.AttributeInProductType>>(attributes.OrderBy(x => x.Index));

        //    return ret;
        //}

        //private List<DC.AttributeVocabularyValueInProductType> MapSelectedValuesToVocabularyValueInProductTypeList(List<AttributeValue> selectedValues)
        //{
        //    if (selectedValues == null)
        //        return new List<DC.AttributeVocabularyValueInProductType>();

        //    return selectedValues.Select((val, idx) => 
        //        new DC.AttributeVocabularyValueInProductType
        //            {
        //                Value = val.Id ,
        //                Order = idx
        //            }).ToList();
        //}

        protected override void Configure()
        {
           

            Mapper.CreateMap<AttributeValue, DC.AttributeVocabularyValue>()
                .ForMember(dc => dc.Content, opt => opt.MapFrom(x =>  x.Value  is string ? new DC.AttributeValueLocalizedContent { LocaleCode = "en-US", Value = x.Value as string  } : null))
                .ForMember(dc => dc.Value, opt => opt.MapFrom(x => x.Id ))
                // TODO: do not hard code this.
                .ForMember(dc => dc.Sequence, opt => opt.MapFrom(x => 0))
            ;
            Mapper.CreateMap<DC.AttributeVocabularyValue, AttributeValue>()
                .ForMember(dc => dc.Value, opt => opt.MapFrom(x => x.Content != null &&!string.IsNullOrEmpty( x.Content.Value)? x.Content.Value :  x.Value))
                  .ForMember(x => x.Id, op => op.MapFrom(x => (x.Value.ToString())));

           

           
         

            #region Attributes
            Mapper.CreateMap<Attribute, DC.Attribute>().ConvertUsing(new AttributeToContractConverter2());

            Mapper.CreateMap<DC.Attribute, Attribute>()
                .ForMember(x => x.AdminName, op => op.MapFrom(x => x.AdminName))
                .ForMember(x => x.Values, opt => opt.MapFrom(x => x.VocabularyValues))
                .ForMember(x => x.Id, opt => opt.MapFrom(x => x.AttributeFQN))
                .ForMember(x => x.Name, opt => opt.MapFrom(x => x.Content.Value))
                .ForMember(x=> x.IsActive , opt => opt.MapFrom(x=> x.IsActive ))
                .ForMember(x => x.IsVisible, opt => opt.MapFrom(x => x.IsVisible))
                
                .ForMember( x=> x.AttributeMetadata , opt=> opt.MapFrom(x=> x.AttributeMetadata))
                .ForMember(x => x.Regex, opt => opt.MapFrom(x => x.Validation.RegularExpression))
                .ForMember(x => x.Min, opt => opt.MapFrom(dc => dc.Validation.MinNumericValue ?? dc.Validation.MinStringLength))
                .ForMember(x => x.Max, opt => opt.MapFrom(dc => dc.Validation.MaxNumericValue ?? dc.Validation.MaxStringLength))
                .ForMember(x => x.MinDate, opt => opt.MapFrom(dc => dc.Validation.MinDateTime))
                .ForMember(x => x.MaxDate, opt => opt.MapFrom(dc => dc.Validation.MaxDateTime))
                ;

            Mapper.CreateMap<DC.AttributeMetadataItem, AttributeMetadataItem>();
            Mapper.CreateMap<AttributeMetadataItem, DC.AttributeMetadataItem>();


            Mapper.CreateMap<DC.AttributeVocabularyValue, AttributeVocabularyValue>();
            Mapper.CreateMap<AttributeVocabularyValue, DC.AttributeVocabularyValue>();

            Mapper.CreateMap<AttributeVocabularyValueLocalizedContent, DC.AttributeValueLocalizedContent>();
            Mapper.CreateMap<DC.AttributeValueLocalizedContent, AttributeVocabularyValueLocalizedContent>();

            #endregion
        }

        public class AttributeToContractConverter2 : ITypeConverter<Attribute, DC.Attribute>
        {
            protected static T ToValue<T>(object value)
            {
                var converter = TypeDescriptor.GetConverter(typeof(T));
                if (value != null && converter.CanConvertFrom(value.GetType()))
                    return (T)converter.ConvertFrom(value);

                return default(T);
            }

            public DC.Attribute Convert(ResolutionContext context)
            {
                var source = (Attribute)context.SourceValue;

                if (source == null)
                    return null;

                
                var attributeValidation = new DC.AttributeValidation
                {
                    RegularExpression = source.Regex,
                };

                // apply the correct attribute validation
                if (source.DataType == AttributeDataType.DateTime)
                {
                    attributeValidation.MinDateTime  = source.MinDate;
                    attributeValidation.MaxDateTime = source.MaxDate;
                    if (source.Values != null)
                    {
                        source.Values.ForEach(x =>
                        {
                            DateTime dt;
                            if (x.Id == null)
                            {
                                if (x.Value is string && DateTime.TryParse((string)x.Value, out dt))
                                {
                                    x.Id = dt;
                                }
                                else
                                {
                                    x.Id = x.Value;
                                }
                            }

                        });
                    }
                }
                else if (source.DataType == AttributeDataType.Number)
                {
                    attributeValidation.MinNumericValue = source.Min;
                    attributeValidation.MaxNumericValue = source.Max;
                    if (source.Values != null)
                    {
                        source.Values.ForEach(x =>
                        {
                            double dval;
                            if (x.Id == null)
                            {
                                if (x.Value is string && double.TryParse((string)x.Value, out dval))
                                {
                                    x.Id = dval;
                                }
                                else
                                {
                                    x.Id = x.Value;
                                }
                            }


                        });
                    }
                }
                else if (source.DataType == AttributeDataType.String || source.InputType == AttributeInputType.TextArea)
                {
                    attributeValidation.MinStringLength = source.Min.HasValue ? (int?)Decimal.ToInt32(source.Min.Value) : null;
                    attributeValidation.MaxStringLength = source.Max.HasValue ? (int?)Decimal.ToInt32(source.Max.Value) : null;
                    if (source.Values != null)
                    {
                        source.Values.ForEach(x =>
                        {
                            double dval;
                            if (x.Id == null)
                            {
                                x.Id = Regex.Replace(x.Value as string ?? "", "[^a-zA-Z0-9]", "_"); ;
                            }


                        });
                    }
                }




                if (source.DataType == AttributeDataType.None)
                {
                    if (source.InputType == AttributeInputType.TextArea)
                    {
                        source.DataType = AttributeDataType.String;
                    }
                    if (source.InputType == AttributeInputType.YesNo)
                    {
                        source.DataType = AttributeDataType.Bool;
                    }
                }

                var destination = new DC.Attribute
                {
                    AdminName = source.AdminName,
                    IsRequired = source.IsRequired,
                    IsVisible = source.IsVisible ,
                    IsActive = source.IsActive,
                    DisplayGroup = source.DisplayGroup ,
                    AttributeCode = (source.Name ?? "").Trim(),
                    Validation = attributeValidation,
                    VocabularyValues = Mapper.Map<List<DC.AttributeVocabularyValue>>(source.Values),
                    AttributeFQN = source.Id,
                    AttributeMetadata = Mapper.Map<List<DC.AttributeMetadataItem>>(source.AttributeMetadata),
                    Content = new DC.AttributeLocalizedContent
                    {
                        Value = (source.Name ?? "").Trim(),
                        LocaleCode = "en-US",
                    },
                    InputType = Enum.GetName(typeof(AttributeInputType), source.InputType),
                    DataType = Enum.GetName(typeof(AttributeDataType), source.DataType),
                    ValueType = GetOrInferValueType(source),
                  
                };

                return destination;
            }

            /// <summary>
            /// Infers the ValueType from the InputType and UsageType if none is provided.
            /// </summary>
            private static string GetOrInferValueType(Attribute source)
            {
                source.IsProperty = true;
                if (source.ValueType != AttributeValueType.Unknown)
                {
                    return null;
                }
                else
                {
                    // a "list" input type is always predefined.
                    if (source.InputType == AttributeInputType.List)
                        return AttributeValueType.Predefined.ToString();
                    // a non-list input type has to be either a Property OR an Extra
                    else if (source.IsProperty == true && source.IsExtra == true)
                        throw new ArgumentException(String.Format("A {0} input type cannot be both a Property and an Extra.", Enum.GetName(typeof(AttributeInputType), source.InputType)));
                    // a Property is always an AdminEntered ValueType
                    else if (source.IsProperty == true)
                        return AttributeValueType.AdminEntered.ToString();
                    // an Extra is always a ShopperEntered ValueType
                    else if (source.IsExtra == true)
                        return AttributeValueType.ShopperEntered.ToString();
                    else
                        throw new ArgumentException(String.Format("A {0} input type must be a property or an extra.", Enum.GetName(typeof(AttributeInputType), source.InputType)));
                }
            }
        }
        //private List<AttributeValue> MapVocabularyValueInProductTypeListToSelectedValues(List<DC.AttributeVocabularyValueInProductType> list, string attributeFQN)
        //{
        //    if (list == null)
        //        return new List<AttributeValue>();

        //    List<AttributeValue> r =
        //        (from l in list
        //        orderby l.Order
        //        select new AttributeValue {
        //             AttributeFQN = attributeFQN,
        //             Id = l.Value.ToString()  ,
        //             Value = l.VocabularyValueDetail != null && l.VocabularyValueDetail.Content != null && !string.IsNullOrEmpty( l.VocabularyValueDetail.Content.StringValue  )
        //             ? l.VocabularyValueDetail.Content.StringValue : l.Value 
                     
        //        }).ToList();

        //    return r;
        //}
    }
}
