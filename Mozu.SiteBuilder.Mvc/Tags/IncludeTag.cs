using System;
using System.Linq;
using System.Collections.Generic;
using NDjango.Interfaces;
using NDjango.FiltersCS.Compatibility;

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
        protected override IEnumerable<WalkResult> ProcessTag(ArgumentCollection arguments, IContext context, Func<string, ITemplate> getTemplateFunc)
        {
            var templateName = (string)arguments[0].Value;
            var additionalState = new Dictionary<string, object>();
            if (arguments.Count > 1)
            {
                if (arguments[1].ArgumentType == TagArgument.ArgumentTypes.ValueArgument)
                {
                    additionalState.Add("model", templateName);
                }
            }

            foreach (var item in arguments.Where(x => x.ArgumentType == TagArgument.ArgumentTypes.NamedArgument)) {
                additionalState.Add(item.Name, item.Value);
            }

            var nodes = getTemplateFunc(templateName).Nodes;

            return new [] { WalkResultHelpers.ContextAdditions(additionalState), WalkResultHelpers.Nodes(nodes) };
        }
    }
}