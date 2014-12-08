using System;


namespace Mozu.SiteBuilder.Mvc.Tags
{
    /// <summary>
    ///
    /// </summary>
    [Obsolete]
    [NDjango.ParserNodes.Description("tbd")]
    [NDjango.Interfaces.Name("set")]
    public class SetTemplateVariablesTag : SimpleTagBase
    {
        public override bool is_header_tag
        {
            get { return true; }
            set { ; }
        }
    


        protected override void ProcessTag(ArgumentCollection arguments, ref NDjango.Interfaces.IContext context, out string buffer, out string templateName)
        {
            var httpContext = context.HttpContext();
            var ht = (System.Collections.Hashtable)httpContext.Items["templateVariables"];
            foreach (var arg in arguments)
            {
                if (arg.ArgumentType == TagArgument.ArgumentTypes.NamedArgument)
                {
                    context = context.add(new Tuple<string, object>(arg.Name, arg.Value));
                    ht[arg.Name] = arg.Value;
                }
            }
            buffer = null;
            templateName = null;
        }
    }
}