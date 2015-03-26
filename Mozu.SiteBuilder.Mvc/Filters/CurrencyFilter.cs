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
    using NDjango.Interfaces;

    [Name("currency")]
    
    public class CurrencyFilter : IFilterWithContext
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

        public object PerformWithParamAndContext(object value, IEnumerable<object> parameter, IContext context)
        {
            if (value == null || (value.ToString() == string.Empty))
            {
                return string.Empty;
            }

            var numberFormat = GetNumberFormat(context);
            var format = "C" + parameter.FirstOrDefault();
            if (value is IConvertible)
            {
                var formatProvider = value as IFormatProvider ?? System.Threading.Thread.CurrentThread.CurrentCulture;
                try
                {
                    return (value as IConvertible).ToDecimal(formatProvider).ToString(format, numberFormat);
                }
                catch
                {
                    return string.Empty;
                }
            }
            else
            {
                decimal d;
                if (decimal.TryParse(value.ToString(), out d))
                {
                    return d.ToString(format, numberFormat);
                }
            }
          
            return string.Empty;
        }

        private IFormatProvider GetNumberFormat(IContext context)
        {
            try
            {
                return context.SiteContext().NumberFormat;
            }
            catch (Exception)
            {
                return NumberFormatInfo.InvariantInfo;
            }
        }
    }
}
