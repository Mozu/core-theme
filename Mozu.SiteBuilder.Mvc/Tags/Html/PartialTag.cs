// -----------------------------------------------------------------------
// <copyright file="HtmlTest1.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

namespace Mozu.SiteBuilder.Mvc.Tags.Html
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Web.Mvc.Html;
    using System.Web.Mvc;
    using System.Web.Routing;
    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    /// 
    [NDjango.ParserNodes.Description("HtmlTest1")]
    [NDjango.Interfaces.Name("html_partial")]
    public class PartialTag : DynamicTagBase
    {
        // Summary:
        //     Renders the specified partial view as an HTML-encoded string.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   partialViewName:
        //     The name of the partial view to render.
        //
        // Returns:
        //     The partial view that is rendered as an HTML-encoded string.
        public MvcHtmlString Process(string partialViewName)
        {
            return Html.Partial(partialViewName);
        }

        //
        // Summary:
        //     Renders the specified partial view as an HTML-encoded string.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   partialViewName:
        //     The name of the partial view to render.
        //
        //   model:
        //     The model for the partial view.
        //
        // Returns:
        //     The partial view that is rendered as an HTML-encoded string.
        public MvcHtmlString Process(string partialViewName, object model)
        {
            return Html.Partial(partialViewName, model);
        }

        //
        // Summary:
        //     Renders the specified partial view as an HTML-encoded string.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   partialViewName:
        //     The name of the partial view to render.
        //
        //   viewData:
        //     The view data dictionary for the partial view.
        //
        // Returns:
        //     The partial view that is rendered as an HTML-encoded string.
        public MvcHtmlString Process(string partialViewName, ViewDataDictionary viewData)
        {
            return Html.Partial(partialViewName, viewData);
        }

        //
        // Summary:
        //     Renders the specified partial view as an HTML-encoded string.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   partialViewName:
        //     The name of the partial view.
        //
        //   model:
        //     The model for the partial view.
        //
        //   viewData:
        //     The view data dictionary for the partial view.
        //
        // Returns:
        //     The partial view that is rendered as an HTML-encoded string.
        public MvcHtmlString Process(string partialViewName, object model, ViewDataDictionary viewData)
        {
            return Html.Partial(partialViewName, model, viewData);
        }


		  public MvcHtmlString Process(string partialViewName, object model, RouteValueDictionary  values)
		  {
		  	var vd	 = Html.ViewContext.ViewData;
			  foreach (var item in values)
			  {
			  	vd[item.Key] = item.Value;
			  }
			  var output = Html.Partial(partialViewName, model, vd);
		  	return output;
		  }


    }
}
