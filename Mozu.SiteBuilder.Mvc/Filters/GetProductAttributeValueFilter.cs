using System.Collections.Generic;
using System.Linq;
using NDjango.Interfaces;
using Mozu.ProductRuntime.Contracts;
using System;

namespace Mozu.SiteBuilder.Mvc.Filters
{
    /// <summary>
    /// Provides a shortcut to getting the values of a particular named product attribute.
    /// Returns null if the product doesn't exist, if there are no attributes on the product, or if the product contains no attributes by that name.
    /// {{ product | get_product_attribute_values('availability') }}
    /// The stringvalue property can be requested instead of the value property by use of the second, boolean argument to this filter.
    /// {{ product | get_product_attribute_values('availability', true) }}
    /// </summary>
    [Name("get_product_attribute_values")]
    class GetProductAttributeValuesFilter : IFilterWithContext
    {
        static readonly IFilterWithContext prop = new NDjango.Filters.PropFilter();
        static readonly IFilterWithContext getProductAttribute = new GetProductAttributeFilter();

        public object Perform(object value) { return null; }
        public object PerformWithParam(object value, object parameter) { return null; }
        public object DefaultValue { get { return null; } }
        public object PerformWithParamAndContext(object value, IEnumerable<object> parameter, IContext context)
        {
            if (parameter == null || !parameter.Any()) return null;
            var attr = getProductAttribute.PerformWithParamAndContext(value, parameter.Skip(0).Take(1), context);
            var useStringValue = ShouldUseStringValue(parameter.ElementAtOrDefault(1));
            return attr != null ? GetAttrValues(attr, useStringValue) : null;
        }

        static bool ShouldUseStringValue(object stringValueParam)
        {
            bool useStringValue;
            if (stringValueParam == null || !bool.TryParse(stringValueParam.ToString(), out useStringValue))
            {
                useStringValue = false;
            }
            return useStringValue;
        }
        static object GetAttrValues(object attr, bool useStringValue)
        {
            if (attr is ProductOption) return GetValues(attr as ProductOption, useStringValue);
            else if (attr is ProductProperty) return GetValues(attr as ProductProperty, useStringValue);
            else return GetValues(attr, useStringValue);
        }
        static object[] GetValues(object attr, bool useStringValue)
        {
            var values = prop.PerformWithParam(attr, "values");
            if (values == null) return null;

            var safeValues = GetProductAttributeFilter.ToSafeEnumerable(values);
            if (!safeValues.Any()) return null;

            var propToUse = useStringValue ? "stringValue" : "value";
            return safeValues.Select(x => prop.PerformWithParam(x, propToUse)).ToArray();
        }
        static object[] GetValues(ProductProperty productProperty, bool useStringValue)
        {
            Func<ProductPropertyValue, object> getter;
            if (useStringValue)
                getter = p => p.StringValue;
            else
                getter = p => p.Value;

            if (productProperty.Values == null || !productProperty.Values.Any())
                return null;
            return productProperty.Values.Select(getter).ToArray();
        }
        static object[] GetValues(ProductOption productOption, bool useStringValue)
        {
            Func<ProductOptionValue, object> getter;
            if (useStringValue)
                getter = p => p.StringValue;
            else
                getter = p => p.Value;

            if (productOption.Values == null || !productOption.Values.Any())
                return null;
            return productOption.Values.Select(getter).ToArray();
        }
    }


    /// <summary>
    /// Provides a shortcut to getting the first value of a particular named product attribute.
    /// Returns null if the product doesn't exist, if there are no attributes on the product, or if the product contains no attributes by that name.
    /// {{ product | get_product_attribute_value('availability') }}
    /// The stringvalue property can be requested instead of the value property by use of the second, boolean argument to this filter.
    /// {{ product | get_product_attribute_value('availability', true) }}
    /// </summary>
    [Name("get_product_attribute_value")]
    class GetProductAttributeValueFilter : IFilterWithContext
    {
        static readonly IFilterWithContext getAllAttrsFilter = new GetProductAttributeValuesFilter();

        public object DefaultValue { get { return null; } }
        public object Perform(object value) { return null; }
        public object PerformWithParam(object value, object parameter) { return null; }

        public object PerformWithParamAndContext(object value, IEnumerable<object> parameter, IContext context)
        {
            var attrs = getAllAttrsFilter.PerformWithParamAndContext(value, parameter, context) as object[];
            if (attrs == null) return null;
            return attrs.ElementAtOrDefault(0);
        }
    }
}
