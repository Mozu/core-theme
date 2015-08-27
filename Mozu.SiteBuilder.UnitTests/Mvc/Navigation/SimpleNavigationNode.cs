using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mozu.SiteBuilder.UX.Models.Navigation;

namespace Mozu.SiteBuilder.UnitTests.Mvc.Navigation
{
    internal class SimpleNavigationNode : INavigationNode
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
        public string ParentId { get; set; }
        public string Name { get; set; }
        public string Url { get; set; }
        public int Index { get; set; }
        public NavigationNodeType NodeType { get; set; }
    }
}
