using System;
using System.IO;
using Mozu.SiteBuilder.Mvc.ObjectPools;
using NDjango.Interfaces;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.Collections.Generic;
using NDjango.FiltersCS.Compatibility;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    /// <summary>
    /// used to serialize an object to a script tag to be used by hyprlive
    /// takes 2 indexed paramaters
    /// 1=object
    /// (the object to be serilized)
    /// 2=name
    /// (name of the script id outputted)
    /// example
    /// <code>
    /// {% preload_json model "product" %}
    /// </code>
    /// 
    /// </summary>
    [Name("preload_json")]
    public class PreloadJsonTag : SimpleTagBase
    {
        // we want to use the settings the rest of the site uses, but with additional escape handling.
        private static readonly Lazy<JsonSerializer> lazySer =
            new Lazy<JsonSerializer>(
                () =>
                {
                    var settings = new CaseInsensitiveJsonSerializerSettings
                    {
                        StringEscapeHandling = StringEscapeHandling.EscapeHtml
                    };
                    return JsonSerializer.Create(settings);
                });

        protected override IEnumerable<WalkResult> ProcessTag(ArgumentCollection arguments, IContext context, Func<string, ITemplate> getTemplateFunction)
        {
            var model = arguments[0].Value;
            var name = arguments[1].Value;
            using (var container = StringBuilderPool.Default.GetContainer())
            {
                var sb = container.Item;
                sb.AppendFormat(@"<script type=""text/json"" id=""data-mz-preload-{0}"">", name);
                using (var writer = new JsonTextWriter(new StringWriter(sb)))
                {
                    lazySer.Value.Serialize(writer, model);
                }
                sb.Append("</script>");


                return new[] { WalkResultHelpers.Buffer(sb.ToString()) };
            }
        }
    }
}
