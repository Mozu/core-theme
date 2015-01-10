using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Extensible
{
    
    public class AttributeVocabularyValue
    {
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "sequence")]
        public int? ValueSequence { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public object Value { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public AttributeVocabularyValueLocalizedContent Content { get; set; }
    }

    
    public class AttributeVocabularyValueLocalizedContent
    {
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "localCode")]
        public string LocaleCode { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string StringValue { get; set; }
    }
}
