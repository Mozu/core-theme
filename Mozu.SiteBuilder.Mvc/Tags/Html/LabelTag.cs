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
    [NDjango.Interfaces.Name("html_label")]
    public class LabelTag : DynamicTagBase
    {
        // Summary:
        //     Returns an HTML label element and the property name of the property that
        //     is represented by the specified expression.
        //
        // Parameters:
        //   html:
        //     The HTML helper instance that this method extends.
        //
        //   expression:
        //     An expression that identifies the property to display.
        //
        // Returns:
        //     An HTML label element and the property name of the property that is represented
        //     by the expression.
        public MvcHtmlString Process(string expression)
        {
            return Html.Label(expression);
        }
        //
        //
        // Returns:
        //     Returns System.Web.Mvc.MvcHtmlString.
        public MvcHtmlString Process(string expression, string labelText)
        {
            return Html.Label(expression, labelText );
        }


    }
}
