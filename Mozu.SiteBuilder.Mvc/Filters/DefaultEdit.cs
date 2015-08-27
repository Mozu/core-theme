using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mozu.SiteBuilder.Mvc.Tags;

namespace Mozu.SiteBuilder.Mvc.Filters
{

    /// <summary>
    ///     If in edit mode and value string representation evaluates to empty string(null is one of the cases) , 
    ///     use given default. Otherwise, use the value.
    ///
    ///     For example:
    ///<code>
    ///     {{ value|default:"nothing" }}
    ///</code>
    ///     If value is "" (the empty string), the output will be nothing.
    /// </summary>
    [NDjango.Interfaces.Name("default_edit")]
    public class DefaultEditFilter : NDjango.Interfaces.IFilterWithContext
    {




        object NDjango.Interfaces.IFilterWithContext.PerformWithParamAndContext(object value, IEnumerable<object> parameter, NDjango.Interfaces.IContext context)
        {
            var isEditmode = context.PageContext().IsEditMode;
            if (!isEditmode)
            {
                return value;
            }
            if (value == null || value is string && string.IsNullOrEmpty((string)value))
            {
                return parameter;
            }
            return value;
        }

        object NDjango.Interfaces.IFilter.DefaultValue
        {
            get { throw new NotImplementedException(); }
        }

        object NDjango.Interfaces.IFilter.PerformWithParam(object value, object parameter)
        {
            throw new NotImplementedException();
        }

        object NDjango.Interfaces.ISimpleFilter.Perform(object value)
        {
            throw new NotImplementedException();
        }
    }
}
