// -----------------------------------------------------------------------
// <copyright file="PageTypeDefinition.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using Mozu.SiteBuilder.Mvc.Models.CMS.Admin;

namespace Mozu.SiteBuilder.Mvc.Models.CMS
{
    using System.Collections.Generic;
    using System.Runtime.Serialization;

    ///// <summary>
    ///// TODO: Update summary.
    ///// </summary>
    //[DataContract(Name = "pageTypeDefinition")]
    //public class PageTypeDefinition
    //{
    //    [DataMember]//(Name = "id")]
    //    public string Id { get; set; }

    //    [DataMember]//(Name = "displayName")]
    //    public string DisplayName { get; set; }

    //    [DataMember]//(Name = "icon")]
    //    public string Icon { get; set; }

    //    [DataMember]//(Name = "template")]
    //    public string Template { get; set; }

    //    [DataMember]//(Name = "entityType")]
    //    public string EntityType { get; set; }

    //    [DataMember]//(Name = "widgets")]
    //    public List<Admin.Document> Widgets { get; set; }

    //    [DataMember]//(Name = "defaultValues")]
    //    public Admin.Document DefaultValues { get; set; }

    //    [DataMember]//(Name = "documentType")]
    //    public string DocumentType { get; set; }

    //    [DataMember]//(Name = "documentType")]
    //    public bool? UserCreatable  { get; set; }
    //}


    [DataContract(Name = "pageType")]
    public class PageTemplateDefinition
    {
        [DataMember (Name = "id")]
        public string Id { get; set; }

        [DataMember (Name = "displayName")]
        public string DisplayName { get; set; }

        [DataMember (Name = "renderTemplate")]
        public string Template { get; set; }

        [DataMember (Name = "entityType")]
        public string EntityType { get; set; }

        [DataMember(Name = "pageType")]
        public string PageType { get; set; }

        [DataMember (Name = "documentType")]
        public string DocumentType { get; set; }

        [DataMember(Name = "userCreatable")]
        public bool? UserCreatable { get; set; }
         
        [DataMember(Name = "properties")]
        public Newtonsoft.Json.Linq.JObject  Properties { get; set; }

        [DataMember(Name = "widgets")]
        public WidgetInstanceData[] Widgets { get; set; }
        

    }

}
