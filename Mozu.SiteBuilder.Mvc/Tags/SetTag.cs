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
    using System.Web.Mvc;
    using System.Web.Mvc.Html;
    using Mozu.SiteBuilder.Mvc;
    using System.Web.Routing;


    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    /// 
    [NDjango.ParserNodes.Description("tbd")]
    [NDjango.Interfaces.Name("set")]
    public class SetTag : SimpleTagBase
    {
        

        protected override string ProcessTag(System.Web.Mvc.HtmlHelper html, ArgumentCollection arguments, ref NDjango.Interfaces.IContext context)
        {
            object val = null;
            if (arguments[0].ArgumentType == TagArgument.ArgumentTypes.ValueArgument)
            {
                val = arguments[0].Value;
                
            }
            else
            {
                val = arguments.ToRouteValueDictionary(null, "as", null);
            }

            context = context.add(new Tuple<string, object>(arguments.Last().TokenValue, val));
            return string.Empty;
        }
    }

    [NDjango.ParserNodes.Description("tbd")]
    [NDjango.Interfaces.Name("include")]
    public class IncludeTag : SimpleTagBase
    {
        protected override string ProcessTag(HtmlHelper html, ArgumentCollection arguments, ref NDjango.Interfaces.IContext context)
        {
            return html.Partial((string) arguments.First().Value).ToString();

        }

    }

    [NDjango.ParserNodes.Description("tbd")]
    [NDjango.Interfaces.Name("setTemplateVariables")]
    public class SetTemplateVariablesTag : SimpleTagBase
    {
        public override bool is_header_tag
        {
            get { return true; }
            set { ; }
        }
        protected override string ProcessTag(HtmlHelper html, ArgumentCollection arguments, ref NDjango.Interfaces.IContext context)
        {
            var ht = (System.Collections.Hashtable )html.ViewContext.HttpContext.Items["templateVariables"];
            foreach ( var arg in arguments )
            {
                if ( arg.ArgumentType == TagArgument.ArgumentTypes.NamedArgument)
                {
                    context = context.add(new Tuple<string, object>(arg.Name, arg.Value));
                    ht[arg.Name] = arg.Value;
                }
            }
            return null;
        }

    }
}
