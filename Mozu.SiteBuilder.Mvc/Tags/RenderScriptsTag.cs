// -----------------------------------------------------------------------
// <copyright file="SetVarTag.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using NDjango;
using NDjango.Interfaces;
using Newtonsoft.Json;
using System;
using NDjango.FiltersCS.Compatibility;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    /// <summary>
    ///     returns an array of previously requrired scripts.
    /// </summary>
    [ParserNodes.DescriptionAttribute("tbd")]
    [Name("all_scripts")]
    public class RenderScriptsTag : SimpleTagBase
    {
        public static void RenderRequiresForWidgetPreview(TextWriter tw, HttpContextBase httpContext)
        {
            var scriptsArray = (HashSet<string>)httpContext.Items["scripts"];
            if (scriptsArray == null || scriptsArray.Count == 0)
                return;
            tw.WriteLine("<script type=\"text/javascript\">");
            tw.Write(" require(");
            var ser = new JsonSerializer()
            {
                Formatting = Formatting.None
            };

            ser.Serialize(tw, scriptsArray);

            tw.WriteLine(");");
            tw.WriteLine("</script>");
        }

        protected override IEnumerable<WalkResult> ProcessTag(ArgumentCollection arguments, IContext context, Func<string, ITemplate> getTemplateFunction)
        {
            
            var scriptsArray = (HashSet<string>)context.HttpContext().Items["scripts"];
            if (scriptsArray == null) return Enumerable.Empty<WalkResult>();

            var model = string.Join(",", scriptsArray.Select(x => "'" + x + "'"));
            return new[] { WalkResultHelpers.Buffer(model) };
        }
    }
}