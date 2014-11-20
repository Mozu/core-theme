// -----------------------------------------------------------------------
// <copyright file="SetVarTag.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using NDjango.Interfaces;
using System;
using System.Collections.Generic;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    /// <summary>
    /// adds a script to be requested by require.js 
    /// example
    /// {% require_script "modules/login-links" %}
    /// </summary>
    /// 
    [NDjango.ParserNodes.Description("tbd")]
    [Name("require_script")]
    public class IncludeScriptTag : SimpleTagBase
    {
        protected override ProcessTagResult ProcessTag(ArgumentCollection arguments, IContext context)
        {
            if (arguments.Count != 1) throw new InvalidOperationException("includescript takes only 1 arg");

            var scripts = (HashSet<string>) context.HttpContext().Items["scripts"] ??
                          new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            scripts.Add(arguments[0].Value.ToString());

            return new ProcessTagResult(context){Buffer = null, Template = null};
        }
    }
}
