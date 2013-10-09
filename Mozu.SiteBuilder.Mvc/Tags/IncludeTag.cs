using System;
using System.IO;
using System.Linq;

using Autofac;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    [NDjango.ParserNodes.Description("tbd")]
    [NDjango.Interfaces.Name("include")]
    public class IncludeTag : SimpleTagBase
    {
      

        protected override void ProcessTag(ArgumentCollection arguments, ref NDjango.Interfaces.IContext context, out string buffer, out string templateName)
        {
            var model = context.Model();
            if (arguments.Count > 1)
            {
                model = arguments[1].Value;
            }
            templateName =(string) arguments[0].Value;
            if (arguments.Count > 1)
            {
                context = context.remove("Model");
                context = context.add(new Tuple<string, object>("Model", arguments[1].Value));
            }
            buffer = null;
        }
    }
}