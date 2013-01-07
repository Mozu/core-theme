// -----------------------------------------------------------------------
// <copyright file="SetVarTag.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

namespace Mozu.SiteBuilder.Mvc.Tags
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Web.Mvc;
    using System.Web.Mvc.Html;
    using Mozu.SiteBuilder.Mvc;
    

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    /// 
    [NDjango.ParserNodes.Description("tbd")]
    [NDjango.Interfaces.Name("require_script")]
    public class IncludeScriptTag : SimpleTagBase
    {

        protected override string ProcessTag(System.Web.Mvc.HtmlHelper html, ArgumentCollection arguments, ref NDjango.Interfaces.IContext context)
        {
            if ( arguments.Count != 1 )
                throw new InvalidOperationException ("includescript takes only 1 arg");

            //List<string> scripts = (List<string>);

            //if (scripts == null)
            //{
            //    SiteBuilderContext.Current.PageContext.Scripts = scripts = new List<string>();
            //}

            //scripts.Add("'resources/scripts" + arguments[0].Value.ToString() + "'"); // TODO: get the scripts directory from the template or something
            return html.Action("Add", "Script", new { area="misc", scriptName = arguments[0].Value.ToString() }).ToHtmlString();
        }
    }
}
