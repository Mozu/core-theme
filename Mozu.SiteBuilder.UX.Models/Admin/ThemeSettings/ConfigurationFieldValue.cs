using System.Runtime.Serialization;
using System.Xml.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Admin.ThemeSettings
{
    [DataContract(Name = "configurationFieldValue")]
    public class ConfigurationFieldValue
    {
        [DataMember(Name = "display")]
        [XmlText ()]
        public string Display { get; set; }

        [DataMember(Name = "value")]
        [XmlAttribute("value")]
        public string Value { get; set; }
    }
}   