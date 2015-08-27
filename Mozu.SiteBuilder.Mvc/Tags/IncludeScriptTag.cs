// -----------------------------------------------------------------------
// <copyright file="SetVarTag.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using NDjango.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;

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
        protected override IEnumerable<WalkResult> ProcessTag(ArgumentCollection arguments, IContext context, Func<string, ITemplate> getTemplateFunction)
        {
            if (arguments.Count != 1) throw new InvalidOperationException("includescript takes only 1 arg");
            
            var scripts = (HashSet<string>)context.HttpContext().Items["scripts"];
            if (scripts == null)
            {
                context.HttpContext().Items["scripts"] = scripts = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            }
            scripts.Add(arguments[0].Value.ToString());

            return Enumerable.Empty<WalkResult>();
        }
    }
}
