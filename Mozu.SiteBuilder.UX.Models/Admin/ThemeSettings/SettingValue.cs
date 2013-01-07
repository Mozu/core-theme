using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Admin.ThemeSettings
{
    [DataContract(Name = "settingValue")]
    public class SettingValue
    {
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name = "fieldValues")]
        public List<FieldValue> FieldValues { get; set; }
    }
}