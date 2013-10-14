// -----------------------------------------------------------------------
// <copyright file="PageTypeDefinition.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System.Runtime.Serialization;
using Mozu.SiteBuilder.Mvc.Models.CMS.Admin;

namespace Mozu.SiteBuilder.Mvc.Models.CMS
{
    [DataContract(Name = "pageType")]
    public class PageTypeDefinition
    {
        [DataMember (Name = "id")]
        public string Id { get; set; }

        [DataMember (Name = "title")]
        public string Title { get; set; }

        [DataMember (Name = "template")]
        public string Template { get; set; }

        [DataMember (Name = "entityType")]
        public string EntityType { get; set; }

        [DataMember (Name = "documentType")]
        public string DocumentType { get; set; }

        [DataMember(Name = "userCreatable")]
        public bool? UserCreatable { get; set; }
         
        [DataMember(Name = "properties")]
        public Newtonsoft.Json.Linq.JObject  Properties { get; set; }

        [DataMember(Name = "widgets")]
        public WidgetInstanceData[] Widgets { get; set; }

        public string FullPath { get; set; }
    }

}
