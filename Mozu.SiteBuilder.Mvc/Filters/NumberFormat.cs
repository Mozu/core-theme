using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.Mvc.Filters
{
    /// <summary>
    /// formats a number given a number format
    /// such as defined <a href='http://msdn.microsoft.com/en-us/library/0c899ak8%28v=vs.100%29.aspx'>http://msdn.microsoft.com/en-us/library/0c899ak8%28v=vs.100%29.aspx</a>
    /// examples;
    /// <code>
    /// {# foo =.086 #}
    /// {{foo|number_format:"#0.##%"}}
    /// Displays 8.6%
    /// 
    /// {# foo =1234567890 #}
    /// {{foo|number_format:"#,##0,,"}}
    /// Displays 1,235
    /// 
    /// {# foo =123 #}
    /// {{foo|number_format:"##0 dollars and \\0\\0 cents"}}
    /// Displays 123 dollars and 00 cents
    /// 
    /// </code>
    /// 
    /// 
    /// </summary>
    [NDjango.Interfaces.Name("number_format")]
    public class NumberFormat : NDjango.Interfaces.IFilter
    {

        object NDjango.Interfaces.IFilter.DefaultValue
        {
            get { return ""; }
        }

        object NDjango.Interfaces.IFilter.PerformWithParam(object value, object parameter)
        {
            var format = parameter as string;
            var convertableValue = value as IConvertible;

            if (format == null || convertableValue == null)
            {
                return value;
            }

            try
            {
                var d = Convert.ToDecimal(convertableValue);
                return d.ToString(format);
            }
            catch 
            {
                return value;
            }

        }

        object NDjango.Interfaces.ISimpleFilter.Perform(object value)
        {
            return value;
        }
    }
}
