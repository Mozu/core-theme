// -----------------------------------------------------------------------
// <copyright file="SetVarTag.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using NDjango;
using NDjango.Interfaces;
using Newtonsoft.Json;
using Newtonsoft.Json.Bson;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    /// <summary>
    ///     returns an array of previously requrired scripts.
    /// </summary>
    [ParserNodes.DescriptionAttribute("tbd")]
    [Name("all_scripts")]
    public class RenderScriptsTag : SimpleTagBase
    {
        protected override void ProcessTag(ArgumentCollection arguments, ref NDjango.Interfaces.IContext context, out string buffer, out string templateName)
        {
            buffer = templateName = null;



            var scriptsArray = (HashSet<string>)context.HttpContext().Items["scripts"];
            if (scriptsArray == null)
                return;


            string model = string.Join(",", scriptsArray.Select(x => "'" + x + "'"));
            //buffer= context.Render("debugscripts", model);
            buffer = model;
        }

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
    }
}