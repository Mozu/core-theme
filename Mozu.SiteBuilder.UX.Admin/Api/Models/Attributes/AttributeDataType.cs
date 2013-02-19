using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes
{
    [DataContract]
    public enum AttributeDataType
    {
        [DataMember(Name = "undefined")]
        Unknown,

        [DataMember(Name = "text")]
        Text,

        [DataMember(Name = "date")]
        Date,

        [DataMember(Name = "datetime")]
        DateTime,
    }
}