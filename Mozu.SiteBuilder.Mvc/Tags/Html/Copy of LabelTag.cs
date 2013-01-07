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
    [NDjango.Interfaces.Name("html_label_for_model")]
    public class LabelForModel : DynamicTagBase
    {
        //
        // Summary:
        //     Returns an HTML label element and the property name of the property that
        //     is represented by the model.
        //
        // Parameters:
        //   html:
        //     The HTML helper instance that this method extends.
        //
        // Returns:
        //     An HTML label element and the property name of the property that is represented
        //     by the model.
        public  MvcHtmlString Process ()
        {
            return Html.LabelForModel();
        }
        //
        //
        // Returns:
        //     Returns System.Web.Mvc.MvcHtmlString.
        public MvcHtmlString Process(string labelText)
        {
            return Html.LabelForModel(labelText);
        }


    }
}
