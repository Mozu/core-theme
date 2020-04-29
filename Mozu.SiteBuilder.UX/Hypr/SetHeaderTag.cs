using Mozu.SiteBuilder.Mvc.Tags;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using NDjango.Interfaces;
using System.Threading.Tasks;
using System.Net.Http;
using NDjango.FiltersCS.Compatibility;
using Microsoft.Extensions.Primitives;

namespace Mozu.SiteBuilder.UX.Hypr
{
    [NDjango.ParserNodes.Description("tbd")]
    [NDjango.Interfaces.Name("set_header")]
    public class SetHeaderTag : SimpleTagBaseAsync
    {
        protected override Task<IEnumerable<WalkResult>> ProcessTagAsync(ArgumentCollection arguments, IContext context, Func<string, ITemplate> getTemplateFunction)
        {
           
            var name = string.Empty;
            var value = string.Empty;
            var replace = true;
            if (arguments.Count == 0)
            {
                throw new RenderingError($"missing  arguemnt in set_header tag", Microsoft.FSharp.Core.FSharpOption<Exception>.None);
            }

            if (arguments[0].ArgumentType == TagArgument.ArgumentTypes.ValueArgument)
            {
                var parts = arguments[0].Value?.ToString().Split(':');
                if (parts.Length != 2)
                {
                    throw new RenderingError($"invalid arguemnt {arguments[0].Value} in set_header tag", Microsoft.FSharp.Core.FSharpOption<Exception>.None);
                }
                name = parts[0];
                value = parts[1];
            }

            var tmp = string.Empty;
            if (arguments.TryGetValue<string>("name", out tmp))
            {
                name = tmp;
            }
            if (arguments.TryGetValue<string>("value", out tmp))
            {
                value = tmp;
            }
            var tmpB = false;
            if (arguments.TryGetValue<bool>("replace", out tmpB))
            {
                replace = tmpB;
            }
            if( string.IsNullOrEmpty(name))
            {
                throw new RenderingError($"missing paramater 'value' in set_header tag", Microsoft.FSharp.Core.FSharpOption<Exception>.None);
            }
            var response = context.HttpContext().Response;

            if (replace)
            {
                response.Headers.Remove(name);
            }

            var newValue = (StringValues)value;
            if (response.Headers.ContainsKey(name))
            {
                newValue = StringValues.Concat(response.Headers[name], value);
                response.Headers.Remove(name);
               
            }
            response.Headers.Add(name, newValue);
          
            

            return Task.FromResult(Enumerable.Empty<WalkResult>());
        }
    }
}