// -----------------------------------------------------------------------
// <copyright file="ValidationMessageTag.cs" company="Microsoft">
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
    [NDjango.Interfaces.Name("html_validation_message")]
    public class ValidationMessageTag : DynamicTagBase
    {
        //
        // Summary:
        //     Displays a validation message if an error exists for the specified field
        //     in the System.Web.Mvc.ModelStateDictionary object.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   modelName:
        //     The name of the property or model object that is being validated.
        //
        // Returns:
        //     If the property or object is valid, an empty string; otherwise, a span element
        //     that contains an error message.
        public  MvcHtmlString Process( string modelName)
        {
            return Html.ValidationMessage(modelName);
        }
        //
        // Summary:
        //     Displays a validation message if an error exists for the specified field
        //     in the System.Web.Mvc.ModelStateDictionary object.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   modelName:
        //     The name of the property or model object that is being validated.
        //
        //   htmlAttributes:
        //     An object that contains the HTML attributes for the element.
        //
        // Returns:
        //     If the property or object is valid, an empty string; otherwise, a span element
        //     that contains an error message.
        public  MvcHtmlString Process( string modelName, IDictionary<string, object> htmlAttributes)
             {
                 return Html.ValidationMessage(modelName, htmlAttributes);
        }
        //
        // Summary:
        //     Displays a validation message if an error exists for the specified field
        //     in the System.Web.Mvc.ModelStateDictionary object.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   modelName:
        //     The name of the property or model object that is being validated.
        //
        //   htmlAttributes:
        //     An object that contains the HTML attributes for the element.
        //
        // Returns:
        //     If the property or object is valid, an empty string; otherwise, a span element
        //     that contains an error message.
        public  MvcHtmlString Process( string modelName, object htmlAttributes)
             {
                 return Html.ValidationMessage(modelName, htmlAttributes);
        }
        //
        // Summary:
        //     Displays a validation message if an error exists for the specified field
        //     in the System.Web.Mvc.ModelStateDictionary object.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   modelName:
        //     The name of the property or model object that is being validated.
        //
        //   validationMessage:
        //     The message to display if the specified field contains an error.
        //
        // Returns:
        //     If the property or object is valid, an empty string; otherwise, a span element
        //     that contains an error message.
        public  MvcHtmlString Process( string modelName, string validationMessage)
             {
                 return Html.ValidationMessage(modelName, validationMessage);
        }
        //
        // Summary:
        //     Displays a validation message if an error exists for the specified field
        //     in the System.Web.Mvc.ModelStateDictionary object.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   modelName:
        //     The name of the property or model object that is being validated.
        //
        //   validationMessage:
        //     The message to display if the specified field contains an error.
        //
        //   htmlAttributes:
        //     An object that contains the HTML attributes for the element.
        //
        // Returns:
        //     If the property or object is valid, an empty string; otherwise, a span element
        //     that contains an error message.
        public  MvcHtmlString Process( string modelName, string validationMessage, IDictionary<string, object> htmlAttributes)
             {
                 return Html.ValidationMessage(modelName, validationMessage, htmlAttributes);
        }
        //
        // Summary:
        //     Displays a validation message if an error exists for the specified field
        //     in the System.Web.Mvc.ModelStateDictionary object.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   modelName:
        //     The name of the property or model object that is being validated.
        //
        //   validationMessage:
        //     The message to display if the specified field contains an error.
        //
        //   htmlAttributes:
        //     An object that contains the HTML attributes for the element.
        //
        // Returns:
        //     If the property or object is valid, an empty string; otherwise, a span element
        //     that contains an error message.
        public  MvcHtmlString Process( string modelName, string validationMessage, object htmlAttributes)
        {
        return Html.ValidationMessage ( modelName,  validationMessage,  htmlAttributes);
        }
     
    }
}
