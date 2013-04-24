using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Navigation
{
    /// <summary>
    /// Represents a node in the navigation hierarchy 
    /// </summary>
    [DataContract]
    public class NavigationTreeNode
    {
        [OnDeserializing ]
        void OnDeserializing(StreamingContext context)
        {
            Init();
        }
        public NavigationTreeNode()
        {
            Init();
        }
        void Init()
        {
            this.AllowDrag = true;
            this.Expandable = true;
            this.AllowDrop = true;
        }

        [DataMember(Name = "id", EmitDefaultValue = false)]
        public string Id { get; set; }

        [DataMember(Name = "originalId", EmitDefaultValue = false)]
        public string OriginalId { get; set; }

        [DataMember(Name = "originalCollection", EmitDefaultValue = false)]
        public string OriginalCollection { get; set; }

        [DataMember(Name = "parentId")]
        public string ParentId { get; set; }

        [DataMember(Name = "index")]
        public int? Index { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        public NavigationNodeType NodeType { get; set; }

        // plain string for easy serialization.
        [Obsolete]
        [DataMember(Name = "nodeType")]
        public string NodeTypeString { get { return NodeType; } set { NodeType = value; } }

        [DataMember(Name = "url")]
        public string Url { get; set; }

        [DataMember(Name = "leaf")]
        public bool Leaf { get; set; }
        
        [DataMember(Name = "expanded")]
        public bool Expanded { get; set; }
        
        [DataMember(Name = "expandable")]
        public bool Expandable { get; set; }

        [DataMember(Name = "cls", EmitDefaultValue = false)]
        public string Class { get; set; }

        [DataMember(Name = "iconCls", EmitDefaultValue = false)]
        public string IconClass { get { return "taco-nav-node-" + (NodeType ?? "unknown"); } set { } }
        
        [DataMember(Name = "allowDrag")]
        public bool AllowDrag { get; set; }

        
         [DataMember(Name = "isHidden")]
        public bool IsHidden { get; set; }

        public bool AllowDrop { get; set; }

        /// <summary>
        /// Override Object.ToString()
        /// </summary>
        public override string ToString()
        {
            return Id;
        }
    }
}