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
    [NDjango.Interfaces.Name("html_editor_for_model")]
    public class EditorForModelTag : DynamicTagBase
    {
        //
        // Summary:
        //     Returns an HTML input element for each property in the model.
        //
        // Parameters:
        //   html:
        //     The HTML helper instance that this method extends.
        //
        // Returns:
        //     An HTML input element for each property in the model.
        public MvcHtmlString Process()
        {
            return Html.EditorForModel();
        }
        //
        // Summary:
        //     Returns an HTML input element for each property in the model, using additional
        //     view data.
        //
        // Parameters:
        //   html:
        //     The HTML helper instance that this method extends.
        //
        //   additionalViewData:
        //     An anonymous object that can contain additional view data that will be merged
        //     into the System.Web.Mvc.ViewDataDictionary<TModel> instance that is created
        //     for the template.
        //
        // Returns:
        //     An HTML input element for each property in the model.
        public MvcHtmlString Process(object additionalViewData)
        {
            return Html.EditorForModel(additionalViewData);
        }
        //
        // Summary:
        //     Returns an HTML input element for each property in the model, using the specified
        //     template.
        //
        // Parameters:
        //   html:
        //     The HTML helper instance that this method extends.
        //
        //   templateName:
        //     The name of the template to use to render the object.
        //
        // Returns:
        //     An HTML input element for each property in the model and in the specified
        //     template.
        public MvcHtmlString Process(string templateName)
        {
            return Html.EditorForModel(templateName);
        }
        //
        // Summary:
        //     Returns an HTML input element for each property in the model, using the specified
        //     template and additional view data.
        //
        // Parameters:
        //   html:
        //     The HTML helper instance that this method extends.
        //
        //   templateName:
        //     The name of the template to use to render the object.
        //
        //   additionalViewData:
        //     An anonymous object that can contain additional view data that will be merged
        //     into the System.Web.Mvc.ViewDataDictionary<TModel> instance that is created
        //     for the template.
        //
        // Returns:
        //     An HTML input element for each property in the model.
        public MvcHtmlString Process(string templateName, object additionalViewData)
        {
            return Html.EditorForModel(templateName, additionalViewData);
        }
        //
        // Summary:
        //     Returns an HTML input element for each property in the model, using the specified
        //     template name and HTML field name.
        //
        // Parameters:
        //   html:
        //     The HTML helper instance that this method extends.
        //
        //   templateName:
        //     The name of the template to use to render the object.
        //
        //   htmlFieldName:
        //     A string that is used to disambiguate the names of HTML input elements that
        //     are rendered for properties that have the same name.
        //
        // Returns:
        //     An HTML input element for each property in the model and in the named template.
        public MvcHtmlString Process(string templateName, string htmlFieldName)
        {
            return Html.EditorForModel(templateName, htmlFieldName);
        }
        //
        // Summary:
        //     Returns an HTML input element for each property in the model, using the template
        //     name, HTML field name, and additional view data.
        //
        // Parameters:
        //   html:
        //     The HTML helper instance that this method extends.
        //
        //   templateName:
        //     The name of the template to use to render the object.
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
        //     An HTML input element for each property in the model.
        public MvcHtmlString Process(string templateName, string htmlFieldName, object additionalViewData)
        {
            return Html.EditorForModel(templateName, htmlFieldName, additionalViewData);
        }



    }
}
