using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Settings;
using Mozu.SiteBuilder.Mvc.Tags;

namespace Mozu.SiteBuilder.Mvc.Filters
{
    [NDjango.ParserNodes.Description("converts a string into an ITemplate")]
    [NDjango.Interfaces.Name("stylesheet_tag")]
    public class Stylesheet:  NDjango.Interfaces.IFilterWithContext 
    {

        object NDjango.Interfaces.IFilterWithContext.PerformWithParamAndContext(object value, IEnumerable<object> parameters, NDjango.Interfaces.IContext context)
        {

            var ctx = context.SiteContext()  ;
            var theme = ctx.Theme.Id;
            var ts = context.Resolve<IThemeSettingsRepository>().GetTimeStamp(theme);
            return string.Format("<link rel=\"stylesheet\" href=\"{0}?t={1}&dt={2}\"  type=\"text/css\">", value, theme, ts.Ticks .ToString( "X2"));
                
            

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
