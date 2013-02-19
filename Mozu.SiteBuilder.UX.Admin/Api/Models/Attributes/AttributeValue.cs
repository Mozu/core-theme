using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes
{
    [DataContract]
    public class AttributeValue
    {
        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "attributeId")]
        public int AttributeId { get; set; }

        [DataMember(Name = "value")]
        public object Value { get; set; }
    }
}