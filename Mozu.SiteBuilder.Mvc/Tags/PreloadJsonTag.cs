
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    [NDjango.Interfaces.Name("preload_json")]
    public class PreloadJsonTag : SimpleTagBase
    {
        private readonly JsonSerializerSettings _jsonSerializerSettings = new JsonSerializerSettings
        {
            NullValueHandling = NullValueHandling.Ignore,
            TypeNameHandling = TypeNameHandling.None,
        };

        private string ScriptFormat = @"<script type=""text/json"" id=""data-mz-preload-{1}"">{0}</script>";

        protected override void ProcessTag(ArgumentCollection arguments, ref NDjango.Interfaces.IContext context, out string buffer, out string templateName)
        {
            var model = arguments[0].Value;
            var name = arguments[1].Value;
            var json = JsonConvert.SerializeObject(model, Formatting.None, _jsonSerializerSettings);
            buffer = string.Format(ScriptFormat, json, name);
            templateName = null;
        }
    }
}
