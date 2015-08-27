using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Mozu.SiteBuilder.Mvc.Filters
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;

    [NDjango.Interfaces.Name("truncatechars")]
    public class TruncateCharsFilter : NDjango.Interfaces.IFilterWithContext
    {


        object NDjango.Interfaces.IFilterWithContext.PerformWithParamAndContext(object value, IEnumerable<object> parameter, NDjango.Interfaces.IContext context)
        {
            string str = null;
            int? maxLength = null;
            string breaker = (string)parameter.ElementAtOrDefault(1) ?? "...";
            try
            {
                maxLength = Convert.ToInt32(parameter.First());
                str = (string)value;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            if (!maxLength.HasValue || String.IsNullOrEmpty(str))
            {
                return str;
            }
            else
            {
                return str.Length <= maxLength ? str : (str.Substring(0, maxLength.Value - breaker.Length) + breaker);
            }
        }

        object NDjango.Interfaces.IFilter.DefaultValue
        {
            get { throw new NotImplementedException(); }
        }

        object NDjango.Interfaces.IFilter.PerformWithParam(object value, object parameter)
        {
            string str = (string)value;
            int maxLength = (int)parameter;

            return str.Length <= maxLength ? str : str.Substring(0, maxLength);

        }

        object NDjango.Interfaces.ISimpleFilter.Perform(object value)
        {
            throw new NotImplementedException();
        }
    }
}