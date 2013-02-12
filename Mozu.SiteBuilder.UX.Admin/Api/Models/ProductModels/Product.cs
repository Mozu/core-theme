using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels
{
    /// <summary>
    /// Represents an editable product.
    /// See http://vconfluence.ads.volusion.com/display/Product/Product+-+v1#Product-v1-ProductDetails
    /// </summary>
    [DataContract]
    public class Product
    {
        #region General
        /// <summary>
        /// The user-specified identifier of this product.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "productCode")]
        public string ProductCode { get; set; }

        /// <summary>
        /// The parent product code, if any.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "baseProductCode")]
        public string BaseProductCode { get; set; }

        /// <summary>
        /// The product name.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name="productName")]
        public string ProductName { get; set; }

        /// <summary>
        /// The product short description.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name="shortDescription")]
        public string ShortDescription { get; set; }

        /// <summary>
        /// The product full description.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "fullDescription")]
        public string FullDescription { get; set; }

        /// <summary>
        /// A collection of images for this product.
        /// </summary>
        public List<ProductLocalizedImage> Images { get; set; }

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
        
        #region Inventory
        // TODO: track inventory

        /// <summary>
        /// Quantity of inventory.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "stockOnHand")]
        public int? StockOnHand { get; set; }

        /// <summary>
        /// Hide when out of stock.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name="isHiddenWhenOutOfStock")]
        public bool? IsHiddenWhenOutOfStock { get; set; }

        // TODO: (boolean) show out of stock message selected

        /// <summary>
        /// Allow back-orders.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name="isBackOrderAllowed")]
        public bool? IsBackOrderAllowed { get; set; }

        // TODO: low stock threshold

        #endregion

        #region Extras

        // TODO: Extras

        #endregion

        #region Properties

        // TODO: Properties

        #endregion

        #region Shipping
        /// <summary>
        /// The shipping weight.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "packageWeight")]
        public decimal? PackageWeight { get; set; }

        /// <summary>
        /// The package length.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "packageLength")]
        public decimal? PackageLength { get; set; }

        /// <summary>
        /// The package width.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "packageWidth")]
        public decimal? PackageWidth { get; set; }

        /// <summary>
        /// The package height.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "packageHeight")]
        public decimal? PackageHeight { get; set; }

        #endregion

        #region SEO

        /// <summary>
        /// The HTML metatag title.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "metaTagTitle")]
        public string MetaTagTitle { get; set; }

        /// <summary>
        /// The HTML metatag description.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "metaTagDescription")]
        public string MetaTagDescription { get; set; }

        /// <summary>
        /// The HTML metatag keywords.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "metaTagKeywords")]
        public string MetaTagKeywords { get; set; }

        /// <summary>
        /// An SEO friendly URL.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "seoFriendlyUrl")]
        public string SEOFriendlyUrl { get; set; }

        #endregion

        /// <summary>
        /// A collection of site-specific overrides for this product.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "productInSites")]
        public List<ProductInSiteInfo> ProductInSites { get; set; }
    }
}