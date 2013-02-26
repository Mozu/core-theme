using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Mozu.ProductAdmin.Contracts;
using Attribute = Mozu.ProductAdmin.Contracts.Attribute;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    using Function = Func<string, AttributeValidation, object>;

    public class AttributeValidationMaxResolver : AttributeValidationMinMaxResolver
    {
        protected override object ResolveCore(Attribute source)
        {
            return Map("max", source);
        }
    }

    public class AttributeValidationMinResolver : AttributeValidationMinMaxResolver
    {
        protected override object ResolveCore(Attribute source)
        {
            return Map("min", source);
        }
    }

    public abstract class AttributeValidationMinMaxResolver : ValueResolver<Attribute, object>
    {
        protected const string messageFormat = "Unable to map the Attribute's DataType. {0} was found, but the only configured mappings are [{1}].";

        protected static readonly IDictionary<string, Func<string, AttributeValidation, object>> Strategies = new Dictionary<string, Func<string, AttributeValidation, object>>(StringComparer.OrdinalIgnoreCase)
        {
            { "DateTime", MapDate },
            { "Number",   MapNumeric },
            { "String",   MapString },
        };

        protected object Map(string key, Attribute attribute)
        {
            Function func;
            if (attribute.DataType != null && Strategies.TryGetValue(attribute.DataType, out func))
                return func(key, attribute.Validation);

            throw new InvalidOperationException(string.Format(messageFormat, attribute.DataType ?? "(null)", string.Join(", ", Strategies.Select(x => x.Key))));
        }

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