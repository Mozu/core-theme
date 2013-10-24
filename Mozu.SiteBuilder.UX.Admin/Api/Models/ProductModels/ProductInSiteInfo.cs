using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels
{
    /// <summary>
    /// Represents the site-specific overrides configurable for a product.
    /// </summary>
    [DataContract]
    public class ProductInCatalogInfo
    {
        /// <summary>
        /// The product these overrides belong to.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "productCode")]
        public string ProductCode { get; set; }

        /// <summary>
        /// The site identifier these overrides belong to.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "siteId")]
        public int CatalogId { get; set; }

        /// <summary>
        /// Represents whether the product is active in this site.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "categoryIds")]
        public List<int> ProductCategories { get; set; }


        /// <summary>
        /// Represents whether the product is active in this site.
        /// </summary>
        [DataMember(EmitDefaultValue = true, Name = "isActive")]
        public bool IsActive { get; set; }


        #region Content
        /// <summary>
        /// Represents whether the content information is overridden from the global data.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "isContentOverridden")]
        public bool? IsContentOverridden { get; set; }

        /// <summary>
        /// The product name.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "productName")]
        public string ProductName { get; set; }


        /// <summary>
        /// A collection of images for this product.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "productImages")]
        public List<ProductLocalizedImage> ProductImages { get; set; }



        /// <summary>
        /// The product short description.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "productShortDescription")]
        public string ProductShortDescription { get; set; }

        /// <summary>
        /// The product full description.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "productFullDescription")]
        public string ProductFullDescription { get; set; }

        #endregion

        #region Price
        /// <summary>
        /// Represents whether the price information is overridden from the global data.
        /// </summary>                                
        [DataMember(EmitDefaultValue = false, Name = "isPriceOverridden")]
        public bool IsPriceOverridden { get; set; }

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