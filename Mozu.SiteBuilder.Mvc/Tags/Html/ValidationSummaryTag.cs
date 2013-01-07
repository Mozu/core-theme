// -----------------------------------------------------------------------
// <copyright file="ValidationSummary.cs" company="Microsoft">
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
    [NDjango.Interfaces.Name("html_validation_summary")]
    public class ValidationSummaryTag : DynamicTagBase
    {

        //
        // Summary:
        //     Returns an unordered list (ul element) of validation messages that are in
        //     the System.Web.Mvc.ModelStateDictionary object.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        // Returns:
        //     A string that contains an unordered list (ul element) of validation messages.
        public  MvcHtmlString Process()
        {
            return Html.ValidationSummary();
        }

        //
        // Summary:
        //     Returns an unordered list (ul element) of validation messages that are in
        //     the System.Web.Mvc.ModelStateDictionary object and optionally displays only
        //     model-level errors.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   excludePropertyErrors:
        //     true to have the summary display model-level errors only, or false to have
        //     the summary display all errors.
        //
        // Returns:
        //     A string that contains an unordered list (ul element) of validation messages.
        public MvcHtmlString Process(bool excludePropertyErrors)
        {
            return Html.ValidationSummary(excludePropertyErrors);
        }
        //
        // Summary:
        //     Returns an unordered list (ul element) of validation messages that are in
        //     the System.Web.Mvc.ModelStateDictionary object.
        //
        // Parameters:
        //   htmlHelper:
        //     The HMTL helper instance that this method extends.
        //
        //   message:
        //     The message to display if the specified field contains an error.
        //
        // Returns:
        //     A string that contains an unordered list (ul element) of validation messages.
        public MvcHtmlString Process(string message)
        {
            return Html.ValidationSummary( message);
        }
        //
        // Summary:
        //     Returns an unordered list (ul element) of validation messages that are in
        //     the System.Web.Mvc.ModelStateDictionary object and optionally displays only
        //     model-level errors.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   excludePropertyErrors:
        //     true to have the summary display model-level errors only, or false to have
        //     the summary display all errors.
        //
        //   message:
        //     The message to display with the validation summary.
        //
        // Returns:
        //     A string that contains an unordered list (ul element) of validation messages.
        public MvcHtmlString Process(bool excludePropertyErrors, string message)
        {
            return Html.ValidationSummary(excludePropertyErrors, message);
        }
        //
        // Summary:
        //     Returns an unordered list (ul element) of validation messages that are in
        //     the System.Web.Mvc.ModelStateDictionary object.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   message:
        //     The message to display if the specified field contains an error.
        //
        //   htmlAttributes:
        //     A dictionary that contains the HTML attributes for the element.
        //
        // Returns:
        //     A string that contains an unordered list (ul element) of validation messages.
        public MvcHtmlString Process(string message, IDictionary<string, object> htmlAttributes)
        {
            return Html.ValidationSummary( message, htmlAttributes);
        }
        //
        // Summary:
        //     Returns an unordered list (ul element) of validation messages in the System.Web.Mvc.ModelStateDictionary
        //     object.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   message:
        //     The message to display if the specified field contains an error.
        //
        //   htmlAttributes:
        //     An object that contains the HTML attributes for the element.
        //
        // Returns:
        //     A string that contains an unordered list (ul element) of validation messages.
        public MvcHtmlString Process(string message, object htmlAttributes)
        {
            return Html.ValidationSummary( message, htmlAttributes);
        }
        //
        // Summary:
        //     Returns an unordered list (ul element) of validation messages that are in
        //     the System.Web.Mvc.ModelStateDictionary object and optionally displays only
        //     model-level errors.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   excludePropertyErrors:
        //     true to have the summary display model-level errors only, or false to have
        //     the summary display all errors.
        //
        //   message:
        //     The message to display with the validation summary.
        //
        //   htmlAttributes:
        //     A dictionary that contains the HTML attributes for the element.
        //
        // Returns:
        //     A string that contains an unordered list (ul element) of validation messages.
        public MvcHtmlString Process(bool excludePropertyErrors, string message, IDictionary<string, object> htmlAttributes)
        {
            return Html.ValidationSummary(excludePropertyErrors, message, htmlAttributes);
        }
        //
        // Summary:
        //     Returns an unordered list (ul element) of validation messages that are in
        //     the System.Web.Mvc.ModelStateDictionary object and optionally displays only
        //     model-level errors.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   excludePropertyErrors:
        //     true to have the summary display model-level errors only, or false to have
        //     the summary display all errors.
        //
        //   message:
        //     The message to display with the validation summary.
        //
        //   htmlAttributes:
        //     An object that contains the HTML attributes for the element.
        //
        // Returns:
        //     A string that contains an unordered list (ul element) of validation messages.
        public MvcHtmlString Process(bool excludePropertyErrors, string message, object htmlAttributes)
        {
            return Html.ValidationSummary( excludePropertyErrors,  message,  htmlAttributes);
        }
    }
}
