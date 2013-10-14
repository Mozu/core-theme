using System;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.Mvc.Themes
{
    [DataContract]
    public class ThemeSetting
    {
        [DataMember(Name = "id")]
        public string Id { get; private set; }

        [DataMember(Name = "defaultValue")]
        public object DefaultValue { get; private set; }

        /// <summary>
        /// Id of the theme that declared this setting.
        /// </summary>
        public string DeclaredBy { get; private set; }
    }
}
