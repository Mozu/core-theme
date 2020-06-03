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

    [DataContract(Name = "layoutWidgetDefinition")]
    public class LayoutWidgetDefinition
    {
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name = "displayName")]
        public string DisplayName { get; set; }

        [DataMember(Name = "icon")]
        public string Icon { get; set; }

        [DataMember(Name = "previewHtml")]
        public string PreviewHtml { get; set; }

        [DataMember(Name = "editView")]
        public string EditView { get; set; }

        [DataMember(Name = "customEditor")]
        public string CustomEditor { get; set; }

        [DataMember(Name = "editViewConfig")]
        public string EditViewConfig { get; set; }

        [DataMember(Name = "editViewFields")]
        public Newtonsoft.Json.Linq.JArray EditViewFields { get; set; }

        [DataMember(Name = "displayTemplate")]
        public string DisplayTemplate { get; set; }

        [DataMember(Name = "columns")]
        public  Newtonsoft.Json.Linq.JArray Columns { get; set; }

        [DataMember(Name = "enabled")]
        public bool? Enabled { get; set; }

        private string _category;

        [DataMember(Name = "category")]
        public string Category
        {
            get { return string.IsNullOrEmpty(_category) ? "basic" : _category; }
            set { _category = value; }
        }

        [DataMember(Name = "defaultConfig")]
        public Newtonsoft.Json.Linq.JObject DefaultConfig { get; set; }

        [DataMember(Name = "validPageTypes")]
        public List<string> ValidPageTypes { get; set; }
        [System.Text.Json.Serialization.JsonIgnore]
        public string FullPath { get; set; }

    }
}
