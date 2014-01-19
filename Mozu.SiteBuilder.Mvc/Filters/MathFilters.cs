using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.Mvc.Filters
{
    /// <summary>
    /// divides a number by another.
    /// <code>foo|divide:4</code>
    /// </summary>
    [NDjango.Interfaces.Name("divide")]
    public class DivideFilter : NDjango.Interfaces.IFilter 
    {

        public object DefaultValue
        {
            get { return ""; }
        }

        public object PerformWithParam(object value, object parameter)
        {
            var convertableValue = value as IConvertible;
            var convertableParameter = parameter as IConvertible;

            if (convertableValue == null || convertableParameter == null)
            {
                return null;
            }

            var dValue = Convert.ToDecimal(convertableValue);

            var dParamater = Convert.ToDecimal(convertableParameter);

            if (dParamater == 0)
            {
                return "";
            }
            return dValue/dParamater;
            
        }

        public object Perform(object value)
        {
            return "";
        }
    }

}
