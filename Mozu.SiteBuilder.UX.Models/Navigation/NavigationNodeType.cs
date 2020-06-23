using System;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Models.Navigation
{
    /// <summary>
    /// Provides a rich object corresponding to the type options of NavigationNode 
    /// which is implicitly castable to and from string.
    /// </summary>
    [JsonConverter(typeof(NavigationNodeTypeConverter))]
    public class NavigationNodeType : IComparable<string>
    {
        private const string NODE_TYPE_CATEGORY = "category";
        private const string NODE_TYPE_GROUP = "group";
        private const string NODE_TYPE_PAGE = "page";
        private const string NODE_TYPE_LINK = "link";
        private const string NODE_TYPE_PRODUCT = "product";
        private const string NODE_TYPE_TEMPLATE = "template";
        private const string NODE_TYPE_EMAIL_TEMPLATE = "emailtemplate";
        private const string NODE_TYPE_MOBILENOTIFICATION_TEMPLATE = "mobilenotificationTemplate";
        private const string NODE_TYPE_ORDER_TEMPLATE = "ordertemplate";
        private const string NODE_TYPE_CONTENT_LIST = "contentlist";

        private readonly string _nodeType;

        public bool IsCategory { get { return _nodeType == NODE_TYPE_CATEGORY; } }
        public bool IsLink { get { return _nodeType == NODE_TYPE_LINK; } }
        public bool IsPage { get { return _nodeType == NODE_TYPE_PAGE; } }
        public bool IsProduct { get { return _nodeType == NODE_TYPE_PRODUCT; } }
        public bool IsGroup { get { return _nodeType == NODE_TYPE_GROUP; } }

        public static NavigationNodeType Category = new NavigationNodeType(NODE_TYPE_CATEGORY);
        public static NavigationNodeType Group = new NavigationNodeType(NODE_TYPE_GROUP);
        public static NavigationNodeType Link = new NavigationNodeType(NODE_TYPE_LINK);
        public static NavigationNodeType Page = new NavigationNodeType(NODE_TYPE_PAGE);
        public static NavigationNodeType Product = new NavigationNodeType(NODE_TYPE_PRODUCT);
        public static NavigationNodeType OrderTemplate = new NavigationNodeType(NODE_TYPE_ORDER_TEMPLATE);
        public static NavigationNodeType EmailTemplate = new NavigationNodeType(NODE_TYPE_TEMPLATE);
        public static NavigationNodeType Template = new NavigationNodeType(NODE_TYPE_EMAIL_TEMPLATE);
        public static NavigationNodeType ContentList = new NavigationNodeType(NODE_TYPE_CONTENT_LIST);
        public static NavigationNodeType MobileNotificationTemplate = new NavigationNodeType(NODE_TYPE_MOBILENOTIFICATION_TEMPLATE);

        /// <summary>
        /// Operator overload to allow for comparison with strings.
        /// </summary>
        public static bool operator ==(NavigationNodeType nodeType, string type)
        {
            // test for x == null.
            if ((object)nodeType == null)
                return type == null;
            return nodeType._nodeType == type;
        }

        public NavigationNodeType() { }

        /// <summary>
        /// Operator overload to allow for comparison with strings.
        /// </summary>
        public static bool operator !=(NavigationNodeType nodeType, string type)
        {
            // test for x != null
            if ((object)nodeType == null)
                return type != null;
            return nodeType._nodeType != type;
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
                case NODE_TYPE_EMAIL_TEMPLATE:
                    return EmailTemplate;
                case NODE_TYPE_MOBILENOTIFICATION_TEMPLATE:
                    return MobileNotificationTemplate;
                default:
                    throw new ArgumentException("Attempt to cast invalid string to NavigationNodeType: " + type);
            }
        }

        /// <summary>
        /// Allow implicit casting of NavigationNodeType to string.
        /// </summary>
        public static implicit operator string(NavigationNodeType t)
        {
            return t != null ? t._nodeType : null;
        }

        /// <summary>
        /// Private constructor
        /// </summary>
        private NavigationNodeType(string nodeType)
        {
            _nodeType = nodeType;
        }

        /// <summary>
        /// Object.Equals override.
        /// </summary>
        public override bool Equals(object obj)
        {
            var t = obj as NavigationNodeType;

            return t != null && t._nodeType == _nodeType;
        }

        /// <summary>
        /// Object.GetHashCode override.
        /// </summary>
        public override int GetHashCode()
        {
            return _nodeType.GetHashCode();
        }

        public int CompareTo(string other)
        {
            return String.Compare(_nodeType, other, StringComparison.OrdinalIgnoreCase);
        }

        /// <summary>
        /// Object.ToString() override.
        /// </summary>
        /// <returns></returns>
        public override string ToString()
        {
            return _nodeType;
        }


        public class NavigationNodeTypeConverter : Newtonsoft.Json.JsonConverter {
            public override bool CanConvert(Type objectType)
            {
                return objectType == typeof(NavigationNodeType);
            }

            public override object ReadJson(Newtonsoft.Json.JsonReader reader, Type objectType, object existingValue, Newtonsoft.Json.JsonSerializer serializer)
            {
                if (reader.TokenType == JsonToken.Null)
                {
                    return null;
                }
                if (reader.TokenType == JsonToken.String) {
                    return (NavigationNodeType)(string)reader.Value;
                }
                if (reader.TokenType == JsonToken.StartObject)
                {
                    reader.Read();
                    if (reader.TokenType == JsonToken.PropertyName && String.Equals((string)reader.Value, "nodeType", StringComparison.InvariantCultureIgnoreCase))
                    {
                        var value = reader.ReadAsString();
                        reader.Read();
                        return (NavigationNodeType)value;
                    }
                }
                throw new SerializationException("Could not parse NavigationNodeType.");
            }

            public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
            {
                writer.WriteValue(value.ToString());
            }
        }

    }
}
