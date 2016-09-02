using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Category
{
    public class CategoryNode
    {
        public int? Id { get; set; }

        public string Code {get; set;}

        public string CategoryType { get; set; }
      
        public int? CatalogId { get; set; }

        public string CategoryCode { get; set; }

        public bool IsActive { get; set; }

        public bool? IsHidden { get; set; }

        public int? ParentId { get; set; }

        public int? Index { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public int? Sequence { get; set; }

        [JsonProperty(PropertyName = "leaf")]
        public bool IsLeaf { get; set; }

        public List<CategoryNode> Children { get; set; }
    }
}