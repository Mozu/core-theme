using System.Collections.Generic;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Category
{
    
    public class Category
    {
        public int? Id { get; set; }
        string _catCode;
        
        public string Code
        {
            get{ return string.IsNullOrEmpty ( _catCode )?  System.Guid.NewGuid ().ToString () : _catCode ;}
            set{ _catCode = value ;}
        }

        public string Slug { get; set; }

        public int? CatalogId { get; set; }

        public string CategoryCode { get; set; }

        //public string CategoryPath { get; set; }

        public bool? IsHidden { get; set; }

        public int? ParentId { get; set; }

        public int? Index { get; set; }

        public int? ProductCount { get; set; }

        public string Name { get; set; }

        //public string InternalName { get; set; }

        public string Description { get; set; }

        public int? Sequence { get; set; }

        public string PageTitle { get; set; }
        public string MetaTitle { get; set; }
        public string MetaDescription { get; set; }
        public string MetaKeywords { get; set; }


        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Path { get; set; }

        [JsonProperty(PropertyName = "leaf")]
        public bool IsLeaf { get; set; }
        
        public bool CascadeDelete { get; set; }

        [JsonIgnore]
        public Category Parent { get; set; }

        public List<CategoryImage> CategoryImages { get; set; }
    }

    
    public class CategoryImage
    {
        public string Url { get; set; }

        public string Alt { get; set; }
    }
}
