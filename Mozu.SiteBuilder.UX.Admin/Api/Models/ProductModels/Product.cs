using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels
{

    //  [DataContract]
    //public class BundledProduct
    //{
        
    //}



    [DataContract(Namespace = "http://admin.productservice.volusion.com")]
    public class BundledProduct
    {
        [DataMember(EmitDefaultValue = false, Name = "productCode")]
        public string ProductCode { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "quantity")]
        public int Quantity { get; set; }

        /// <summary>
        /// The list price.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "salePrice")]
        public decimal? SalePrice { get; set; }

        /// <summary>
        /// The price.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "price")]
        public decimal? Price { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "productName")]
        public string ProductName { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "packageHeight")]
        public decimal? PackageHeight { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "packageWidth")]
        public decimal? PackageWidth { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "packageLength")]
        public decimal? PackageLength { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "packageWeight")]
        public decimal? PackageWeight { get; set; }
    }


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

        [DataMember(EmitDefaultValue = false, IsRequired = false, Name = "bundledProducts")]
        public List<BundledProduct> BundledProducts { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "publishedState")]
        public string PublishedState { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "lastModifiedBy")]
        public string LastModifiedBy { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "lastModifiedDate")]
        public DateTime? LastModifiedDate { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "lastPublishedBy")]
        public string LastPublishedBy { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "lastPublishedDate")]
        public DateTime? LastPublishedDate { get; set; }



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


        [DataMember(EmitDefaultValue = false, Name = "manageStock")]
        public bool? ManageStock { get; set; }

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

        /// <summary>
        /// A collection of images for this product.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "productImages")]
        public List<ProductLocalizedImage> ProductImages { get; set; }

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


        [DataMember(EmitDefaultValue = false, IsRequired = false, Name = "properties")]
        public List<ProductProperty> Properties { get; set; }

        [DataMember(EmitDefaultValue = false, IsRequired = false, Name = "extras")]
        public List<ProductExtra> Extras { get; set; }


        [DataMember(EmitDefaultValue = false, IsRequired = false, Name = "options")]
        public List<ProductProperty> Options { get; set; }

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



        [DataMember(EmitDefaultValue = false, Name = "stockOnHandAdjustment")]
        public StockOnHandAdjustment StockOnHandAdjustment { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "productTypeId")]
        public int? ProductTypeId { get; set; }
        

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
        [DataMember(EmitDefaultValue = false, Name = "metaTitle")]
        public string MetaTagTitle { get; set; }

        /// <summary>
        /// The HTML metatag description.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "metaDescription")]
        public string MetaTagDescription { get; set; }

        /// <summary>
        /// The HTML metatag keywords.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "metaKeywords")]
        public string MetaTagKeywords { get; set; }

        /// <summary>
        /// An SEO friendly URL.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "slug")]
        public string SEOFriendlyUrl { get; set; }

        #endregion

        [DataMember(EmitDefaultValue = false, IsRequired = false, Name = "variationOptions")]
        public List<ProductVariationOption> VariationOptions { get; set; }

        /// <summary>
        /// A collection of site-specific overrides for this product.
        /// </summary>
        [DataMember(EmitDefaultValue = false, Name = "productInCatalogs")]
        public List<ProductInCatalogInfo> ProductInCatalogs { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "masterCatalogId")]
        public int? MasterCatalogId { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "outOfStockBehavior")]
        public string OutOfStockBehavior { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "productUsage")]
        public string ProductUsage { get; set; }

        [DataMember(Name = "hasConfigurableOptions")]
        public bool HasConfigurableOptions { get; set; }
        
        [DataMember(Name = "hasStandaloneOptions")]
        public bool HasStandaloneOptions { get; set; }
    }
}
