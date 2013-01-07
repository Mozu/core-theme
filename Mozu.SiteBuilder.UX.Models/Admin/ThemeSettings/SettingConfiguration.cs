using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Xml.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Admin.ThemeSettings
{
    [DataContract(Name = "settingConfiguration")]
    public class SettingConfiguration
    {
        [DataMember(Name = "id")]
        [XmlAttribute ("id")]
        public string Id { get; set; }

        [DataMember(Name = "name")]
        [XmlAttribute("name")]
        public string Name { get; set; }

        [DataMember(Name = "description")]
        [XmlAttribute("description")]
        public string Description { get; set; }

        [DataMember(Name = "isHidden")]
        [XmlAttribute("isHidden")]
        public bool IsHidden { get; set; }

        [DataMember(Name = "fields")]
      
        [XmlArray("fields")]
        public List<ConfigurationField> Fields { get; set; } 
    }
}