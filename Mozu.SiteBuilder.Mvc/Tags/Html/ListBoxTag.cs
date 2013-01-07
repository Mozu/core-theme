// -----------------------------------------------------------------------
// <copyright file="ListBoxTag.cs" company="Microsoft">
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

     [NDjango.ParserNodes.Description("HtmlTest1")]
    [NDjango.Interfaces.Name("html_list_box")]

    public class ListBoxTag : DynamicTagBase
    {
        //
        // Summary:
        //     Returns a multi-select select element using the specified HTML helper and
        //     the name of the form field.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   name:
        //     The name of the form field to return.
        //
        // Returns:
        //     An HTML select element.
        //
        // Exceptions:
        //   System.ArgumentException:
        //     The name parameter is null or empty.
        public  MvcHtmlString Process( string name)
         {
             return Html.ListBox(name);
         }
        //
        // Summary:
        //     Returns a multi-select select element using the specified HTML helper, the
        //     name of the form field, and the specified list items.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   name:
        //     The name of the form field to return.
        //
        //   selectList:
        //     A collection of System.Web.Mvc.SelectListItem objects that are used to populate
        //     the drop-down list.
        //
        // Returns:
        //     An HTML select element with an option subelement for each item in the list.
        //
        // Exceptions:
        //   System.ArgumentException:
        //     The name parameter is null or empty.
        public  MvcHtmlString Process( string name, IEnumerable<SelectListItem> selectList)
        {
            return Html.ListBox(name, selectList);
        }
        //
        // Summary:
        //     Returns a multi-select select element using the specified HTML helper, the
        //     name of the form field, the specified list items, and the specified HMTL
        //     attributes.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   name:
        //     The name of the form field to return.
        //
        //   selectList:
        //     A collection of System.Web.Mvc.SelectListItem objects that are used to populate
        //     the drop-down list.
        //
        //   htmlAttributes:
        //     An object that contains the HTML attributes to set for the element.
        //
        // Returns:
        //     An HTML select element with an option subelement for each item in the list..
        //
        // Exceptions:
        //   System.ArgumentException:
        //     The name parameter is null or empty.
        public  MvcHtmlString Process( string name, IEnumerable<SelectListItem> selectList, IDictionary<string, object> htmlAttributes)
        {
            return Html.ListBox(name, selectList, htmlAttributes);
        }
        //
        // Summary:
        //     Returns a multi-select select element using the specified HTML helper, the
        //     name of the form field, and the specified list items.
        //
        // Parameters:
        //   htmlHelper:
        //     The HTML helper instance that this method extends.
        //
        //   name:
        //     The name of the form field to return.
        //
        //   selectList:
        //     A collection of System.Web.Mvc.SelectListItem objects that are used to populate
        //     the drop-down list.
        //
        //   htmlAttributes:
        //     An object that contains the HTML attributes to set for the element.
        //
        // Returns:
        //     An HTML select element with an option subelement for each item in the list..
        //
        // Exceptions:
        //   System.ArgumentException:
        //     The name parameter is null or empty.
        public MvcHtmlString Process(string name, IEnumerable<SelectListItem> selectList, object htmlAttributes)
        {
            return  Html.ListBox(name, selectList, htmlAttributes);
        }
      
    }
}
