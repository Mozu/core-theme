using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using Mozu.SiteBuilder.UX.Models.Navigation;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.Mvc.Navigation
{
    /// <summary>
    /// Representation of an element in a navigation tree.
    /// This class should only be used by NavigationGandalf and NavigationRepository 
	/// and always exposed as an interface!
    /// </summary>
    internal class SuperNavigationNode : IRuntimeNavigationNode, ITreeNavigationNode
    {
        private const string STRING_SPLIT_DELIM = "^^";

        public string Id { get; set; }

        private string _parentId = null;
        public string ParentId
        {
            get { return _parentId ?? (Parent != null ? Parent.Id : null); }
            set { _parentId = value; }
        }

        private string _originalId;

        /// <summary>
        /// The original ID of this node.
        /// </summary>
        public string OriginalId
        {
            get
            {
                if (String.IsNullOrEmpty(_originalId))
                {
                    if (NodeType != null && NodeType.IsPage && IdParts.Length >= 3)
                        return IdParts[2];
                    else
                        return IdParts.Last();
                }
                else return _originalId;
            }
            set { _originalId = value; }
        }

        public string OriginalCollection { get; set; }

        public string Name { get; set; }

        public string Url { get; set; }

        public int Index { get; set; }

        [JsonIgnore]
        public NavigationNodeType NodeType { get; set; }

        [JsonProperty(PropertyName = "nodeType")]
        public string NodeTypeString { get { return NodeType; } set { NodeType = value; } }

        public bool IsLeaf { get; set; }

        public bool IsHomePage { get; set; }

        [JsonIgnore]
        public IRuntimeNavigationNode Parent { get; set; }

        [JsonIgnore]
        public ICollection<IRuntimeNavigationNode> Items { get; set; }

        [JsonIgnore]
        private string[] IdParts { get { return (Id ?? "").Split(new string[] { STRING_SPLIT_DELIM }, StringSplitOptions.None); } }


        public bool AllowDrag { get; set; }

        public bool AllowDrop { get; set; }

        public bool Expanded { get; set; }

        public bool Expandable { get; set; }

        public bool IsHidden { get; set; }
    }
}
