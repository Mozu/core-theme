using System.Collections.Generic;
using System.Linq;
using NDjango.Interfaces;

namespace Mozu.SiteBuilder.Mvc.Filters
{
    /// <summary>
    /// Provides a shortcut to looking for a particular product attribute by name.
    /// Returns null if the product doesn't exist, if there are no attributes on the product, or if the product contains no attributes by that name.
    ///  {{ product | get_product_attribute('availability') }} 
    /// </summary>
    [Name("get_product_attribute")]
    public class GetProductAttributeFilter : IFilterWithContext
    {
        public object Perform(object value)
        {
            return null;
        }

        public object PerformWithParam(object value, object parameter)
        {
            return null;
        }

        public object DefaultValue { get{return null;} }
        public object PerformWithParamAndContext(object value, IEnumerable<object> parameter, IContext context)
        {
            var attributes = GetAttributesFrom(value, context);
            var findWhereFilter = new NDjango.FiltersCS.List.FindWhereFilter();
            var attrName = parameter.First().ToString();
            var matchingProductProperty = findWhereFilter.PerformWithParamAndContext(attributes, new []{"attributeFQN", attrName}, context); // this will firstordefault, so returning null is fine.
            return matchingProductProperty;
        }

        private static IEnumerable<object> GetAttributesFrom(object value, IContext context)
        {
            var propFilter = new NDjango.Filters.PropFilter() as IFilterWithContext;
            var properties = propFilter.PerformWithParam(value, "properties") as IEnumerable<object> ?? Enumerable.Empty<object>();
            var options = propFilter.PerformWithParam(value, "options") as IEnumerable<object> ?? Enumerable.Empty<object>();
            return properties.Concat(options);
        }
    }
}
