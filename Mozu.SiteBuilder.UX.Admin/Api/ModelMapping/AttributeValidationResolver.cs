using System;
using System.Collections.Generic;
using System.ComponentModel;
using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes;
using Attribute = Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Attribute;
using AttributeValidation = Mozu.ProductAdmin.Contracts.AttributeValidation;
using DC = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class AttributeValidationMappingAction : IMappingAction<Attribute, DC.Attribute>
    {
        private static readonly IDictionary<AttributeDataType, Action<AttributeValidation, Attribute>> strategies = new Dictionary<AttributeDataType, Action<AttributeValidation, Attribute>>
            {
                { AttributeDataType.DateTime, MapDateValues },
                { AttributeDataType.Number, MapNumericValues },
                { AttributeDataType.String, MapStringLengthValues },
            };

        public void Process(DC.Attribute source, Attribute destination)
        {
            source.Validation = source.Validation ?? new AttributeValidation();
            var validation = new AttributeValidation { RegularExpression = source.Validation.RegularExpression, };

            strategies[destination.DataType](validation, destination);
        }

        private static void MapStringLengthValues(AttributeValidation validation, Attribute attribute)
        {
            validation.MinStringLength = ToValue<int?>(attribute.Min);
            validation.MaxStringLength = ToValue<int?>(attribute.Max);
        }

        private static void MapDateValues(AttributeValidation validation, Attribute attribute)
        {
            validation.MaxDateValue = ToValue<DateTime?>(attribute.Max);
            validation.MinDateValue = ToValue<DateTime?>(attribute.Min);
        }

        private static void MapNumericValues(AttributeValidation validation, Attribute attribute)
        {
            validation.MaxNumericValue = ToValue<decimal?>(attribute.Max);
            validation.MinNumericValue = ToValue<decimal?>(attribute.Min);
        }

        protected static T ToValue<T>(object value)
        {
            var converter = TypeDescriptor.GetConverter(typeof(T));
            if (value != null && converter.CanConvertFrom(value.GetType()))
                return (T)converter.ConvertFrom(value);

            return default(T);
        }

        public void Process(Attribute source, DC.Attribute destination)
        {
        }

        /*protected override AttributeValidation ResolveCore(Attribute source)
        {
            var destination = new AttributeValidation { RegularExpression = source.Regex, };

            strategies[source.DataType](destination, source);

            return destination;
        }*/
    }

    //public class AttributeToAttributeValidationResolver : ValueResolver<Attribute, AttributeValidation>
    //{
    //    /*private static readonly IEnumerable<IValidationMappingStrategy> Strategies = new List<IValidationMappingStrategy>
    //    {
    //        new DateValidationMappingStrategy(),
    //    };*/


    //    protected override AttributeValidation ResolveCore(Attribute source)
    //    {
    //        var validation = new AttributeValidation { RegularExpression = source.Regex, };

    //        //var strategy = Strategies.FirstOrDefault(x => x.CanMap(source));
    //        //if (strategy != null)
    //        //    strategy.Map(validation, source);

    //        return validation;
    //    }

    //}
}