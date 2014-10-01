using System.Collections.Generic;
using System.Linq;
using NDjango.FiltersCS;
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
        public object Perform(object value)
        {
            return null;
        }

        public object PerformWithParam(object value, object parameter)
        {
            return null;
        }

        public object DefaultValue { get { return null; } }
        public object PerformWithParamAndContext(object value, IEnumerable<object> parameter, IContext context)
        {
            var attr = new GetProductAttributeFilter().PerformWithParamAndContext(value, parameter, context);
            return attr != null ? GetAttrValue(attr) : null;
        }

        /// <summary>
        /// Different types of attributes need different treatment to get their root values.
        /// </summary>
        /// <param name="attr"></param>
        /// <returns></returns>
        private static object GetAttrValue(object attr)
        {
            if (!attr.ContainsProperty("values")) return null;
            var values = attr.GetPropValue("values") as IEnumerable<object>;
            if (values == null) return null;

            // assuming for now that the first value is the one we want.
            // TODO: reevaluate this, but remember to stay in sync with HyprLive changes
            var value = values.First();
            return value.GetPropValue("stringValue") ?? value.GetPropValue("value");
        }
    }
}
