using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;
using Mozu.SiteBuilder.Mvc.Models.CMS;

namespace Mozu.SiteBuilder.Mvc.Themes
{
    /// <summary>
    /// Deserialization target for theme.json.
    /// </summary>
    [DataContract]
    internal class ThemeConfiguration
    {
        [DataMember(Name="about")]
        public ThemeAbout About { get; set; }

        [DataMember(Name="settings")]
        public List<ThemeSetting> Settings { get; set; }

        [DataMember(Name = "pageTypes")]
        public List<PageTypeDefinition> PageTypes { get; set; }

        [DataMember(Name = "emailTemplates")]
        public List<PageTypeDefinition> EmailTemplates { get; set; }

        [DataMember(Name = "orderTemplates")]
        public List<PageTypeDefinition> OrderTemplates { get; set; }
        

        [DataMember(Name = "widgets")]
        public List<WidgetDefinition> Widgets { get; set; }

            [DataMember(Name = "editors")]
        public List<EditorDefinition> Editors { get; set; }

        [DataContract]
        public class ThemeAbout
        {
            [DataMember(Name = "name")]
            public string Name { get; set; }

            [DataMember(Name = "author")]
            public string Author { get; set; }

            [DataMember(Name = "extends")]
            public string Extends { get; set; }

            [DataMember(Name = "isDesktop")]
            public bool IsDesktop { get; set; }

            [DataMember(Name = "isMobile")]
            public bool IsMobile { get; set; }
            
            [DataMember(Name = "isTablet")]
            public bool IsTablet { get; set; }


            [DataMember(Name = "defaultLanguage")]
            public string DefaultLanguage { get; set; }

            [DataMember(Name = "allowProduction")]
            public bool? AllowProduction  { get; set; }
        }
    }
}
