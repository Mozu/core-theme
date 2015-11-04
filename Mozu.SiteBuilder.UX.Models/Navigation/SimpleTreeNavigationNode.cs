using System;

namespace Mozu.SiteBuilder.UX.Models.Navigation
{
    public class SimpleTreeNavigationNode : ITreeNavigationNode
    {
        public string Id { get; set; }

        public string OriginalId { get; set; }

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

        public string ParentId { get; set; }

        public bool IsLeaf { get; set; }

        public bool AllowDrag { get; set; }

        public bool AllowDrop { get; set; }

        public bool Expanded { get; set; }

        public bool Expandable { get; set; }

        public bool IsHidden { get; set; }

        public bool IsHomePage { get; set; }
    }
}
