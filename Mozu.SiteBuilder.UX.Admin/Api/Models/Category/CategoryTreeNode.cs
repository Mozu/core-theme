using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Category
{
    [DataContract]
    public class CategoryTreeNode
    {
        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "parentId")]
        public int ParentId { get; set; }

        [DataMember(Name = "index")]
        public int Index { get; set; }

        [DataMember(Name = "items")]
        public List<CategoryTreeNode> Items { get; set; }

        [DataMember(Name = "isHidden")]
        public bool IsHidden { get; set; }

        [DataMember(Name = "productCount")]
        public int ProductCount { get; set; }

        [DataMember(Name = "leaf")]
        public bool leaf { get; set; }


     
        
    }
}