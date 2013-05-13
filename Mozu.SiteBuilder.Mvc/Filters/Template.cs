// -----------------------------------------------------------------------
// <copyright file="Template.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

namespace Mozu.SiteBuilder.Mvc.Filters
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using NDjango.Interfaces;
    using Mozu.SiteBuilder.Mvc.ViewEngine;
    using System.Web.Mvc;


    [NDjango.ParserNodes.Description("converts a string into an ITemplate")]
    [NDjango.Interfaces.Name("to-template")]
    public class TemplateFilter : NDjango.Interfaces.IFilterWithContext 
    {
        



        object IFilterWithContext.PerformWithParamAndContext(object value, object parameter, IContext context)
        {
            var html = (System.Web.Mvc.HtmlHelper)context.tryfind("Html").Value;
            string path = (string)value;
            var result = ViewEngines.Engines.FindPartialView(html.ViewContext.Controller.ControllerContext, path);
            if (result.View != null)
            {
                var view = ((DjangoMozuView)result.View);
                return  view.GetManager(html.ViewContext.HttpContext).GetTemplate(view.viewPath);
              //  return view.TemplateManager.GetTemplate(view.viewPath);

            }
            return null;
        }

        object IFilter.DefaultValue
        {
            get { return string.Empty  ; }
        }

        object IFilter.PerformWithParam(object value, object parameter)
        {
            throw new NotImplementedException();
        }

        

        object ISimpleFilter.Perform(object value)
        {
            throw new NotImplementedException();
        }
    }

}
