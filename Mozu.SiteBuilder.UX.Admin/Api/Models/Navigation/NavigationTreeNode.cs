using System;
using System.Runtime.Serialization;
using Mozu.SiteBuilder.UX.Models.Navigation;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Navigation
{
    /// <summary>
    /// A node in the navigation hierarchy represented 
    /// in a convenient way for the "sitebuilder" feature of admin.
    /// </summary>
    [DataContract]
    public class NavigationTreeNode : ITreeNavigationNode
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
         [DataMember(Name = "metaData", EmitDefaultValue = false)]
        public JObject MetaData { get; set; }
        [DataMember(Name = "id", EmitDefaultValue = false)]
        public string Id { get; set; }

    

        /// <summary>
        /// When EXT edits this node, EditAction will be set to the appropriate action:
        /// "move" or "rename"
        /// </summary>
        [DataMember(Name = "editAction", EmitDefaultValue = false)]
        public string EditAction { get; set; }

        [DataMember(Name = "originalId", EmitDefaultValue = false)]
        public string OriginalId { get; set; }

   

        [Obsolete]
        [DataMember(Name = "originalCollection")]
        public string OriginalCollection
        {
            get { return this.OriginalDocumentListName; }
            set { this.OriginalDocumentListName = value; }
        }



        [DataMember(Name = "originalDocumentListName", EmitDefaultValue = false)]
        public string OriginalDocumentListName { get; set; }





        [DataMember(Name = "parentId")]
        public string ParentId { get; set; }

        [DataMember(Name = "index")]
        public int Index { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

      

        

        [IgnoreDataMember, JsonIgnore]
        public NavigationNodeType NodeType { get; set; }

        // plain string for easy serialization.
        [Obsolete]
        [DataMember(Name = "nodeType")]
        public string NodeTypeString { get { return NodeType.ToString(); } set { NodeType = value; } }

        [DataMember(Name = "url")]
        public string Url { get; set; }

        [DataMember(Name = "isHomePage")]
        public bool IsHomePage { get; set; }


        [DataMember(Name = "leaf")]
        public bool IsLeaf { get; set; }
        
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