using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Tags;

namespace Mozu.SiteBuilder.Mvc.Filters
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    /// <summary>
    /// prepends the url with the requestted hostname .
    /// 
    /// example:
    /// <code>
    ///     {{"/homepage"|absolute_url}}
    /// </code>
    /// </summary>
    [NDjango.Interfaces.Name("absolute_url")]
    [Obsolete]
    public class AbsoluteUrlFilter : NDjango.Interfaces.IFilterWithContext
    {


        object NDjango.Interfaces.IFilterWithContext.PerformWithParamAndContext(object value, IEnumerable<object> parameter, NDjango.Interfaces.IContext context)
        {
            var pc = context.Resolve<PageContext>();
            var url = pc.Url;
            Uri currentUrl = new Uri(url);

            return string.Format("http://{0}{1}", currentUrl.Host, value);
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