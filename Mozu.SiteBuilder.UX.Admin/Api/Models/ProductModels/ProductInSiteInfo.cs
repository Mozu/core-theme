using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels
{
    /// <summary>
    /// Represents the site-specific overrides configurable for a product.
    /// </summary>
    
    public class ProductInCatalogInfo
    {
        /// <summary>
        /// The product these overrides belong to.
        /// </summary>
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string ProductCode { get; set; }

        /// <summary>
        /// The site identifier these overrides belong to.
        /// </summary>
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public int CatalogId { get; set; }

        /// <summary>
        /// Represents whether the product is active in this site.
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "categoryIds")]
        public List<int> ProductCategories { get; set; }


        /// <summary>
        /// Represents whether the product is active in this site.
        /// </summary>
        public bool IsActive { get; set; }


        public string DateFirstAvailableInCatalog { get; set; }

        public DateTime? ActiveStartDate { get; set; }

        public DateTime? ActiveEndDate { get; set; }

        #region Content
        /// <summary>
        /// Represents whether the content information is overridden from the global data.
        /// </summary>
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? IsContentOverridden { get; set; }

        /// <summary>
        /// The product name.
        /// </summary>
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string ProductName { get; set; }


        /// <summary>
        /// A collection of images for this product.
        /// </summary>
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public List<ProductLocalizedImage> ProductImages { get; set; }



        /// <summary>
        /// The product short description.
        /// </summary>
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string ProductShortDescription { get; set; }

        /// <summary>
        /// The product full description.
        /// </summary>
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string ProductFullDescription { get; set; }

        #endregion

        #region Price
        /// <summary>
        /// Represents whether the price information is overridden from the global data.
        /// </summary>                                
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool IsPriceOverridden { get; set; }

        /// <summary>
        /// The list price.
        /// </summary>
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public decimal? ListPrice { get; set; }

        /// <summary>
        /// The price.
        /// </summary>
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public decimal? Price { get; set; }

        /// <summary>
        /// The sale price.
        /// </summary>
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public decimal? SalePrice { get; set; }

        /// <summary>
        /// Manufacturer Suggested Retail Price
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "msrp")]
        public decimal? MSRP { get; set; }

        /// <summary>
        /// Minimum Advertised Price
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "map")]
        public decimal? MAP { get; set; }

        /// <summary>
        /// Minimum Advertised Price Start Date
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "mapStartDate")]
        public DateTime? MAPStartDate { get; set; }

        /// <summary>
        /// Minimum Advertised Price End Date
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "mapEndDate")]
        public DateTime? MAPEndDate { get; set; }

        #endregion

        // TODO: categories
        #region SEO

        /// <summary>
        /// Represents whether the SEO information is overridden from the global data.
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "isSEOContentOverridden")]
        public bool IsSEOContentOverridden { get; set; }

        /// <summary>
        /// The HTML metatag title.
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "metaTitle")]
        public string MetaTagTitle { get; set; }

        /// <summary>
        /// The HTML metatag description.
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName="metaDescription")]
        public string MetaTagDescription { get; set; }

        /// <summary>
        /// The HTML metatag keywords.
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "metaKeywords")]
        public string MetaTagKeywords { get; set; }

        /// <summary>
        /// An SEO friendly URL.
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName="slug")]
        public string SEOFriendlyUrl { get; set; }

        #endregion
    }
}
