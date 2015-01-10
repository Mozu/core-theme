using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Extensible
{
    
    public enum AttributeValueType
    {
        [JsonProperty(PropertyName = "undefined")]
        Unknown,

        [JsonProperty(PropertyName = "adminEntered")]
        AdminEntered,

        [JsonProperty(PropertyName = "shopperEntered")]
        ShopperEntered,

        [JsonProperty(PropertyName = "adminOrShopperEntered")]
        AdminOrShopperEntered,
    }
}