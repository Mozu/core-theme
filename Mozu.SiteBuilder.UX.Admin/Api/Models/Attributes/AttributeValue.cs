using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes
{
    [DataContract]
    public class AttributeValue
    {
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name = "attributeId")]
        public string AttributeId { get; set; }

        [DataMember(Name = "value")]
        public object Value { get; set; }
    }
}