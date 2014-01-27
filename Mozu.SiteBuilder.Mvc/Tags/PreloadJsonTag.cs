
using System.IO;
using System.Text;
using Mozu.SiteBuilder.Mvc.ObjectPools;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

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
        protected override void ProcessTag(ArgumentCollection arguments, ref NDjango.Interfaces.IContext context, out string buffer, out string templateName)
        {
            var model = arguments[0].Value;
            var name = arguments[1].Value;
            using (var container = StringBuilderPool.Default.GetContainer())
            {
                var sb = container.Item;


              
                sb.Append(@"<script type=""text/json"" id=""data-mz-preload-");
                sb.Append(name);
                sb.Append(@""">");

                var serSettings = new CaseInsensitiveJsonSerializerSettings();
                serSettings.StringEscapeHandling = StringEscapeHandling.EscapeHtml;
                var ser = Newtonsoft.Json.JsonSerializer.Create(serSettings);
                var writer = new JsonTextWriter(new StringWriter(sb));
               
                ser.Serialize(writer, model );
                writer.Flush();;
                sb.Append("</script>");
                buffer = sb.ToString();
                templateName = null;
            }
            
        }
    }
}
