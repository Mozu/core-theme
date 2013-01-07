using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Xml.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Admin.ThemeSettings
{
    public static class Constants
    {
        public const string Clear = "clear";
        public const string Append = "append";
        public const string Prepend = "prepend";

        public const string Section = "section";
        public const string Group = "group";
        public const string Field = "field";
        public const string Preset = "preset";

        public const string Select = "select";
        public const string Textbox = "textbox";
    }

    [XmlRoot("settings" )]
    public class ConfigurationItemCollection
    {
        [XmlArray(ElementName = "items")]
        [XmlArrayItem("item", typeof(ConfigurationItem))]
        [XmlArrayItem("group", typeof(ConfigurationItemGroup))]
        [XmlArrayItem("setting", typeof(ConfigurationItemField))]
        [XmlArrayItem("preset", typeof(ConfigurationItemPreset))]
        [XmlArrayItem("section", typeof(ConfigurationItemSection))]
        [DataMember(EmitDefaultValue = false, Name = "items")]
        public List<ConfigurationItem> Items { get; set; }
    }

    [KnownType(typeof(ConfigurationFieldValue))]
    [KnownType(typeof(PresetValue))]
    [KnownType(typeof(FieldValue))]
    [DataContract]
    [KnownType( typeof(ConfigurationItem))]
    [KnownType( typeof(ConfigurationItemGroup))]
    [KnownType( typeof(ConfigurationItemField))]
    [KnownType( typeof(ConfigurationItemPreset))]
    [KnownType( typeof(ConfigurationItemSection))]
    public class ConfigurationItem
    {
        [DataMember(Name = "id")]
        [XmlAttribute("id")]
        public string Id { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "collapsed")]
        [XmlAttribute("collapsed")]
        public bool Collapsed { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "visible")]
        [XmlAttribute("visible")]
        public bool Visible { get; set; }

        [XmlAttribute("inherit")]
        [DataMember(EmitDefaultValue = false, Name = "inherit")]
        public string Inherit { get; set; }

        [XmlArray(ElementName = "items")]
        [XmlArrayItem("item", typeof(ConfigurationItem))]
        [XmlArrayItem("group", typeof(ConfigurationItemGroup))]
        [XmlArrayItem("setting", typeof(ConfigurationItemField))]
        [XmlArrayItem("preset", typeof(ConfigurationItemPreset))]
        [XmlArrayItem("section", typeof(ConfigurationItemSection))]
        [DataMember(EmitDefaultValue = false, Name = "items")]
        public List<ConfigurationItem> Items { get; set; }

        [XmlAttribute("type")]
        [DataMember(EmitDefaultValue = false, Name = "mode")]
        public  string Mode { get; set; }

        [XmlAttribute("label")]
        [DataMember(EmitDefaultValue = false, Name = "text")]
        public string Text { get; set; }

        [XmlArray("values")]
        [XmlArrayItem("option")]
        [DataMember(EmitDefaultValue = false, Name = "values")]
        public List<ConfigurationFieldValue> Values { get; set; }

        [XmlAttribute("defaultValue")]
        [DataMember(EmitDefaultValue = false, Name = "defaultValue")]
        public string DefaultValue { get; set; }

        [XmlArray("presetValues")]
        [XmlArrayItem("item")]
        [DataMember(EmitDefaultValue = false, Name = "presetValues")]
        public List<PresetValue> PresetValues { get; set; }

        [XmlAttribute("presetTriggerGroup")]
        [DataMember(EmitDefaultValue = false, Name = "presetTriggerGroup")]
        public string PresetTriggerGroup { get; set; }

        [XmlAttribute("itemType")]
        [DataMember(Name = "itemType")]
        public virtual string ItemType { get; set; }

        [XmlAttribute("presetTriggerText")]
        [DataMember(Name = "presetTriggerText")]
        public string PresetTriggerText { get; set; }
    }

    public class ConfigurationItemGroup : ConfigurationItem
    {
        [XmlIgnore]
        public override string ItemType
        {
            get { return "group"; }
            set
            {
                // base.ItemType = value;
            }
        }
    }

    public class ConfigurationItemField : ConfigurationItem
    {
       [XmlIgnore]
        public override string ItemType
        {
            get { return "field"; }
            set
            {
                //base.Mode = value;
            }
        }
    }
    public class ConfigurationItemPreset : ConfigurationItem
    {
       [XmlIgnore]
        public override string ItemType
        {
            get { return "preset"; }
            set
            {
                //base.Mode = value;
            }
        }
    }
    public class ConfigurationItemSection : ConfigurationItem
    {
        [XmlIgnore]
        public override string ItemType
        {
            get { return "section"; }
            set
            {
                //base.Mode = value;
            }
        }
    }

    [DataContract]
    public class PresetValue
    {
        [XmlAttribute("id")]
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [XmlAttribute("display")]
        [DataMember(Name = "display")]
        public string Display { get; set; }

        [XmlArray("values")]
        [XmlArrayItem("item")]
        [DataMember(Name = "values")]
        public List<FieldValue> Values { get; set; }
    }
}
