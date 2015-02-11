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


        [JsonIgnore]
        public Category Parent { get; set; }

        public List<CategoryImage> CategoryImages { get; set; }
    }

    
    public class CategoryImage
    {
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public int? Id { get; set; }

        /// <summary>
        /// Language used for the image content.
        /// 
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string LocaleCode { get; set; }

        /// <summary>
        /// Image title that appears on the storefront.
        /// 
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string ImageLabel { get; set; }

        /// <summary>
        /// Descriptive text associated with the image or video that appears on the storefront.
        /// 
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Alt { get; set; }

        /// <summary>
        /// URL of the image.
        /// 
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Url { get; set; }

        /// <summary>
        /// Id of the image in the CMS.
        /// 
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string CmsId { get; set; }

        /// <summary>
        /// URL of a video associated with the category.
        /// 
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string VideoUrl { get; set; }

        /// <summary>
        /// Type of media. Used by the client to determine how to render the image or video or what have you.
        /// 
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public virtual string MediaType { get; set; }

        /// <summary>
        /// For categories with multiple images, the order in which this image appears on the storefront.
        /// 
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public int? Sequence { get; set; }
    }
}
