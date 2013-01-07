using System;
using System.Xml.Serialization;

namespace Mozu.SiteBuilder.Mvc.Theme
{
    [XmlRoot("theme")]
    public class ThemeInformationMetadata
    {
        [XmlElement("name")]
        public string Name { get; set; }

        [XmlElement("author")]
        public string Author { get; set; }

        [XmlElement("extends")]
        public string Extends { get; set; }

        [XmlElement("isDesktop")]
        public bool IsDesktop { get; set; }

        [XmlElement("isMobile")]
        public bool IsMobile { get; set; }
    }
}
