using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Linq;

namespace Mozu.SiteBuilder.UX.Models.Navigation
{
    /// <summary>
    /// Represents a node in the navigation hierarchy 
    /// </summary>
    [DataContract, Obsolete]
    public class NavigationRuntimeNode : ModelBase, IRuntimeNavigationNode
    {

        /// <summary>
        /// Public constructor.
        /// </summary>
        public NavigationRuntimeNode()
        {
            Items = new List<IRuntimeNavigationNode>();
        }

        public string Id { get; set; }

        private string _parentId;
        public string ParentId
        {
            get
            {
                if (Parent == null)
                    return _parentId;
                else
                    return Parent.Id;
            }
            set
            {
                _parentId = value;
            }
        }

        public int CategoryId
        {
            get
            {
                if (this.NodeType == NavigationNodeType.Category)
                {
                    return int.Parse(this.OriginalId);
                }
                return -1;
            }
        }
        [DataMember(Name = "isHidden")]
        public bool? IsHidden { get; set; }


        [DataMember(Name = "originalId")]
        public string OriginalId { get; set; }

        [Obsolete]
        [DataMember(Name = "originalCollection")]
        public string OriginalCollection
        {
            get { return this.OriginalDocumentListName; }
            set { this.OriginalDocumentListName = value; }
        }


        [DataMember(Name = "originalDocumentListName")]
        public string OriginalDocumentListName { get; set; }


        [DataMember (Name="url")]
        public string Url { get; set; }

      
        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "index")]
        public int Index { get; set; }

        [DataMember(Name = "count")]
        public int Count { get ; set; }
        
      
        [DataMember(Name = "items")]
        public ICollection<IRuntimeNavigationNode> Items { get; set; }

        public IRuntimeNavigationNode Parent { get; set; }

        public NavigationNodeType NodeType { get; set; }

        // plain string for easy serialization.
        [Obsolete]
        [DataMember(Name = "nodeType")]
        public string NodeTypeString { get { return NodeType; } set { NodeType = value; } }

        /// <summary>
        /// Whether or not this node is the home page.
        /// </summary>
        public bool IsHomePage { get; set; }
    }
}
