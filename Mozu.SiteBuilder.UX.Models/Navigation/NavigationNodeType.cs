using System;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Navigation
{
    /// <summary>
    /// Provides a rich object corresponding to the type options of NavigationNode 
    /// which is implicitly castable to and from string.
    /// </summary>
    public class NavigationNodeType : ISerializable
    {
        private const string NODE_TYPE_CATEGORY = "category";
        private const string NODE_TYPE_GROUP = "group";
        private const string NODE_TYPE_PAGE = "page";
        private const string NODE_TYPE_LINK = "link";
        private const string NODE_TYPE_PRODUCT = "product";

        private readonly string _nodeType;

        public bool IsCategory { get { return _nodeType == NODE_TYPE_CATEGORY; } }
        public bool IsLink { get { return _nodeType == NODE_TYPE_LINK; } }
        public bool IsPage { get { return _nodeType == NODE_TYPE_PAGE; } }
        public bool IsProduct { get { return _nodeType == NODE_TYPE_PRODUCT; } }

        public static NavigationNodeType Category = new NavigationNodeType(NODE_TYPE_CATEGORY);
        public static NavigationNodeType Group = new NavigationNodeType(NODE_TYPE_GROUP);
        public static NavigationNodeType Link = new NavigationNodeType(NODE_TYPE_LINK);
        public static NavigationNodeType Page = new NavigationNodeType(NODE_TYPE_PAGE);
        public static NavigationNodeType Product = new NavigationNodeType(NODE_TYPE_PRODUCT);

        /// <summary>
        /// Operator overload to allow for comparison with strings.
        /// </summary>
        public static bool operator ==(NavigationNodeType nodeType, string type)
        {
            // test for x == null.
            if ((object)nodeType == null)
                return type == null;
            else if (nodeType._nodeType == type)
                return true;
            else
                return false;
        }

        /// <summary>
        /// Operator overload to allow for comparison with strings.
        /// </summary>
        public static bool operator !=(NavigationNodeType nodeType, string type)
        {
            // test for x != null
            if ((object)nodeType == null)
                return type != null;
            else if (nodeType._nodeType == type)
                return false;
            else
                return true;
        }

        /// <summary>
        /// Allow implicit casting of string to NavigationNodeType.
        /// </summary>
        public static implicit operator NavigationNodeType(string type)
        {
            switch (type)
            {
                case NODE_TYPE_CATEGORY:
                    return Category;
                case NODE_TYPE_GROUP:
                    return Group;
                case NODE_TYPE_LINK:
                    return Link;
                case NODE_TYPE_PAGE:
                    return Page;
                case NODE_TYPE_PRODUCT:
                    return Product;
                default:
                    throw new ArgumentException("Attempt to cast invalid string to NavigationNodeType: " + type);
            }
        }

        /// <summary>
        /// Allow implicit casting of NavigationNodeType to string.
        /// </summary>
        public static implicit operator string(NavigationNodeType t)
        {
            if (t != null)
                return t._nodeType;
            else
                return null;
        }

        /// <summary>
        /// Private constructor
        /// </summary>
        private NavigationNodeType(string nodeType)
        {
            _nodeType = nodeType;
        }

        /// <summary>
        /// Deserialization constructor.
        /// </summary>
        public NavigationNodeType(SerializationInfo info, StreamingContext context)
        {
            _nodeType = (string)info.GetValue("nodeType", typeof(string));
        }

        /// <summary>
        /// Object.Equals override.
        /// </summary>
        public override bool Equals(object obj)
        {
            NavigationNodeType t = obj as NavigationNodeType;

            if (t != null && t._nodeType == _nodeType)
                return true;
            else
                return false;
        }

        /// <summary>
        /// Object.GetHashCode override.
        /// </summary>
        public override int GetHashCode()
        {
            return _nodeType.GetHashCode();
        }

        /// <summary>
        /// Allows this object to be serialized.
        /// </summary>
        public void GetObjectData(SerializationInfo info, StreamingContext context)
        {
            info.AddValue("type", _nodeType, typeof(string));
        }
    }
}
