
using System;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    [NDjango.Interfaces.Name("json")]
    public class JsonTag : DynamicTagBase
    {
        private static  JsonSerializerSettings jsonSerializerSettings = new JsonSerializerSettings
        {
            NullValueHandling = NullValueHandling.Ignore,
            TypeNameHandling = TypeNameHandling.None,
        };

        private static JsonSerializerSettings caseInsenstiveJsonSerializerSettings = new JsonSerializerSettings
        {
            NullValueHandling = NullValueHandling.Ignore,
            TypeNameHandling = TypeNameHandling.None,
            ContractResolver = new CamelCasePropertyNamesContractResolver()
        };

        public String Process(object model)
        {
            if (model == null)
                return ("");

            if (model.GetType().FullName.Contains("SiteBuilder"))
            {
                return JsonConvert.SerializeObject(model, Formatting.None, caseInsenstiveJsonSerializerSettings);
            }
            else
            {
                return JsonConvert.SerializeObject(model, Formatting.None, jsonSerializerSettings);
                
            }
           
        }
    }
}
