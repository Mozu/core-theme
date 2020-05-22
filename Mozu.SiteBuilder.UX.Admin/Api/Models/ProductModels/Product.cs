using System;
using System.Collections.Generic;
using Mozu.Location.Contracts;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels
{

    //  
    //public class BundledProduct
    //{
        
    //}

    
    public class LocationWithInventory : Mozu.ProductAdmin.Contracts.LocationInventory
    {
        [JsonProperty(PropertyName = "location")]
        public Mozu.Location.Contracts.Location Location { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public FulfillmentType Fulfillment { get; set; }
    }

    //[DataContract(Namespace = "http://admin.productservice.volusion.com")]
    public class BundledProduct
    {
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string ProductCode { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public int Quantity { get; set; }

        /// <summary>
        /// The list price.
        /// </summary>
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public decimal? SalePrice { get; set; }

        /// <summary>
        /// The price.
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public decimal? Price { get; set; }
		
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string ProductName { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public decimal? PackageHeight { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public decimal? PackageWidth { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public decimal? PackageLength { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public decimal? PackageWeight { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string[] FulfillmentTypesSupported { get; set; }
    }


    /// <summary>
    /// Represents an editable product.
    /// See http://vconfluence.ads.volusion.com/display/Product/Product+-+v1#Product-v1-ProductDetails
    /// </summary>
    
    public class Product : IProductWithImages
    {
        #region General
        /// <summary>
        /// The user-specified identifier of this product.
        /// </summary>
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string ProductCode { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public List<BundledProduct> BundledProducts { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string PublishedState { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string LastModifiedBy { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public DateTime? LastModifiedDate { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string LastPublishedBy { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public DateTime? LastPublishedDate { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string PublishSetCode { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string PublishSetName { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public DateTime? PublishSetDate { get; set; }


        /// <summary>
        /// The parent product code, if any.
        /// </summary>
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string BaseProductCode { get; set; }

        /// <summary>
        /// Universal Product Code
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "upc")]
        public string UPC { get; set; }

        /// <summary>
        /// The product name.
        /// </summary>
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string ProductName { get; set; }


		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? ManageStock { get; set; }

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

        /// <summary>
        /// A collection of images for this product.
        /// </summary>
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public List<ProductLocalizedImage> ProductImages { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public List<ProductImageGroup> ProductImageGroups { get; set; }

        #endregion

        #region Price

        /// <summary>
        /// Is taxable
        /// </summary>
        [JsonProperty(PropertyName = "isTaxable")]
        public bool IsTaxable { get; set; }

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
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "mapStartDate" )]
        public DateTime? MAPStartDate { get; set; }

        /// <summary>
        /// Minimum Advertised Price End Date
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "mapEndDate")]
        public DateTime? MAPEndDate { get; set; }

        /// <summary>
        /// Gift Card value or credit value.
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public decimal? CreditValue { get; set; }

        #endregion


        #region Supplier Info

        /// <summary>
        /// Manufacturer Part Number
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string MfgPartNumber { get; set; }

        /// <summary>
        /// Distributor Part Number
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string DistPartNumber { get; set; }

        /// <summary>
        /// Cost Currency Code
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string CostCurrencyCode { get; set; }

        /// <summary>
        /// Cost
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public decimal? Cost { get; set; }

        #endregion

        #region Restricted Discounts
        /// <summary>
        /// Default is false, when true dates may apply, null dates mean beginning/end of time
        /// </summary>
        public bool DiscountsRestricted { get; set; }

        /// <summary>
        /// If discount restricted, then start date of restriction or null to indicate indefinite
        /// </summary>
        public DateTime? DiscountsRestrictedStartDate { get; set; }

        /// <summary>
        /// If discount restricted, then end date of restriction or null to indicate indefinite
        /// </summary>
        public DateTime? DiscountsRestrictedEndDate { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string VariationPricingMethod { get; set; }

        #endregion

        #region Properties

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public List<ProductProperty> Properties { get; set; }

        #endregion

        #region Extras

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public List<ProductExtra> Extras { get; set; }

        #endregion

        #region Options

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public List<ProductProperty> Options { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public List<ProductVariationOption> VariationOptions { get; set; }

        public bool IsVariation { get; set; }

        public bool HasConfigurableOptions { get; set; }

        public bool HasStandaloneOptions { get; set; }

        #endregion

        #region Inventory
        // TODO: track inventory

        /// <summary>
        /// Quantity of inventory.
        /// </summary>
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public int? StockOnHand { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public StockOnHandAdjustment StockOnHandAdjustment { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public int? ProductTypeId { get; set; }

        public string ProductTypeName { get; set; }
        

        /// <summary>
        /// Hide when out of stock.
        /// </summary>
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? IsHiddenWhenOutOfStock { get; set; }

        // TODO: (boolean) show out of stock message selected

        /// <summary>
        /// Allow back-orders.
        /// </summary>
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? IsBackOrderAllowed { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string OutOfStockBehavior { get; set; }

        // TODO: low stock threshold

        #endregion

        #region Shipping
        /// <summary>
        /// The shipping weight.
        /// </summary>
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public decimal? PackageWeight { get; set; }

        /// <summary>
        /// The package length.
        /// </summary>
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public decimal? PackageLength { get; set; }

        /// <summary>
        /// The package width.
        /// </summary>
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public decimal? PackageWidth { get; set; }

        /// <summary>
        /// The package height.
        /// </summary>
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public decimal? PackageHeight { get; set; }

        /// <summary>
        /// Fulfillment Types Supported: DirectShip, InStorePickup, Digital
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string[] FulfillmentTypesSupported { get; set; }

        [JsonProperty(PropertyName = "isPackagedStandAlone")]
        public bool? IsPackagedStandAlone { get; set; }


        [JsonProperty(PropertyName = "standAlonePackageType")]
        public string StandAlonePackageType{ get; set; }


        #endregion

        #region SEO

        /// <summary>
        /// The HTML metatag title.
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "metaTitle")]
        public string MetaTagTitle { get; set; }

        /// <summary>
        /// The HTML metatag description.
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "metaDescription")]
        public string MetaTagDescription { get; set; }

        /// <summary>
        /// The HTML metatag keywords.
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "metaKeywords")]
        public string MetaTagKeywords { get; set; }

        /// <summary>
        /// An SEO friendly URL.
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "slug")]
        public string SEOFriendlyUrl { get; set; }

        #endregion

        #region Catalogs

        /// <summary>
        /// A collection of site-specific overrides for this product.
        /// </summary>
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public List<ProductInCatalogInfo> ProductInCatalogs { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public int? MasterCatalogId { get; set; }

        #endregion

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string ProductUsage { get; set; }




        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string SlicingAttributeFQN { get; set; }

    }
}
