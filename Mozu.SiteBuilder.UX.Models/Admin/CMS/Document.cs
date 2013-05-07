using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.Mvc.Models.CMS.Admin
{
    [DataContract]
    public class Document
    {
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name = "documentType")]
        public string DocumentType { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "documentId")]
        public string DocumentId { get; set; }

        [DataMember(Name = "collectionName")]
        public string DocumentListName { get; set; }

        [DataMember(Name = "publishState")]
        public string PublishState { get; set; }

     

        [DataMember(Name = "folderId")]
        public string FolderId { get; set; }

        [DataMember(Name = "items")]
        public List<DocumentProperty> Items { get; set; }
    }
}