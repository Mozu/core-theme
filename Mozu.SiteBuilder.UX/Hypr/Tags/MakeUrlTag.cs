using System;
using System.Linq;
using Mozu.SiteBuilder.Mvc.Tags;
using System.Collections.Generic;
using NDjango.Interfaces;
using NDjango.FiltersCS.Compatibility;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.Mvc.Helpers;
using Mozu.Core;

namespace Mozu.SiteBuilder.UX.Hypr.Tags
{
    /// <summary>
    ///Creates a url for a specific object and resource type
    ///   <img src="{% make_url "image" image with max=500 as_parameter />
    ///   <a href="{% make_url "facet" facet %}">{{ facet.name }}</a>
    /// </summary>
    [NDjango.ParserNodes.Description("tbd")]
    [Name("make_url")]
    public class MakeUrlTag : SimpleTagBase
    {
        static JsonCleaningCaseInsensitiveMemberResolver _resolver = new JsonCleaningCaseInsensitiveMemberResolver();
        protected override IEnumerable<WalkResult> ProcessTag(ArgumentCollection arguments, IContext context, Func<string, ITemplate> getTemplateFunction)
        {
            var type = (arguments[0].Value as string ?? "").ToLowerInvariant();
            var obj = arguments.Count > 1 ? arguments[1].Value : null;
            var includeContext = arguments.GetValueOrDefault("includeContext", false);
               
            var props = arguments.Where(x => x.ArgumentType == TagArgument.ArgumentTypes.NamedArgument).ToDictionary(x => x.Name, y => y.Value, StringComparer.OrdinalIgnoreCase);

            var urlHelper = context.Resolve<UrlHelper>();

            UrlHelper.UrlType urlType;
            if (FastEnum<UrlHelper.UrlType>.TryParse(type, out urlType))
            {
                var url = urlHelper.MakeUrl(urlType, obj, props, includeContext);
                return new[] { WalkResultHelpers.Buffer(url) };
            }
            else
            {
                throw new RenderingError(string.Format("unknown urltag type: {0}. Tags must be one of [{1}]", type, string.Join(",", Enum.GetNames(typeof(UrlHelper.UrlType)).Select(x => x.ToLowerInvariant()))), Microsoft.FSharp.Core.FSharpOption<Exception>.None);
            }
        }
    }
}
       
      

        
        
    


   
