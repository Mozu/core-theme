using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models
{
    
    public class AutoCompleteField<T>
    {
        public T Value { get; set; }

        public string Display { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? IsConfigurable { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Path { get; set; }

        
    }
}
