using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes
{
    [DataContract]
    public enum AttributeValueType
    {
        [DataMember(Name = "undefined")]
        Unknown,

        [DataMember(Name = "admin")]
        Admin,

        [DataMember(Name = "shopper")]
        Shopper,

        [DataMember(Name = "predefined")]
        Predefined,
    }
}