using System;
using System.Collections.Generic;
using Mozu.Core.Exceptions;
using Mozu.SiteBuilder.Mvc.Tags;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using NDjango.Interfaces;

namespace Mozu.SiteBuilder.Mvc.Filters
{
     [Name("parent_template")]
    public class ParentTemplate : IFilterWithContext
    {
         object IFilterWithContext.PerformWithParamAndContext(object value, IEnumerable<object> parameter, IContext context)
         {
             var vpp = context.Resolve<MozuVirtualPathProvider>();
             var htm = context.Resolve<ITemplateManager>();
             var valueString = (string) value;
             var themeFile = vpp.GetThemeFileInfo(string.Format("templates/{0}", valueString), false);

             if (themeFile == null) throw GetNotFound(valueString);

             var parentFile = vpp.GetParentThemeFileInfo(themeFile);
             if (parentFile == null) throw GetNotFound(themeFile.VirtualPath);
             return htm.GetTemplate(parentFile.FullPath);
         }

         object IFilter.DefaultValue
        {
            get { return null; }
        }

        object IFilter.PerformWithParam(object value, object parameter)
        {
            return null;
        }

        object ISimpleFilter.Perform(object value)
        {
            return null;
        }

         private static VaeItemNotFoundException GetNotFound(string path)
         {
             return new VaeItemNotFoundException(string.Format("template not found {0}", path));
         }
    }
}