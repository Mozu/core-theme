using System.Collections.Generic;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Category
{
    
    public class CategoryTreeNode
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public int ParentId { get; set; }

        public int Index { get; set; }

        public List<CategoryTreeNode> Items { get; set; }

        public bool IsHidden { get; set; }

        public int ProductCount { get; set; }

        public bool leaf { get; set; }


     
        
    }
}
