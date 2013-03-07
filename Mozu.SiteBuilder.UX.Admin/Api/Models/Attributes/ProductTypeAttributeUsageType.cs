using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes
{
    [DataContract]
    public enum AttributeValueType
    {
        [DataMember(Name = "undefined")]
        Unknown,

        [DataMember(Name = "admin")]
        AdminEntered,

        [DataMember(Name = "shopper")]
        ShopperEntered,

        [DataMember(Name = "predefined")]
        Predefined,
    }
}