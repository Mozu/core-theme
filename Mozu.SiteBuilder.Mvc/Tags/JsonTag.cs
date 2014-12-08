
using System;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

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
            if (model == null)
                return ("");

                return JsonConvert.SerializeObject(model, Formatting.None, new CaseInsensitiveJsonSerializerSettings());
       
        }
    }
}
