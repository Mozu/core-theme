using System;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels
{
    /// <summary>
    /// Represents the site-specific overrides configurable for a product.
    /// </summary>
    [DataContract]
    public class ProductInSiteInfo
    {
        /// <summary>
        /// The product these overrides belong to.
        /// </summary>
        public string ProductCode { get; set; }

        /// <summary>
        /// The site identifier these overrides belong to.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "siteId")]
        public int SiteId { get; set; }

        /// <summary>
        /// Represents whether the product is active in this site.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "isActive")]
        public bool IsActive { get; set; }

        #region Content
        /// <summary>
        /// Represents whether the content information is overridden from the global data.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "isContentOverriden")]
        public bool IsContentOverridden { get; set; }

        /// <summary>
        /// The product name.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "productName")]
        public string ProductName { get; set; }

        /// <summary>
        /// The product short description.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "shortDescription")]
        public string ShortDescription { get; set; }

        /// <summary>
        /// The product full description.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "fullDescription")]
        public string FullDescription { get; set; }

        // TODO: images

        #endregion

        #region Price
        /// <summary>
        /// Represents whether the price information is overridden from the global data.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "isPriceOverridden")]
        public bool IsPriceOverriden { get; set; }

        /// <summary>
        /// The list price.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "listPrice")]
        public decimal? ListPrice { get; set; }

        /// <summary>
        /// The price.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "price")]
        public decimal? Price { get; set; }

        /// <summary>
        /// The sale price.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "salePrice")]
        public decimal? SalePrice { get; set; }

        #endregion

        // TODO: categories

        #region SEO

        /// <summary>
        /// Represents whether the SEO information is overridden from the global data.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "isSEOContentOverridden")]
        public bool IsSEOContentOverridden { get; set; }

        /// <summary>
        /// The HTML metatag title.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "metaTagTitle")]
        public string MetaTagTitle { get; set; }

        /// <summary>
        /// The HTML metatag description.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name="metaTagDescription")]
        public string MetaTagDescription { get; set; }

        /// <summary>
        /// The HTML metatag keywords.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "metaTagKeywords")]
        public string MetaTagKeywords { get; set; }

        /// <summary>
        /// An SEO friendly URL.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name="seoFriendlyUrl")]
        public string SEOFriendlyUrl { get; set; }

        #endregion
    }
}