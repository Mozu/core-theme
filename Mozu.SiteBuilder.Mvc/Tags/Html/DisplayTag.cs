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
    [NDjango.ParserNodes.Description("html_display")]
    [NDjango.Interfaces.Name("html_display")]
    public class DisplayTag : DynamicTagBase
    {
        // Summary:
        //     Returns HTML markup for each property in the object that is represented by
        //     a string expression.
        //
        // Parameters:
        //   html:
        //     The HTML helper instance that this method extends.
        //
        //   expression:
        //     An expression that identifies the object that contains the properties to
        //     display.
        //
        // Returns:
        //     The HTML markup for each property in the object that is represented by the
        //     expression.
        public MvcHtmlString Process(string expression)
        {
            return Html.Display(expression);
        }

        //
        // Summary:
        //     Returns HTML markup for each property in the object that is represented by
        //     a string expression, using additional view data.
        //
        // Parameters:
        //   html:
        //     The HTML helper instance that this method extends.
        //
        //   expression:
        //     An expression that identifies the object that contains the properties to
        //     display.
        //
        //   additionalViewData:
        //     An anonymous object that can contain additional view data that will be merged
        //     into the System.Web.Mvc.ViewDataDictionary<TModel> instance that is created
        //     for the template.
        //
        // Returns:
        //     The HTML markup for each property in the object that is represented by the
        //     expression.
        public MvcHtmlString Process(string expression, object additionalViewData)
        {
            return Html.Display(expression, additionalViewData);
        }

        //
        // Summary:
        //     Returns HTML markup for each property in the object that is represented by
        //     the expression, using the specified template.
        //
        // Parameters:
        //   html:
        //     The HTML helper instance that this method extends.
        //
        //   expression:
        //     An expression that identifies the object that contains the properties to
        //     display.
        //
        //   templateName:
        //     The name of the template that is used to render the object.
        //
        // Returns:
        //     The HTML markup for each property in the object that is represented by the
        //     expression.
        public MvcHtmlString Process(string expression, string templateName)
        {
            return Html.Display(expression, templateName);
        }

        //
        // Summary:
        //     Returns HTML markup for each property in the object that is represented by
        //     the expression, using the specified template and additional view data.
        //
        // Parameters:
        //   html:
        //     The HTML helper instance that this method extends.
        //
        //   expression:
        //     An expression that identifies the object that contains the properties to
        //     display.
        //
        //   templateName:
        //     The name of the template that is used to render the object.
        //
        //   additionalViewData:
        //     An anonymous object that can contain additional view data that will be merged
        //     into the System.Web.Mvc.ViewDataDictionary<TModel> instance that is created
        //     for the template.
        //
        // Returns:
        //     The HTML markup for each property in the object that is represented by the
        //     expression.
        public MvcHtmlString Process(string expression, string templateName, object additionalViewData)
        {
            return Html.Display(expression, templateName, additionalViewData);
        }

        //
        // Summary:
        //     Returns HTML markup for each property in the object that is represented by
        //     the expression, using the specified template and an HTML field ID.
        //
        // Parameters:
        //   html:
        //     The HTML helper instance that this method extends.
        //
        //   expression:
        //     An expression that identifies the object that contains the properties to
        //     display.
        //
        //   templateName:
        //     The name of the template that is used to render the object.
        //
        //   htmlFieldName:
        //     A string that is used to disambiguate the names of HTML input elements that
        //     are rendered for properties that have the same name.
        //
        // Returns:
        //     The HTML markup for each property in the object that is represented by the
        //     expression.
        public MvcHtmlString Process(string expression, string templateName, string htmlFieldName)
        {
            return Html.Display(expression, templateName, htmlFieldName);
        }

        //
        // Summary:
        //     Returns HTML markup for each property in the object that is represented by
        //     the expression, using the specified template, HTML field ID, and additional
        //     view data.
        //
        // Parameters:
        //   html:
        //     The HTML helper instance that this method extends.
        //
        //   expression:
        //     An expression that identifies the object that contains the properties to
        //     display.
        //
        //   templateName:
        //     The name of the template that is used to render the object.
        //
        //   htmlFieldName:
        //     A string that is used to disambiguate the names of HTML input elements that
        //     are rendered for properties that have the same name.
        //
        //   additionalViewData:
        //     An anonymous object that can contain additional view data that will be merged
        //     into the System.Web.Mvc.ViewDataDictionary<TModel> instance that is created
        //     for the template.
        //
        // Returns:
        //     The HTML markup for each property in the object that is represented by the
        //     expression.
        public MvcHtmlString Process(string expression, string templateName, string htmlFieldName, object additionalViewData)
        {
            return Html.Display(expression, templateName, htmlFieldName, additionalViewData);
        }



    }
}
