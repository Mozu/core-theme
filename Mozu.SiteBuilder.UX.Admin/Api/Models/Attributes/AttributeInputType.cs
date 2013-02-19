using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes
{
    [DataContract]
    public enum AttributeInputType
    {
        [DataMember(Name = "undefined")]
        Unknown,

        [DataMember(Name = "single")]
        Single,

        [DataMember(Name = "multiple")]
        Multiple,

        [DataMember(Name = "text")]
        Text,
    }
}