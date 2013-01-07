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
    [NDjango.Interfaces.Name("load_all_scripts")]
    public class RenderScriptsTag : DynamicTagBase
    {

        protected override string ProcessTag(System.Web.Mvc.HtmlHelper html, ArgumentCollection arguments, ref NDjango.Interfaces.IContext context)
        {

            return html.Action("RenderScripts", "Script", new { area = "misc" }).ToHtmlString();

        }
    }
}
