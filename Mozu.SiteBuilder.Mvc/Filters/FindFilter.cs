using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Mozu.SiteBuilder.Mvc.Filters
{
    public interface ITagFilterFindable
    {
        object Filter(IEnumerable<object> parameter);
    }
    
    [NDjango.Interfaces.Name("find")]
    public class FindFilter : NDjango.Interfaces.IFilterWithContext
    {


        object NDjango.Interfaces.IFilterWithContext.PerformWithParamAndContext(object value, IEnumerable<object> parameter, NDjango.Interfaces.IContext context)
        {
            var key = parameter.FirstOrDefault();
            if (key == null)
            {
                return null;
            }
            if (value is ITagFilterFindable)
            {
                return ((ITagFilterFindable)value).Filter(parameter);
            }
            if (value is System.Collections.IDictionary)
            {
                try
                {
                    return ((System.Collections.IDictionary) value)[value];
                }
                catch
                {
                }

            }
            return null;


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