// -----------------------------------------------------------------------
// <copyright file="SetVarTag.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System.Collections.Generic;
using System.Linq;
using NDjango;
using NDjango.Interfaces;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    /// <summary>
    ///     TODO: Update summary.
    /// </summary>
    [ParserNodes.DescriptionAttribute("tbd")]
    [Name("all_scripts")]
    public class DebugScriptsTag : SimpleTagBase
    {
        protected override void ProcessTag(ArgumentCollection arguments, ref NDjango.Interfaces.IContext context, out string buffer, out string templateName)
        {
            buffer = templateName = null;
            ISiteBuilderContext siteContext = context.SiteBuilderContext();


            var scriptsArray = (List<string>) context.HttpContext().Items ["scripts"];
            if (scriptsArray == null)
                return ;


            string model = string.Join(",", scriptsArray.Select(x => "'" + x + "'"));
            //buffer= context.Render("debugscripts", model);
            buffer = model;
        }
    }
}