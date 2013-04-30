// -----------------------------------------------------------------------
// <copyright file="WidgetDefinition.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

namespace Mozu.SiteBuilder.Mvc.Models.CMS
{
    using System.Collections.Generic;
    using System.Runtime.Serialization;
    using System.Xml.Serialization;

    [DataContract(Name = "widgetDefinition")]
    public class WidgetDefinition
    {
        [DataMember ( Name="id")]
        [XmlAttribute("id")]
        public string Id { get; set; }

        [DataMember(Name = "displayName")]
        [XmlAttribute("displayName")]
        public string DisplayName { get; set; }

        [DataMember(Name = "icon")]
        [XmlAttribute("displayName")]
        public string Icon { get; set; }

        [DataMember(Name = "minWidth")]
        public int? MinWidth { get; set; }

        [DataMember(Name = "previewHtml")]
        public string PreviewHtml { get; set; }

        [DataMember(Name = "editView")]
        [XmlAttribute("editView")]
        public string EditView { get; set; }

        [DataMember(Name = "editViewConfig")]
        [XmlAttribute("editViewConfig")]
        public string  EditViewConfig { get; set; }


        [DataMember(Name = "displayTemplate")]
        [XmlAttribute("displayTemplate")]
        public string DisplayTemplate { get; set; }

        [DataMember(Name = "createView")]
        [XmlAttribute("createView")]
        public string CreateView { get; set; }

        [DataMember(Name = "properties")]
        [XmlArray("properties")]
        [XmlArrayItem("property")]
        public List<WidgetDefintionProperty> Properties { get; set; }

        [DataMember(Name = "enabled")]
        [XmlAttribute("enabled")]
        public bool? Enabled { get; set; }

        private string _category;

        [DataMember(Name = "category")]
        [XmlAttribute("category")]
        public string Category
        {
            get { return string.IsNullOrEmpty(_category) ? "basic" : _category; }
            set { _category = value; }
        }

    }

    [DataContract(Name = "widgetDefintionProperty")]
    public class WidgetDefintionProperty
    {
        [DataMember(Name = "key")]
        [XmlAttribute("key")]
        public string Key { get; set; }

        [DataMember(Name = "value")]
        [XmlAttribute("value")]
        public object Value { get; set; }
    }
}
