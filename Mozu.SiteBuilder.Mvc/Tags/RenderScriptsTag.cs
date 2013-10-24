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

    using Mozu.SiteBuilder.Mvc;
    

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    /// 
    [NDjango.ParserNodes.Description("tbd")]
    [NDjango.Interfaces.Name("load_all_scripts")]
    public class RenderScriptsTag : DynamicTagBase
    {

        protected override void ProcessTag(ArgumentCollection arguments, ref NDjango.Interfaces.IContext context, out string buffer, out string templateName)
        {
            buffer = templateName = null;
            var sbc = context.SiteBuilderContext();
            var scriptsArray = (List<string>)context.HttpContext().Items["scripts"];
            if (scriptsArray == null)
                return ;


            object model = string.Join(",", scriptsArray.Select(x => "'" + x + "'").ToArray());

            buffer= context.Render("RenderScripts", model);

        }
    }
}
