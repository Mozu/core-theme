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
        public override string ProfileName { get { return GetType().FullName; } }

        protected override void Configure()
        {

            Mapper.CreateMap<AttributeValue, DC.AttributeVocabularyValue>()
                .ForMember(dc => dc.Content, opt => opt.ResolveUsing((AttributeValue x) =>  x.Value  is string 
                    ? new DC.AttributeValueLocalizedContent
                      {
                          //adding back hard codings per Jon roeder.
                          LocaleCode = "en-US",
                          Value = x.Value as string
                      } 
                    : null))
                .ForMember(dc => dc.Value, opt => opt.ResolveUsing(x => x.Id ))
                // TODO: do not hard code this.
                .ForMember(dc => dc.Sequence, opt => opt.ResolveUsing((AttributeValue x) => 0))
                // ignores
                .ForMember(dc => dc.IsHidden, op => op.Ignore())
                ;

            Mapper.CreateMap<DC.AttributeVocabularyValue, AttributeValue>()
                .ForMember(dc => dc.Value, opt => opt.ResolveUsing(x => x.Content != null && !string.IsNullOrEmpty( x.Content.Value)
                    ? x.Content.Value :  x.Value))
                .ForMember(x => x.Id, op => op.ResolveUsing((DC.AttributeVocabularyValue x) => (x.Value != null ? x.Value.ToString() : null)))
                .ForMember(x => x.AttributeFQN, opt => opt.Ignore())
                ;

            Mapper.CreateMap<Attribute, DC.Attribute>()
                .ConvertUsing(new AttributeToContractConverter2())
                ;

            Mapper.CreateMap<DC.Attribute, Attribute>()
                .ForMember(x => x.AdminName, op => op.ResolveUsing(x => x.AdminName))
                .ForMember(x => x.Values, opt => opt.ResolveUsing(x => x.VocabularyValues))
                .ForMember(x => x.Id, opt => opt.ResolveUsing(x => x.AttributeFQN))
                .ForMember(x => x.AttributeCode, opt => opt.ResolveUsing(x => x.AttributeCode))
                .ForMember(x => x.AttributeId, opt => opt.ResolveUsing(x => x.Id))
                .ForMember(x => x.Name, opt => opt.ResolveUsing(x => (x.Content != null) ? x.Content.Value : null))
                .ForMember(x=> x.IsActive , opt => opt.ResolveUsing(x=> x.IsActive ))
                .ForMember(x => x.IsVisible, opt => opt.ResolveUsing(x => x.IsVisible))
                
                .ForMember( x=> x.AttributeMetadata , opt=> opt.ResolveUsing(dc=> dc.AttributeMetadata))
                .ForMember(x => x.Regex, opt => opt.ResolveUsing(dc => dc.Validation != null ? dc.Validation.RegularExpression : null))
                .ForMember(x => x.Min, opt => opt.ResolveUsing(dc => dc.Validation != null 
                    ? (dc.Validation.MinNumericValue ?? dc.Validation.MinStringLength)
                    : null))
                .ForMember(x => x.Max, opt => opt.ResolveUsing(dc => dc.Validation != null 
                    ? (dc.Validation.MaxNumericValue ?? dc.Validation.MaxStringLength) 
                    : null))
                .ForMember(x => x.MinDate, opt => opt.ResolveUsing(dc => dc.Validation != null ? dc.Validation.MinDateTime : null))
                .ForMember(x => x.MaxDate, opt => opt.ResolveUsing(dc => dc.Validation != null ? dc.Validation.MaxDateTime : null))
                //ignores
                .ForMember(x => x.IsOption, opt => opt.Ignore())
                .ForMember(x => x.IsExtra, opt => opt.Ignore())
                .ForMember(x => x.IsProperty, opt => opt.Ignore())
                ;

            Mapper.CreateMap<DC.AttributeMetadataItem, AttributeMetadataItem>();
            Mapper.CreateMap<AttributeMetadataItem, DC.AttributeMetadataItem>();

            Mapper.CreateMap<DC.AttributeVocabularyValue, AttributeVocabularyValue>()
                //todo: confirm sequence mapping Greg Murray on 2014-01-24
                .ForMember(x => x.ValueSequence, op => op.ResolveUsing(dc => dc.Sequence));

            Mapper.CreateMap<AttributeVocabularyValue, DC.AttributeVocabularyValue>()
                //todo: confirm sequence Greg Murray on 2014-01-24
                .ForMember(dc => dc.Sequence, op => op.ResolveUsing(x => x.ValueSequence))
                .ForMember(dc => dc.IsHidden, op => op.Ignore())
                ;

            Mapper.CreateMap<AttributeVocabularyValueLocalizedContent, DC.AttributeValueLocalizedContent>()
                //todo: confirm stringValue -> value Greg Murray on 2014-01-24
                .ForMember(dc => dc.Value, op => op.ResolveUsing(x => x.StringValue));
            Mapper.CreateMap<DC.AttributeValueLocalizedContent, AttributeVocabularyValueLocalizedContent>()
                //todo: confirm value -> stringValue Greg Murray on 2014-01-24
                .ForMember(x => x.StringValue, op => op.ResolveUsing(( DC.AttributeValueLocalizedContent dc) => dc.Value));
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
                            if (x.Id == null)
                            {
                                x.Id = Regex.Replace(x.Value as string ?? "", "[^A-Za-z0-9-_\\.]", "-"); ;
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
                    AttributeCode = !String.IsNullOrEmpty(source.AttributeCode) ? source.AttributeCode : (source.Name ?? "").Trim(),
                    Id = source.AttributeId,
                    Validation = attributeValidation,
                    VocabularyValues = source.InputType == AttributeInputType.List 
                        ? Mapper.Map<List<DC.AttributeVocabularyValue>>(source.Values) : null,
                    AttributeFQN = source.Id,
                    AttributeMetadata = Mapper.Map<List<DC.AttributeMetadataItem>>(source.AttributeMetadata),
                    Content = new DC.AttributeLocalizedContent
                    {
                        Value = (source.Name ?? "").Trim()
                        ,
                        //adding back hard codings per Jon roeder.
                        LocaleCode = "en-US",
                    },
                    InputType = Enum.GetName(typeof(AttributeInputType), source.InputType),
                    DataType = Enum.GetName(typeof(AttributeDataType), source.DataType),
                    ValueType = Enum.GetName(typeof(AttributeValueType), source.ValueType),
                  
                };

                return destination;
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
