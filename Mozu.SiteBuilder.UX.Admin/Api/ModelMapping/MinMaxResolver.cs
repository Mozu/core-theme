using System;
using System.Collections.Generic;
using AutoMapper;
using Mozu.ProductAdmin.Contracts;
using Attribute = Mozu.ProductAdmin.Contracts.Attribute;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class AttributeValidationMaxResolver : AttributeValidationMinMaxResolver
    {
        protected override object ResolveCore(Attribute source)
        {
            return Strategies[source.DataType]("max", source.Validation);
        }
    }

    public class AttributeValidationMinResolver : AttributeValidationMinMaxResolver
    {
        protected override object ResolveCore(Attribute source)
        {
            return Strategies[source.DataType]("min", source.Validation);
        }
    }

    public abstract class AttributeValidationMinMaxResolver : ValueResolver<Attribute, object>
    {
        protected static readonly IDictionary<string, Func<string, AttributeValidation, object>> Strategies = new Dictionary<string, Func<string, AttributeValidation, object>>(StringComparer.OrdinalIgnoreCase)
        {
            { "DateTime", MapDate },
            { "Number",   MapNumeric },
            { "String",   MapString },
        };

        private static object MapString(string key, AttributeValidation validation)
        {
            return key == "min" ? validation.MinStringLength : validation.MaxStringLength;
        }

        private static object MapNumeric(string key, AttributeValidation validation)
        {
            return key == "min" ? validation.MinNumericValue : validation.MaxNumericValue;
        }

        private static object MapDate(string key, AttributeValidation validation)
        {
            return key == "min" ? validation.MinDateValue : validation.MaxDateValue;
        }
    }
}