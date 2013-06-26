using System;
using System.Collections.Generic;
using System.ComponentModel;
using AutoMapper;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes;
using Attribute = Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Attribute;
using AttributeValidation = Mozu.ProductAdmin.Contracts.AttributeValidation;
using DC = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class AttributeToContractConverter : ITypeConverter<Attribute, DC.Attribute>
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
            var source = (Attribute) context.SourceValue;

            if (source == null)
                return null;

            var attributeValidation = new AttributeValidation
            {
                RegularExpression = source.Regex,
            };

            // apply the correct attribute validation
            if (source.DataType == AttributeDataType.DateTime)
            {
                attributeValidation.MinDateValue = source.MinDate;
                attributeValidation.MaxDateValue = source.MaxDate;
            }
            else if (source.DataType == AttributeDataType.Number)
            {
                attributeValidation.MinNumericValue = source.Min;
                attributeValidation.MaxNumericValue = source.Max;
            }
            else if (source.DataType == AttributeDataType.String || source.InputType == AttributeInputType.TextArea)
            {
                attributeValidation.MinStringLength = source.Min.HasValue ? (int?)Decimal.ToInt32(source.Min.Value) : null;
                attributeValidation.MaxStringLength = source.Max.HasValue ? (int?)Decimal.ToInt32(source.Max.Value) : null;
            }


            if (source.DataType == AttributeDataType.None)
            {
                if (source.InputType == AttributeInputType.TextArea)
                {
                    source.DataType = AttributeDataType.String;
                }
                if (source.InputType == AttributeInputType.YesNo )
                {
                    source.DataType = AttributeDataType.Bool ;
                }
            }
            var destination = new DC.Attribute
            {
                AdminName = source.AdminName ,
                AttributeCode =  (source.Name ?? "").Trim(),
                Validation = attributeValidation,
                VocabularyValues = Mapper.Map<List<DC.AttributeVocabularyValue>>(source.Values),
                AttributeFQN = source.Id,
                AttributeMetadata = Mapper.Map<List<DC.AttributeMetadataItem>>(source.AttributeMetadata ),
                Content = new DC.AttributeLocalizedContent
                {
                    Description = "",
                    Name = (source.Name ?? "").Trim(),
                    LocaleCode = "en-US",
                },
                InputType = Enum.GetName(typeof(AttributeInputType), source.InputType),
                DataType = Enum.GetName(typeof(AttributeDataType), source.DataType),
                ValueType = GetOrInferValueType(source),
                IsProperty = source.IsProperty,
                IsExtra = source.IsExtra,
                IsOption = source.IsOption,                
            };

            return destination;
        }

        /// <summary>
        /// Infers the ValueType from the InputType and UsageType if none is provided.
        /// </summary>
        private static string GetOrInferValueType(Attribute source)
        {
            if (source.ValueType != AttributeValueType.Unknown)
            {
                return Enum.GetName(typeof(AttributeValueType), source.ValueType);
            }
            else
            {
                // a "list" input type is always predefined.
                if (source.InputType == AttributeInputType.List)
                    return Enum.GetName(typeof(AttributeValueType), AttributeValueType.Predefined);
                // a non-list input type has to be either a Property OR an Extra
                else if (source.IsProperty == true && source.IsExtra == true)
                    throw new ArgumentException(String.Format("A {0} input type cannot be both a Property and an Extra.", Enum.GetName(typeof(AttributeInputType), source.InputType)));
                // a Property is always an AdminEntered ValueType
                else if (source.IsProperty == true)
                    return Enum.GetName(typeof(AttributeValueType), AttributeValueType.AdminEntered);
                // an Extra is always a ShopperEntered ValueType
                else if (source.IsExtra == true)
                    return Enum.GetName(typeof(AttributeValueType), AttributeValueType.ShopperEntered);
                else
                    throw new ArgumentException(String.Format("A {0} input type must be a property or an extra.", Enum.GetName(typeof(AttributeInputType), source.InputType)));
            }
        }
    }
}