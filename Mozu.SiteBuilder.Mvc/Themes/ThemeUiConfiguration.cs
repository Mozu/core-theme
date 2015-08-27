using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace Mozu.SiteBuilder.Mvc.Themes
{
    /// <summary>
    /// Deserialization target for theme.json.
    /// </summary>
    [DataContract]
    public class ThemeUiConfiguration
    {
        [DataMember(Name="groups")]
        public List<GroupDefinition> Groups { get; set; }

        [DataMember(Name="settings")]
        public Dictionary<string, SettingUi> Settings { get; set; }


        [DataContract]
        public class GroupDefinition
        {
            [DataMember(Name = "id")]
            public string Id { get; set; }

            [DataMember(Name = "title")]
            public string Title { get; set; }
        }


        [DataContract]
        public class SettingUi
        {
            [DataMember(Name = "title")]
            public string Title { get; set; }

            [DataMember(Name = "group")]
            public string Group { get; set; }

            [DataMember(Name = "type")]
            public string Type { get; set; }

            [DataMember(Name = "options")]
            public List<object> Options { get; set; }
        }

    }
}
