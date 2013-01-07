using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Navigation
{
    [DataContract]
    public class NavigationNode
    {
        const string _STRINGSPLITDELIM = "^^";
        public static string JoinParts(params object[] parts)
        {
            return string.Join(_STRINGSPLITDELIM, parts);
        }
        public static string[] SplitParts(string str)
        {
            return str.Split(new string[] { _STRINGSPLITDELIM }, StringSplitOptions.None);
        }

        private string _id;
        private string[] _idParts;

        public const string TopcatID = "topcat";

        public NavigationNode()
        {
           // ChildNodes = new List<NavigationNode>();
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

        

        [DataMember(Name = "parentId", EmitDefaultValue = false)]
        public string ParentId { get; set; }

        [DataMember(Name = "name", EmitDefaultValue = false)]
        public string Name { get; set; }
        [DataMember(Name = "index", EmitDefaultValue = false)]
        public int? Index { get; set; }

       
        public string[] IdParts
        {
            get{ if ( _idParts == null )
            {
                _idParts = SplitParts(_id ?? "");
            }
                return _idParts;
            }
        }

        [DataMember(Name = "leaf")]
        public bool Leaf { get; set; }

        [DataMember(Name = "nodeType", EmitDefaultValue = false)]
        public string NodeType { get; set; }

        [DataMember(Name = "url", EmitDefaultValue = false)]
        public string Url { get; set; }
    }
}