
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    [NDjango.Interfaces.Name("preload_json")]
    public class PreloadJsonTag : SimpleTagBase
    {
        private static JsonSerializerSettings jsonSerializerSettings = new JsonSerializerSettings
        {
            NullValueHandling = NullValueHandling.Ignore,
            TypeNameHandling = TypeNameHandling.None,
            Formatting = Formatting.None
        };

        private static JsonSerializerSettings caseInsenstiveJsonSerializerSettings = new JsonSerializerSettings
        {
            NullValueHandling = NullValueHandling.Ignore,
            TypeNameHandling = TypeNameHandling.None,
            ContractResolver = new CamelCasePropertyNamesContractResolver(),
            Formatting = Formatting.None 
        };



        private string ScriptFormat = @"<script type=""text/json"" id=""data-mz-preload-{1}"">{0}</script>";

        protected override void ProcessTag(ArgumentCollection arguments, ref NDjango.Interfaces.IContext context, out string buffer, out string templateName)
        {
            var model = arguments[0].Value;
            var name = arguments[1].Value;
            string json = null;
            if (model != null && model.GetType().FullName.Contains("SiteBuilder"))
            {
                json = JsonConvert.SerializeObject(model, Formatting.None, caseInsenstiveJsonSerializerSettings);
            }
            else
            {
                json = JsonConvert.SerializeObject(model, Formatting.None, jsonSerializerSettings);
            }

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
