
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    [NDjango.Interfaces.Name("preload_json")]
    public class PreloadJsonTag : SimpleTagBase
    {
        protected override void ProcessTag(ArgumentCollection arguments, ref NDjango.Interfaces.IContext context, out string buffer, out string templateName)
        {
            var model = arguments[0].Value;
            var name = arguments[1].Value;
            string json = JsonConvert.SerializeObject(model, Formatting.None, new CaseInsensitiveJsonSerializerSettings());

            var sb = new StringBuilder();
            sb.Append(@"<script type=""text/json"" id=""data-mz-preload-");
            sb.Append(name);
            sb.Append( @""">");
            sb.Append(json);
            sb.Append("</script>");
            buffer = sb.ToString();
            templateName = null;
        }
    }
}
