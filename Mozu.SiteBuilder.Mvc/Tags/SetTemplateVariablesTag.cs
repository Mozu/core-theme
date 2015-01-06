using System;
using System.Linq;
using NDjango.Interfaces;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    /// <summary>
    ///
    /// </summary>
    [Obsolete]
    [NDjango.ParserNodes.Description("tbd")]
    [Name("set")]
    public class SetTemplateVariablesTag : SimpleTagBase
    {
        public override bool is_header_tag
        {
            get { return true; }
            set { ; }
        }

        protected override ProcessTagResult ProcessTag(ArgumentCollection arguments, IContext context)
        {
            var httpContext = context.HttpContext();
            var ht = (System.Collections.Hashtable)httpContext.Items["templateVariables"];
            foreach (var arg in arguments.Where(arg => arg.ArgumentType == TagArgument.ArgumentTypes.NamedArgument))
            {
                context = context.add(new Tuple<string, object>(arg.Name, arg.Value));
                ht[arg.Name] = arg.Value;
            }

            return new ProcessTagResult(context) {Buffer = null, Template = null};
        }
    }
}