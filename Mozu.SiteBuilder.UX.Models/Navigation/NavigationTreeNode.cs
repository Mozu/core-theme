using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Navigation
{
    [DataContract()]
    public class NavigationTreeNode
    {
        private string _id;
        private string[] _idParts;
        
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
        public string[] IdParts
        {
            get { return _idParts ?? (_idParts = NavigationNode.SplitParts(_id ?? "")); }
        }
        
        [DataMember(Name = "id", EmitDefaultValue = false)]
        public string Id
        {
            get { return _id; }
            set { 
                _id = value;
                _idParts = null;
            }
        }


        [DataMember(Name = "parentId")]
        public string ParentId { get; set; }

        [DataMember(Name = "index")]
        public int? Index { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "nodeType")]
        public string NodeType { get; set; }

        [DataMember(Name = "url")]
        public string Url { get; set; }

        [DataMember(Name = "items", EmitDefaultValue = false)]
        public List<NavigationTreeNode> Items { get; set; }

        [DataMember(Name = "leaf")]
        public bool Leaf { get; set; }
        
        [DataMember(Name = "expanded")]
        public bool Expanded { get; set; }
        
        [DataMember(Name = "expandable")]
        public bool Expandable { get; set; }

        [DataMember(Name = "cls", EmitDefaultValue = false)]
        public string Class { get; set; }

        [DataMember(Name = "iconCls", EmitDefaultValue = false)]
        public string IconClass { get { return "taco-nav-node-" + (NodeType ?? "unknown").ToLower(); } set { } }
        
        [DataMember(Name = "allowDrag")]
        public bool AllowDrag { get; set; }

        
         [DataMember(Name = "isHidden")]
        public bool IsHidden { get; set; }

         public bool AllowDrop { get; set; }
    }
}