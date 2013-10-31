using System;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Mozu.SiteBuilder.Mvc
{
    public class CaseInsensitiveJsonSerializerSettings : JsonSerializerSettings
    {
        public CaseInsensitiveJsonSerializerSettings()
        {
            NullValueHandling = NullValueHandling.Ignore;
            TypeNameHandling = TypeNameHandling.None;
            ContractResolver = new CamelCasePropertyNamesContractResolver();
            Formatting = Formatting.None;
        }
    }
}
