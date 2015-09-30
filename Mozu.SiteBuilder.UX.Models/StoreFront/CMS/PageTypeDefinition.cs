// -----------------------------------------------------------------------
// <copyright file="PageTypeDefinition.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System.Collections.Generic;
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

        [DataMember(Name = "customEditor")]
        public string CustomEditor { get; set; }

        [DataMember (Name = "entityType")]
        public string EntityType { get; set; }

        [DataMember (Name = "documentTypeFQN")]
        public string DocumentTypeFQN { get; set; }

    

        [DataMember(Name = "userCreatable")]
        public bool? UserCreatable { get; set; }
         
        [DataMember(Name = "properties")]
        public Newtonsoft.Json.Linq.JObject  Properties { get; set; }

        [DataMember(Name = "zones")]
        public List<ZoneRuntimeData> Zones { get; set; }

        public string FullPath { get; set; }

         [DataMember(Name = "listFQN")]
        public string ListFQN { get; set; }


         [DataMember(Name = "documentListName")]
         public string DocumentListName  {
            get { return null; }
            set
            {
                if (!string.IsNullOrEmpty(value))
                {
                    this.ListFQN = value + (value.Contains("@") ? null : "@mozu");
                }
            }
        }


        [DataMember(Name = "documentType")]
        public string DocumentType
        {
            get { return null; }
            set
            {
                if (!string.IsNullOrEmpty(value))
                {
                    this.DocumentTypeFQN = value + (value.Contains("@") ? null : "@mozu");
                }
            }
        }


    }

    public class EditorDefinition
    {
        public string Id { get; set; }
        public List<string> DocumentTypes { get; set; }
        public List<string> EntityLists { get; set; }
        public List<string> DocumentLists { get; set; }
        public decimal? Priority { get; set; }
  
        public string Path { get; set; }

    }

    public class DocumentOrEntityListEditorSelector
    {

      
        public string Name { get; set; }
  
        public float Priority { get; set; }
    }
}
