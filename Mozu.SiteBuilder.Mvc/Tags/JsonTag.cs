using System.Web.Mvc;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    [NDjango.Interfaces.Name("json")]
    public class JsonTag : DynamicTagBase
    {
        private readonly JsonSerializerSettings _jsonSerializerSettings = new JsonSerializerSettings
        {
            NullValueHandling = NullValueHandling.Ignore,
            TypeNameHandling = TypeNameHandling.None,
        };

        public MvcHtmlString Process(object model)
        {
            if (model == null)
                return MvcHtmlString.Create("");

            var json = JsonConvert.SerializeObject(model, Formatting.None, _jsonSerializerSettings);
            return MvcHtmlString.Create(json);
        }
    }
}
