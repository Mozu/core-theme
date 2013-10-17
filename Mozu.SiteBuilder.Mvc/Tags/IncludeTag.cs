using System;
using System.IO;
using System.Linq;

using Autofac;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using System.Collections.Generic;

namespace Mozu.SiteBuilder.Mvc.Tags
{
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