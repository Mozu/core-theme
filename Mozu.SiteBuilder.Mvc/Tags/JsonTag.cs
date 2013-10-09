
using System;
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

        public String Process(object model)
        {
            if (model == null)
                return ("");

            var json = JsonConvert.SerializeObject(model, Formatting.None, _jsonSerializerSettings);
            return (json);
        }
    }
}
