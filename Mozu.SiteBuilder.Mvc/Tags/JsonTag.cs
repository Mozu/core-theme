
using System;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    /// <summary>
    /// serializes an object to json
    /// <code>
    /// {%json foo%}
    /// </code>
    /// </summary>
    [NDjango.Interfaces.Name("json")]
    public class JsonTag : DynamicTagBase
    {
        public String Process(object model)
        {
            return model == null
                ? ("")
                : JsonConvert.SerializeObject(model, Formatting.None, new CaseInsensitiveJsonSerializerSettings());
        }
    }
}
