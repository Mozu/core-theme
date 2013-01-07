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

    [NDjango.Interfaces.Name("absolute_url")]
    public class AbsoluteUrlFilter : NDjango.Interfaces.IFilterWithContext
    {



        public object PerformWithParamAndContext(object value, object parameter, NDjango.Interfaces.IContext context)
        {
            //todo get sitecontext out of context look up site url.
            return string.Format("http://{0}{1}", System.Web.HttpContext.Current.Request.Url.Host, value);
        }

        public object DefaultValue
        {
            get { return "Xxx"; }
        }

        public object PerformWithParam(object value, object parameter)
        {
            throw new NotImplementedException();
        }

        public object Perform(object value)
        {
            throw new NotImplementedException();
        }
    }
}