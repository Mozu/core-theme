// -----------------------------------------------------------------------
// <copyright file="CurrencyFilter.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System.Globalization;
using Mozu.SiteBuilder.Mvc.Tags;

namespace Mozu.SiteBuilder.Mvc.Filters
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;

    [NDjango.Interfaces.Name("currency")]
    
    public class CurrencyFilter : NDjango.Interfaces.IFilterWithContext 
    {
        public object DefaultValue
        {
            get { return string.Empty; }
        }

        public object PerformWithParam(object value, object parameter)
        {
            throw new NotImplementedException();
        }

        
        public object Perform(object value)
        {
            throw new NotImplementedException();
        }

        public object PerformWithParamAndContext(object value, IEnumerable<object> parameter, NDjango.Interfaces.IContext context)
        {
            
            var siteContext = context.SiteContext();
            var format = "C" + parameter.FirstOrDefault();
            var intVal = value as int?;
            if (intVal.HasValue)
            {
                return intVal.Value.ToString(format, siteContext.NumberFormat);
            }
            var decVal = value as decimal?;
            if (decVal.HasValue)
            {
                return decVal.Value.ToString(format, siteContext.NumberFormat);
            }
            var doubleVal = value as double?;
            if (doubleVal.HasValue)
            {
                return doubleVal.Value.ToString(format, siteContext.NumberFormat);
            }
            return string.Empty;
        }
    }
}
