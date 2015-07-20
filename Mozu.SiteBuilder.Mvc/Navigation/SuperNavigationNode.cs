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


        public string CategoryCode
        {
            get;set;
        }
        
        [Obsolete]
        public string OriginalCollection
        {
            get { return this.OriginalDocumentListName; }
            set { this.OriginalDocumentListName = value; }
        }

        public string OriginalDocumentListName { get; set; }

        public string Name { get; set; }

        public string Url { get; set; }

        public int Index { get; set; }

        public NavigationNodeType NodeType { get; set; }

        public bool IsHomePage { get; set; }

        [JsonIgnore]
        public IRuntimeNavigationNode Parent { get; set; }

        [JsonIgnore]
        public ICollection<IRuntimeNavigationNode> Items { get; set; }

        [JsonIgnore]
        private string[] IdParts { get { return (Id ?? "").Split(new string[] { STRING_SPLIT_DELIM }, StringSplitOptions.None); } }

        /// <summary>
        /// Is this a system-created node like _root.
        /// </summary>
        public bool IsSystemNode { get; set; }


        private bool? _allowDrag;
        public bool AllowDrag { get { return _allowDrag.HasValue ? _allowDrag.Value : !IsSystemNode; } set { _allowDrag = value; } }

        private bool? _allowDrop;
        public bool AllowDrop { get { return _allowDrop.HasValue ? _allowDrop.Value : (!IsSystemNode && (NodeType.IsCategory || NodeType.IsGroup || NodeType.IsPage)); } set { _allowDrop = value; } }

        private bool? _expanded;
        public bool Expanded { get { return _expanded.HasValue ? _expanded.Value : (Expandable && IsSystemNode); } set { _expanded = value; } }

        private bool? _expandable;
        public bool Expandable { get { return _expandable.HasValue ? _expandable.Value : (NodeType.IsCategory || NodeType.IsGroup || NodeType.IsPage || NodeType.IsLink); } set { _expandable = value; } }

        private bool? _isLeaf;
        /// <summary>
        /// Opposite of Expandable
        /// </summary>
        public bool IsLeaf { get { return _isLeaf.HasValue ? _isLeaf.Value : !Expandable; } set { _isLeaf = value; } }

        public bool IsHidden { get; set; }

        public bool IsEmpty { get; set; }
    }
}
