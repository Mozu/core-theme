using System;
using System.Linq;
using NDjango.Interfaces;
using System.Collections.Generic;
using NDjango.FiltersCS.Compatibility;

namespace Mozu.SiteBuilder.Mvc.Tags
{
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

        protected override IEnumerable<WalkResult> ProcessTag(ArgumentCollection arguments, IContext context, Func<string, ITemplate> getTemplateFunction)
        {
            var httpContext = context.HttpContext();
            var ht = (System.Collections.Hashtable)httpContext.Items["templateVariables"];

            var dict = new Dictionary<string, object>();

            foreach (var arg in arguments.Where(arg => arg.ArgumentType == TagArgument.ArgumentTypes.NamedArgument))
            {
                dict.Add(arg.Name, arg.Value);
                ht[arg.Name] = arg.Value;
            }

            return new[] { WalkResultHelpers.ContextAdditions(dict) };
        }
    }
}