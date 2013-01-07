using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Navigation
{
    [DataContract]
    public class NavigationNode
    {
        public NavigationNode()
        {
            ChildNodes = new List<NavigationNode>();
        }

        [DataMember(Name = "id", EmitDefaultValue = false)]
        public string Id { get; set; }

        [DataMember(Name = "parentId", EmitDefaultValue = false)]
        public string ParentId { get; set; }

        [DataMember(Name = "label", EmitDefaultValue = false)]
        public string Label { get; set; }

        [DataMember(Name = "index", EmitDefaultValue = false)]
        public int Index { get; set; }

        [DataMember(Name = "childNodes", EmitDefaultValue = false)]
        public List<NavigationNode> ChildNodes { get; set; }
    }
}