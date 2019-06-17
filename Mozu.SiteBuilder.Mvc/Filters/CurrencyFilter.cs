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
    using Mozu.SiteBuilder.Mvc.Contexts;
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
        decimal DoConversion (decimal invalue, IPageContext pageContext)
        {
            if (pageContext.CurrencyRateInfo?.Rate.HasValue == true)
            {
                var price = (decimal)(pageContext.CurrencyRateInfo.Rate.Value * invalue);
                var round = (double)pageContext.CurrencyRateInfo.Rounding.GetValueOrDefault(4);
                return Math.Round(price * (decimal)Math.Pow(10, round), MidpointRounding.AwayFromZero) * (decimal)Math.Pow(10, -1 * round);
            }

            return invalue;
        }
        public object PerformWithParamAndContext(object value, IEnumerable<object> parameter, IContext context)
        {
            if (value == null || (value.ToString() == string.Empty))
            {
                return string.Empty;
            }
            var pageContext = context.PageContext();

         /*
           It turns out that negative currency values can be displayed in lots of weird little
           ways that we didn't prepare for when writing core theme. We want to give our clients
           the option to use this special formatting without breaking/significantly changing
           their existing themes. This is why we include the useCulturalNegativeStandard flag; if
           it is TRUE, the filter will use whichever CurrencyNegativePattern is saved in the page
           context for the current localecode. If it is false, we default to the pattern
           "-$n", which is the number 1. 
         */
            NumberFormatInfo numberFormat = (NumberFormatInfo)pageContext.NumberFormat.Clone();

            var format = "C";
            bool useCulturalNegativeStandard = false;
            if (parameter.Any())
            {
                useCulturalNegativeStandard = (bool)parameter.FirstOrDefault();
            }
            if (!useCulturalNegativeStandard)
            {
                 numberFormat.CurrencyNegativePattern = 1;   
            } 
            if (parameter.Count() > 1)
            {
                format += parameter.ElementAt(1);
            }

            if (value is IConvertible)
            {
                var formatProvider = value as IFormatProvider ?? System.Threading.Thread.CurrentThread.CurrentCulture;
                try
                {
                    return DoConversion( (value as IConvertible).ToDecimal(formatProvider), pageContext).ToString(format, numberFormat);
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
                    d = DoConversion(d, pageContext);
                    return d.ToString(format, numberFormat);
                }
            }
          
            return string.Empty;
        }

      
    }
}
