// -----------------------------------------------------------------------
// <copyright file="DropDownListTag.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

namespace Mozu.SiteBuilder.Mvc.Tags.Html
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Web.Mvc;
    using System.Web.Mvc.Html;
    
    [NDjango.ParserNodes.Description("HtmlTest1")]
    [NDjango.Interfaces.Name("html_drop_down_list")]
    public class DropDownListTag : DynamicTagBase
    {
        public  MvcHtmlString Process( string name)
        {
            return Html.DropDownList(name, null /* selectList */, null /* optionLabel */, null /* htmlAttributes */);
        }

        public  MvcHtmlString Process( string name, string optionLabel)
        {
            return Html.DropDownList( name, null /* selectList */, optionLabel, null /* htmlAttributes */);
        }

        public  MvcHtmlString Process( string name, IEnumerable<SelectListItem> selectList)
        {
            return Html.DropDownList(name, selectList, null /* optionLabel */, null /* htmlAttributes */);
        }

        public  MvcHtmlString Process( string name, IEnumerable<SelectListItem> selectList, object htmlAttributes)
        {
            return Html.DropDownList(name, selectList, null /* optionLabel */, HtmlHelper.AnonymousObjectToHtmlAttributes(htmlAttributes));
        }

        public  MvcHtmlString Process( string name, IEnumerable<SelectListItem> selectList, IDictionary<string, object> htmlAttributes)
        {
            return Html.DropDownList(name, selectList, null /* optionLabel */, htmlAttributes);
        }

        public  MvcHtmlString Process( string name, IEnumerable<SelectListItem> selectList, string optionLabel)
        {
            return Html.DropDownList(name, selectList, optionLabel, null /* htmlAttributes */);
        }

        public  MvcHtmlString Process( string name, IEnumerable<SelectListItem> selectList, string optionLabel, object htmlAttributes)
        {
            return Html.DropDownList(name, selectList, optionLabel, HtmlHelper.AnonymousObjectToHtmlAttributes(htmlAttributes));
        }

        public  MvcHtmlString Process( string name, IEnumerable<SelectListItem> selectList, string optionLabel, IDictionary<string, object> htmlAttributes)
        {
            return Html.DropDownList(name, selectList, optionLabel, htmlAttributes);
        }

    }
}
