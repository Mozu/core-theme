// -----------------------------------------------------------------------
// <copyright file="CurrencyFilter.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

namespace Mozu.SiteBuilder.Mvc.Filters
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;

    [NDjango.Interfaces.Name("currency")]
    
    public class CurrencyFilter : NDjango.Interfaces.IFilter 
    {
        public object DefaultValue
        {
            get { return string.Empty; }
        }

        public object PerformWithParam(object value, object parameter)
        {
            var format = "C" + parameter;
            var intVal = value as int?;
            if (intVal.HasValue)
            {
                return intVal.Value.ToString(format);
            }
            var decVal = value as decimal?;
            if (decVal.HasValue)
            {
                return decVal.Value.ToString(format);
            }
            var doubleVal = value as double?;
            if (doubleVal.HasValue)
            {
                return doubleVal.Value.ToString(format);
            }
            return string.Empty;
        }

        
        public object Perform(object value)
        {
            return this.PerformWithParam(value, null);
        }
    }
}
