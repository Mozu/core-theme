using System;
using System.IO;
using System.Linq;

using Autofac;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using System.Collections.Generic;

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
    [NDjango.Interfaces.Name("include")]
    public class IncludeTag : SimpleTagBase
    {
      

        protected override void ProcessTag(ArgumentCollection arguments, ref NDjango.Interfaces.IContext context, out string buffer, out string templateName)
        {
            templateName =(string) arguments[0].Value;
            List<Tuple <string, object>> additionalState = new List<Tuple<string, object>>();
            if (arguments.Count > 1)
            {
                if (arguments[1].ArgumentType == TagArgument.ArgumentTypes.ValueArgument)
                {
                    additionalState.Add(new Tuple<string, object>("model", arguments[0].Value));
                    
                }

            }
            for (int i = 0; i < arguments.Count; i++)
            {
                if (arguments[i].ArgumentType == TagArgument.ArgumentTypes.NamedArgument)
                {
                    additionalState.Add(new Tuple<string, object>(arguments[i].Name , arguments[i].Value));
                }
            }

            foreach ( var kvp in additionalState )
            {
                if( context.tryfind( kvp.Item1  ) != null )
                {
                    context = context.remove( kvp.Item1  );
                }
                context = context.add( kvp );
            }
           
            buffer = null;
        }
    }
}