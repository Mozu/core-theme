using System.Collections.Generic;
using System.Linq;
using Microsoft.FSharp.Core;
using NDjango.Interfaces;

namespace Mozu.SiteBuilder.Mvc.Filters
{
    /// <summary>
    /// Provides a shortcut to getting the value of a particular named product attribute.
    /// Returns null if the product doesn't exist, if there are no attributes on the product, or if the product contains no attributes by that name.
    /// {{ product | get_product_attribute_value('availability') }}
    /// </summary>
    [Name("get_product_attribute_value")]
    class GetProductAttributeValueFilter : IFilterWithContext
    {

        static readonly IFilterWithContext prop = new NDjango.Filters.PropFilter();

        static readonly GetProductAttributeFilter getProductAttribute = new GetProductAttributeFilter();
        public object Perform(object value) { return null; }
        public object PerformWithParam(object value, object parameter) { return null; }
        public object DefaultValue { get { return null; } }

        public object PerformWithParamAndContext(object value, IEnumerable<object> parameter, IContext context)
        {
            var attr = getProductAttribute.PerformWithParamAndContext(value, parameter, context);
            return attr != null ? GetAttrValue(attr) : null;
        }

        /// <summary>
        /// Different types of attributes need different treatment to get their root values.
        /// </summary>
        /// <param name="attr"></param>
        /// <returns></returns>
        private static object GetAttrValue(object attr)
        {

            var values = prop.PerformWithParam(attr, "values");

            if (values == null)
            {
                return null;
            }

            var safeValues = GetProductAttributeFilter.ToSafeEnumerable(values);

            if (!safeValues.Any())
            {
                return null;
            }

            // assuming for now that the first value is the one we want.
            // TODO: reevaluate this, but remember to stay in sync with HyprLive changes
            var value = safeValues.First();
            return GetMatchedValue(value);
        }

        private static object GetMatchedValue(object value)
        {

            var stringValueProp = prop.PerformWithParam(value, "stringValue");
            if (stringValueProp != null) return stringValueProp;

            var valueProp = prop.PerformWithParam(value, "value");
            return valueProp;
        }
    }
}
