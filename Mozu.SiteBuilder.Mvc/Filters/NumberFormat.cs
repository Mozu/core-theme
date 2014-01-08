using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.Mvc.Filters
{
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
