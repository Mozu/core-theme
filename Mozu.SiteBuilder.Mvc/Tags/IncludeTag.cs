using System;
using System.Linq;
using System.Collections.Generic;
using NDjango.Interfaces;

namespace Mozu.SiteBuilder.Mvc.Tags
{
   
    /// <summary>
    /// Loads a template and renders it with the current context. This is a way of &quot;including&quot; other templates within a template.
    ///
    /// The template name can either be a variable or a hard-coded (quoted) string, in either single or double quotes.
    ///
    /// This example includes the contents of the template &quot;foo/bar.html&quot;:
    ///
    /// <code>
    /// {% include &quot;foo/bar.html&quot; %}
    /// </code>
    /// This example includes the contents of the template whose name is contained in the variable template_name:
    ///
    /// {% include template_name %}
    /// An included template is rendered with the context of the template that&quot;s including it. This example produces the output &quot;Hello, John&quot;:
    ///
    /// Context: variable person is set to &quot;john&quot;.
    ///
    /// Template:
    ///
    /// <code>
    /// {% include &quot;name_snippet.html&quot; %}
    /// </code>
    /// The name_snippet.html template:
    ///
    /// </summary>
    [NDjango.ParserNodes.Description("tbd")]
    [Name("include")]
    public class IncludeTag : SimpleTagBase
    {
        protected override ProcessTagResult ProcessTag(ArgumentCollection arguments, IContext context)
        {
            var templateName = (string)arguments[0].Value;
            var additionalState = new List<Tuple<string, object>>();
            if (arguments.Count > 1)
            {
                if (arguments[1].ArgumentType == TagArgument.ArgumentTypes.ValueArgument)
                {
                    additionalState.Add(new Tuple<string, object>("model", templateName));
                }
            }

            additionalState.AddRange(
                arguments
                .Where(x => x.ArgumentType == TagArgument.ArgumentTypes.NamedArgument)
                .Select(a => new Tuple<string, object>(a.Name, a.Value)));

            foreach (var kvp in additionalState)
            {
                if (context.tryfind(kvp.Item1) != null)
                {
                    context = context.remove(kvp.Item1);
                }
                context = context.add(kvp);
            }

            return new ProcessTagResult(context){Buffer = null, Template = templateName};
        }
    }
}