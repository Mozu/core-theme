using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Product
{
    
    public enum AttributeValueType
    {
        [JsonProperty(PropertyName = "undefined")]
        Unknown,

        [JsonProperty(PropertyName = "admin")]
        AdminEntered,

        [JsonProperty(PropertyName = "shopper")]
        ShopperEntered,

        [JsonProperty(PropertyName = "predefined")]
        Predefined,
    }
}