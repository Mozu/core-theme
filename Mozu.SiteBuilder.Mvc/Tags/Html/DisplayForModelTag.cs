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
    [NDjango.ParserNodes.Description("html_display_for_model")]
    [NDjango.Interfaces.Name("html_display_for_model")]
    public class DisplayForModelTag : DynamicTagBase
    {
        //
        // Summary:
        //     Returns HTML markup for each property in the model.
        //
        // Parameters:
        //   html:
        //     The HTML helper instance that this method extends.
        //
        // Returns:
        //     The HTML markup for each property in the model.
        public  MvcHtmlString Process()
        {
            return Html.DisplayForModel();
        }

        //
        // Summary:
        //     Returns HTML markup for each property in the model, using additional view
        //     data.
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
        //     The HTML markup for each property in the model.
        public MvcHtmlString Process(object additionalViewData)
        {
            return Html.DisplayForModel( additionalViewData);
        }
        //
        // Summary:
        //     Returns HTML markup for each property in the model using the specified template.
        //
        // Parameters:
        //   html:
        //     The HTML helper instance that this method extends.
        //
        //   templateName:
        //     The name of the template that is used to render the object.
        //
        // Returns:
        //     The HTML markup for each property in the model.
        public MvcHtmlString Process(string templateName)
              {
           return  Html.DisplayForModel ( templateName );
        }
        //
        // Summary:
        //     Returns HTML markup for each property in the model, using the specified template
        //     and additional view data.
        //
        // Parameters:
        //   html:
        //     The HTML helper instance that this method extends.
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
        //     The HTML markup for each property in the model.
        public MvcHtmlString Process(string templateName, object additionalViewData)
              {
           return  Html.DisplayForModel ( templateName,additionalViewData );
        }
        //
        // Summary:
        //     Returns HTML markup for each property in the model using the specified template
        //     and HTML field ID.
        //
        // Parameters:
        //   html:
        //     The HTML helper instance that this method extends.
        //
        //   templateName:
        //     The name of the template that is used to render the object.
        //
        //   htmlFieldName:
        //     A string that is used to disambiguate the names of HTML input elements that
        //     are rendered for properties that have the same name.
        //
        // Returns:
        //     The HTML markup for each property in the model.
        public MvcHtmlString Process(string templateName, string htmlFieldName)
             {
           return  Html.DisplayForModel ( templateName, htmlFieldName  );
        }
        //
        // Summary:
        //     Returns HTML markup for each property in the model, using the specified template,
        //     an HTML field ID, and additional view data.
        //
        // Parameters:
        //   html:
        //     The HTML helper instance that this method extends.
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
        //     The HTML markup for each property in the model.
        public MvcHtmlString Process(string templateName, string htmlFieldName, object additionalViewData)
        {
           return  Html.DisplayForModel ( templateName, htmlFieldName ,additionalViewData );
        }
   



    }
}
