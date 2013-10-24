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
    [NDjango.Interfaces.Name("require_script")]
    public class IncludeScriptTag : SimpleTagBase
    {
        protected override void ProcessTag(ArgumentCollection arguments, ref NDjango.Interfaces.IContext context, out string buffer, out string templateName)
        {
            if (arguments.Count != 1)
                throw new InvalidOperationException("includescript takes only 1 arg");

            var sbc = context.SiteBuilderContext();
            var scripts = (List<string>)context.HttpContext().Items ["scripts"];
            if (scripts == null)
            {
                context.HttpContext().Items["scripts"] = scripts = new List<string>();
            }
            scripts.Add(arguments[0].Value.ToString());

            buffer = null;
            templateName = null;
        }
    }
}
