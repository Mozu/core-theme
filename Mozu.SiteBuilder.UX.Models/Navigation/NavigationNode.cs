using System;
using System.Linq;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Navigation
{
    /// <summary>
    /// A serializable representation of an element in a navigation tree.
    /// This type is used internally and is converted to a
    /// NavigationTreeNode or a NavigationRuntimeNode for use by Admin or Storefront.
    /// </summary>
    [DataContract]
    public class NavigationNode
    {
        private const string STRING_SPLIT_DELIM = "^^";

        /// <summary>
        /// The unique identifier of this NavigationNode.
        /// </summary>
        [DataMember(Name = "id", EmitDefaultValue = false)]
        public string Id { get; set; }

        /// <summary>
        /// This node's parent id, if any.
        /// </summary>
        [DataMember(Name = "parentId", EmitDefaultValue = false)]
        public string ParentId { get; set; }

        /// <summary>
        /// This node's name.
        /// </summary>
        [DataMember(Name = "name", EmitDefaultValue = false)]
        public string Name { get; set; }

        /// <summary>
        /// This node's index position in a tree.
        /// </summary>
        [DataMember(Name = "index", EmitDefaultValue = false)]
        public int? Index { get; set; }

        /// <summary>
        /// Whether this node can have children.
        /// </summary>
        [DataMember(Name = "leaf")]
        public bool IsLeaf { get; set; }

        /// <summary>
        /// The type of node (e.g. category, document, link)
        /// </summary>
        public NavigationNodeType NodeType { get; set; }

        private string _originalId;

        /// <summary>
        /// The original ID of this node.
        /// </summary>
        [DataMember(Name = "originalId")]
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

        /// <summary>
        /// The original Collection, if applicable.
        /// </summary>
        private string _originalCollection;
        [DataMember(Name = "originalCollection")]
        public string OriginalCollection
        {
            get
            {
                if (String.IsNullOrEmpty(_originalCollection))
                {
                    if (NodeType != null && NodeType.IsPage && IdParts.Length > 2)
                        return IdParts[IdParts.Length - 2];
                    else
                        return null;
                }
                else return _originalCollection;
            }
            set { _originalCollection = value; }
        }

        // plain string for easy serialization.
        [Obsolete]
        [DataMember(Name = "nodeType", EmitDefaultValue = false)]
        public string NodeTypeString { get { return NodeType; } set { NodeType = value; } }

        /// <summary>
        /// The url for this node.
        /// </summary>
        [DataMember(Name = "url", EmitDefaultValue = false)]
        public string Url { get; set; }
       
        protected string[] IdParts
        {
            get{ return SplitParts(Id ?? ""); }
        }

        public string CollectionName
        {
            get
            {
                if (IdParts.Length >= 3) 
                    return IdParts[2];
                else
                    return null;
            }
        }

        private static string JoinParts(params object[] parts)
        {
            return string.Join(STRING_SPLIT_DELIM, parts);
        }

        internal static string[] SplitParts(string str)
        {
            return str.Split(new string[] { STRING_SPLIT_DELIM }, StringSplitOptions.None);
        }
    }
}