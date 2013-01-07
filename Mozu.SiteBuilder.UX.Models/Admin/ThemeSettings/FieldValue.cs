using System.Runtime.Serialization;
using System.Xml.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Admin.ThemeSettings
{
    [DataContract]
    public class FieldValue
    {
        [XmlAttribute("id")]
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [XmlAttribute("value")]
        [DataMember(Name = "value")]
        public string Value { get; set; }
    }
}