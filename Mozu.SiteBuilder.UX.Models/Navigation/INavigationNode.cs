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
        string OriginalId { get; set; }
          [Obsolete]
        string OriginalCollection { get; set; }
        string OriginalDocumentListName { get; set; }
        string ParentId { get; set; }
        string Name { get; set; }
        string Url { get; set; }
        int Index { get; set; }
        NavigationNodeType NodeType { get; set; }
    }

    /// <summary>
    /// Navigation node used by storefront. Every node has a parent and optionally has children.
    /// </summary>
    public interface IRuntimeNavigationNode : INavigationNode
    {
        bool IsHomePage { get; }
        IRuntimeNavigationNode Parent { get; set; }
        ICollection<IRuntimeNavigationNode> Items { get;} 
    }

    /// <summary>
    /// Navigation node used by admin. For easy serialization, 
    /// admin uses a flat list of nodes which each have a ParentId attribute.
    /// </summary>
    public interface ITreeNavigationNode : INavigationNode
    {
        bool IsLeaf     { get; }
        bool AllowDrag  { get; }
        bool AllowDrop  { get; }
        bool Expanded   { get; }
        bool Expandable { get; }
        bool IsHidden   { get; }
        bool IsHomePage { get; }
    }
}
