using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Mozu.Core;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Settings;
using Mozu.SiteBuilder.Mvc.Tags;

namespace Mozu.SiteBuilder.Mvc.Filters
{

    [NDjango.Interfaces.Name("default")]
    public class DefaultFilter : NDjango.Interfaces.IFilterWithContext
    {

        public object PerformWithParamAndContext(object value, IEnumerable<object> parameter, NDjango.Interfaces.IContext context)
        {
            if (value.IsTruthy())
            {
                return value;
            }
            return parameter.FirstOrDefault();
        }

        public object DefaultValue
        {
            get { return null; }
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

    /// <summary>
    /// formats a stylshee link given a styleshee name accounting for cdn
    /// <code> {{ "/stylesheets/storefront.less"|stylesheet_tag:"default" }}</code>
    /// </summary>
   
    [NDjango.Interfaces.Name("stylesheet_tag")]
    public class Stylesheet:  NDjango.Interfaces.IFilterWithContext 
    {

        object NDjango.Interfaces.IFilterWithContext.PerformWithParamAndContext(object value, IEnumerable<object> parameters, NDjango.Interfaces.IContext context)
        {

            var ctx = context.SiteContext()  ;
            var theme = ctx.Theme.Id;
            var themeSettingsTs = context.Resolve<IThemeSettingsRepository>().GetTimeStamp(theme).Result;
            var themeTs = ctx.Theme.TimeStamp;
            var cdn = context.Resolve<SiteContext>().CdnPrefix;
            var apiContext = context.Resolve<IApiContext>();

            var pc = context.PageContext();
            return string.Format("<link rel=\"stylesheet\" href=\"{4}{0}?SBTHEME={1}&dt={2}-{3}{5}{6}\"  type=\"text/css\">",
                value, 
                theme, 
                themeSettingsTs.Ticks.ToString("X2"),
                themeTs.Ticks.ToString("X2"),
                string.IsNullOrEmpty(cdn) ? null : (cdn + "/"), 
                (pc.IsDebugMode ? "&debug=true" : ""),
                (apiContext.DataViewMode == DataViewModeType.Pending ? "&dv=p":"") );
                
             

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
