using System;
using System.Collections.Generic;

namespace Mozu.SiteBuilder.UX.Models.Navigation
{
    public class SimpleRuntimeNavigationNode : IRuntimeNavigationNode
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

        private string _parentId;
        public string ParentId { get { return _parentId ?? (Parent != null ? Parent.Id : null); } set { _parent = null; _parentId = value; } }

        public string Name { get; set; }

        public string Url { get; set; }

        public int Index { get; set; }

        public NavigationNodeType NodeType { get; set; }

        public bool IsHomePage { get; set; }

        public bool IsHidden { get; set; }

        private IRuntimeNavigationNode _parent;
        public IRuntimeNavigationNode Parent { get { return _parent; } set { _parentId = null; _parent = value; } }

        public ICollection<IRuntimeNavigationNode> Items { get; set; }



    }
}
