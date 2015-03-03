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
            if (value == null || (value.ToString() == string.Empty))
            {
                return string.Empty;
            }
            var siteContext = context.SiteContext();
            var format = "C" + parameter.FirstOrDefault();
            var convertable = value as IConvertible;
            var formatProvider = value as IFormatProvider ?? System.Threading.Thread.CurrentThread.CurrentCulture;

            if (convertable != null)
            {
                try
                {
                    return convertable.ToDecimal(formatProvider).ToString(format, siteContext.NumberFormat);
                }
                catch
                {
                    return string.Empty;
                }
                    
            }
            
            decimal d;
            if (Decimal.TryParse(value.ToString(), out d))
            {
                return d.ToString(format, siteContext.NumberFormat);
            }

          
            return string.Empty;
        }
    }
}
