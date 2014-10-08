using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mozu.SiteBuilder.Mvc.Tags;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using NDjango.Interfaces;

namespace Mozu.SiteBuilder.Mvc.Filters
{
     [NDjango.Interfaces.Name("parent_template")]
    public class ParentTemplate : NDjango.Interfaces.IFilterWithContext
    {
         object NDjango.Interfaces.IFilterWithContext.PerformWithParamAndContext(object value, IEnumerable<object> parameter, NDjango.Interfaces.IContext context)
         {

             var vpp = context.Resolve<MozuVirtualPathProvider>();
             var htm = context.Resolve<ITemplateManager>();
             var themeFile = vpp.GetThemeFileInfo("templates/"+ (string) value, false);

             if (themeFile != null)
             {
                 var parentFile = vpp.GetParentThemeFileInfo(themeFile);
                 if (parentFile != null)
                 {
                     return htm.GetTemplate(parentFile.FullPath);
                 }
                 else
                 {
                     return htm.GetTemplate(themeFile.FullPath);
                     
                 }
             }
             throw new Exception("origional template not found "+ value);
            //return value;
        }

        object NDjango.Interfaces.IFilter.DefaultValue
        {
            get { return 7; }
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
