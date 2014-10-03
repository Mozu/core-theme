using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.Mvc.Filters
{
    /// <summary>
    /// formats object(s) given a string format using {0} ,{1},..{n} place holders
    /// 
    /// <code>"the {0} fox jumped over the {2} {1}"("brown","dog","lazy")</code>
    /// </summary>
    [NDjango.Interfaces.Name("string_format")]
    public class StringFormatFilter: NDjango.Interfaces.IFilterWithContext
    {
        object NDjango.Interfaces.IFilterWithContext.PerformWithParamAndContext(object value, IEnumerable<object> parameter, NDjango.Interfaces.IContext context)
        {
            return string.Format((string)value, parameter.ToArray());
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
