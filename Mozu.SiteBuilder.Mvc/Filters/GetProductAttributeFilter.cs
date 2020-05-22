using System.Collections.Generic;
using System.Linq;
using NDjango.Interfaces;
using NDjango.FiltersCS.List;
using System.Collections;
using Mozu.ProductRuntime.Contracts;
using Mozu.Core.Extensions;

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
        static readonly FindWhereFilter findWhere = new FindWhereFilter();
        static readonly IFilterWithContext prop = new NDjango.Filters.PropFilter();

        public object Perform(object value) { return null; }
        public object PerformWithParam(object value, object parameter) { return null; }
        public object DefaultValue { get{return null;} }

        public object PerformWithParamAndContext(object value, IEnumerable<object> parameter, IContext context)
        {
            var attrName = parameter.First().ToString();
            var typed = value as Product;
            if (typed != null) return GetAttributeFromProduct(typed, attrName);
            else return GetAttributeFromUntyped(value, context, attrName);
        }

        private static object GetAttributeFromUntyped(object value, IContext context, string attrName)
        {
            var attributes = GetAttributesFrom(value, context);
            var matchingProductProperty = findWhere.PerformWithParamAndContext(attributes, new[] { "attributeFQN", attrName }, context); // this will firstordefault, so returning null is fine.
            return matchingProductProperty;
        }

        private object GetAttributeFromProduct(Product typed, string attrName)
        {
            var props = typed.Properties ?? new List<ProductProperty>();
            var opts = typed.Options ?? new List<ProductOption>();
            return ((object)props.FirstOrDefault(x => x.AttributeFqn.EqualsIgnoreCase(attrName))) ?? opts.FirstOrDefault(x => x.AttributeFqn.EqualsIgnoreCase(attrName));
        }

        private static IEnumerable<object> GetAttributesFrom(object value, IContext context)
        {
            var props = prop.PerformWithParam(value, "properties");
            var properties = ToSafeEnumerable(props);
            var opts = prop.PerformWithParam(value, "options");
            var options = ToSafeEnumerable(opts);
            return properties.Concat(options);
        }

        public static IEnumerable<object> ToSafeEnumerable(object input)
        {
             if(input is IEnumerable) return (input as IEnumerable).Cast<object>();
            return Enumerable.Empty<object>();
        }
    }
}
