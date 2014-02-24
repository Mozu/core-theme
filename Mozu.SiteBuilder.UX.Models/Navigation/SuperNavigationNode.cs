using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Models.Navigation
{
    public interface INavigationNode
    {
        string Id { get; }
        string ParentId { get; }
        string OriginalId { get; set; }
        string Name { get; set; }
        string Url { get; set; }
        int Index { get; set; }
        NavigationNodeType NodeType { get; set; }
    }

    public interface IRuntimeNavigationNode : INavigationNode
    {
        bool IsHomePage { get; }
        IRuntimeNavigationNode Parent { get; }
        ICollection<IRuntimeNavigationNode> Items { get; }
    }

    public interface ITreeNavigationNode : INavigationNode
    {
    }

    /// <summary>
    /// Representation of an element in a navigation tree.
    /// </summary>
    public class SuperNavigationNode : IRuntimeNavigationNode, ITreeNavigationNode
    {
        public string Id { get; set; }

        public string ParentId { get; set; }

        public string OriginalId { get; set; }

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
        public ICollection<IRuntimeNavigationNode> Items { get; set;  }
    }
}
