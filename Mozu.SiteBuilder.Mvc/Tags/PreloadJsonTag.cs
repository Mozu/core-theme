using System;
using System.IO;
using Mozu.SiteBuilder.Mvc.ObjectPools;
using NDjango.Interfaces;
using Newtonsoft.Json;

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
    [NDjango.Interfaces.Name("preload_json")]
    public class PreloadJsonTag : SimpleTagBase
    {
        private static readonly Lazy<JsonSerializer> lazySer =
            new Lazy<JsonSerializer>(
                () =>
                    JsonSerializer.Create(new JsonSerializerSettings
                    {
                        StringEscapeHandling = StringEscapeHandling.EscapeHtml
                    }));

        protected override ProcessTagResult ProcessTag(ArgumentCollection arguments, IContext context)
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
                return new ProcessTagResult(context){Buffer = sb.ToString(), Template = null};
            }
        }
    }
}
