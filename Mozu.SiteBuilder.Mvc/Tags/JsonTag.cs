
using System;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Mozu.SiteBuilder.Mvc.Tags
{
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
