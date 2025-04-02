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

            RecursionTest(context, templateName, additionalState);

            var nodes = getTemplateFunc(templateName).Nodes;

            var tags = WalkResultHelpers.RenderNodesWithContextMods(nodes, additionalState, Enumerable.Empty<string>());
            
            return tags.ToFSharpList();
            
        }

        public static void RecursionTest(IContext context, string templateName, Dictionary<string, object> additionalState)
        {
            const string includeKey = nameof(IncludeTag.RecursionTest);
            
            // Since we expect small sets (around 5 entries), optimize for this case
            HashSet<string> newIncludeTracker;
            
            // Try to get existing include tracking set - use direct check for the key for better performance
            var includeEntry = context.Items.FirstOrDefault(item => item.Item1 == includeKey);

            if (includeEntry?.Item2 is ISet<string> existingTracker)
            {
                // Fast check for recursion
                if (existingTracker.Contains(templateName))
                {
                    throw new Exception($"Infinite loop detected: template '{templateName}' is recursively included");
                }
                
                // For small sets (≤5 items), this is very efficient
                newIncludeTracker = new HashSet<string>(existingTracker, StringComparer.Ordinal);
            }
            else
            {
                // First template in the chain, create a small initial capacity
                newIncludeTracker = new HashSet<string>(5, StringComparer.Ordinal);
            }
            
            newIncludeTracker.Add(templateName);
            additionalState[includeKey] = newIncludeTracker;
        }



    }
}