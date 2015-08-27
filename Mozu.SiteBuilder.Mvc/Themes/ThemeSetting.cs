using System;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.Mvc.Themes
{
    [DataContract]
    public class ThemeSetting
    {
        [DataMember(Name = "id")]
        public string Id { get;  set; }

        [DataMember(Name = "defaultValue")]
        public object DefaultValue { get; set; }

        /// <summary>
        /// File that declared this setting.
        /// </summary>
        public string DeclaredInFile { get; set; }
    }
}
