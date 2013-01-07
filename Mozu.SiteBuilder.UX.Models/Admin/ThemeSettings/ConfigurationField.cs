using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Linq;
using System.Xml.Serialization;
namespace Mozu.SiteBuilder.UX.Models.Admin.ThemeSettings
{
    [DataContract(Name = "configurationField")]
    public class ConfigurationField
    {
        [DataMember(Name = "id")]
        [XmlAttribute("id")]
        public string Id { get; set; }

        [DataMember(Name = "type")]
        [XmlAttribute("type")]
        public string Type { get; set; }

        [DataMember(Name = "label")]
        [XmlAttribute("label")]
        public string Label { get; set; }

        [DataMember(Name = "values")]
        [XmlArray("values")]
        public List<ConfigurationFieldValue> Values { get; set; }

        [DataMember(Name = "defaultValue")]
        [XmlAttribute("defaultValue")]
        public string DefaultValue { get; set; }

        [DataMember(Name = "isHidden")]
        [XmlAttribute("isHidden")]
        public bool IsHidden { get; set; }

        [DataMember(Name = "usage")]
        [XmlAttribute("usage")]
        public string Usage { get; set; }
    }
    public class RuntimeConfigurationField : ConfigurationField
    {

        public string Value { get; set; }
        public string GetValueOrDefault()
        {
            return Value ?? this.DefaultValue;
        }
    }
    public class RuntimeConfigurationFieldCollection
    {
        public Dictionary<string, RuntimeConfigurationField> Dictionary { get; set; }
        public object  this[string id]
        {
            get
            {
                RuntimeConfigurationField val;
                if (Dictionary.TryGetValue(id, out val))
                {
                    return val.Value ?? val.DefaultValue;
                }
                return null;
            }
        }


    }
    //public class RuntimeConfigurationFieldCollectionItem
    //{

    //    public string Id { get; set; }
    //    public List<RuntimeConfigurationField> Fields { get; set; }
    //    public object  this[string id]
    //    {
    //        get { 
    //            var field = this.Fields.FirstOrDefault(x => string.Equals(x.Id, id, StringComparison.OrdinalIgnoreCase));
    //            if (field != null)
    //            {
    //                return field.GetValueOrDefault();
    //            }
    //            return null;
    //        }
    //    }
    //}
}