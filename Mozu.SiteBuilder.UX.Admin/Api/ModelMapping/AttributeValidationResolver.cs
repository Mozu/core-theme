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
        private static readonly IDictionary<AttributeDataType, Action<AttributeValidation, Attribute>> Strategies = new Dictionary<AttributeDataType, Action<AttributeValidation, Attribute>>
        {
            { AttributeDataType.DateTime, MapDateValues         },
            { AttributeDataType.Number,   MapNumericValues      },
            { AttributeDataType.String,   MapStringLengthValues },
        };

        private static void MapStringLengthValues(AttributeValidation validation, Attribute attribute)
        {
            validation.MinStringLength = ToValue<int?>(attribute.Min) ?? 0;
            validation.MaxStringLength = ToValue<int?>(attribute.Max) ?? 0;
        }

        private static void MapDateValues(AttributeValidation validation, Attribute attribute)
        {
            validation.MaxDateValue = ToValue<DateTime?>(attribute.Max);
            validation.MinDateValue = ToValue<DateTime?>(attribute.Min);
        }

        private static void MapNumericValues(AttributeValidation validation, Attribute attribute)
        {
            validation.MaxNumericValue = ToValue<decimal?>(attribute.Max) ?? 0m;
            validation.MinNumericValue = ToValue<decimal?>(attribute.Min) ?? 0m;
        }

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

            var attributeValidation = new AttributeValidation
            {
                RegularExpression = source.Regex,
            };

            Strategies.GetOrDefault(source.DataType, NoOp)(attributeValidation, source);

            var destination = new DC.Attribute
            {
                Validation = attributeValidation,
                VocabularyValues = Mapper.Map<List<DC.AttributeVocabularyValue>>(source.Values),
                AttributeFQN = source.Id,
                Content = new DC.AttributeLocalizedContent
                {
                    Description = "",
                    Name = source.Name,
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
                    return Enum.GetName(typeof(AttributeValueType), AttributeValueType.Admin);
                // an Extra is always a ShopperEntered ValueType
                else if (source.IsExtra == true)
                    return Enum.GetName(typeof(AttributeValueType), AttributeValueType.Shopper);
                else
                    throw new ArgumentException(String.Format("A {0} input type must be a property or an extra.", Enum.GetName(typeof(AttributeInputType), source.InputType)));
            }
        }

        private static void NoOp(AttributeValidation v, Attribute a)
        {
        }
    }
}