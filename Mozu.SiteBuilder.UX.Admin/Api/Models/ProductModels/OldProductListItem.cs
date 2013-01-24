using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;
using System.Xml.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels
{
    [DataContract]
    public class OldProduct
    {    
        [DataMember(EmitDefaultValue = false, Name = "parentProductCode")]
        public string ParentProductCode { get; set; }
        
        [DataMember(EmitDefaultValue = false, Name = "inventoryHandling")]
        public int? InventoryHandling { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "optionValues")]
        public string OptionValues { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "attributeSetId")]
        public int? AttributeSetId { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "catalogIds")]
        public List<int> CatalogIds { get; set; }
        [DataMember(EmitDefaultValue = false, IsRequired = false, Name = "categoryIds")]
        public List<int> CategoryIds { get; set; }
        //[DataMember(EmitDefaultValue = false)]
        //public ProductLocalizedContent Content { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "createBy")]
        public string CreateBy { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "createDate")]
        public DateTime? CreateDate { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "isActive")]
        public bool? IsActive { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "isBackOrderAllowed")]
        public bool? IsBackOrderAllowed { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "isHiddenWhenOutOf")]
        public bool? IsHiddenWhenOutOfStock { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "isRecurring")]
        public bool? IsRecurring { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "isTaxable")]
        public bool? IsTaxable { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "manageStock")]
        public bool? ManageStock { get; set; }
        //[DataMember(EmitDefaultValue = false)]
        //public ProductPrice Price { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "productId")]
        public int? ProductId { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "productSetId")]
        public int? ProductSetId { get; set; }
        //[DataMember(EmitDefaultValue = false, Name = "productType")]
        //public string ProductType { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "productCode")]
        public string ProductCode { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "stockOnHand")]
        public int? StockOnHand { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "stockOnHandAdjustment")]
        public StockOnHandAdjustment StockOnHandAdjustment { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "upc")]
        public long? UPC { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "UpdateBy")]
        public string UpdateBy { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "updateDate")]
        public DateTime? UpdateDate { get; set; }
        
        //content
        [DataMember(EmitDefaultValue = false, Name = "contentLocaleCode")]
        public string ContentLocaleCode { get; set; }
        
        [DataMember(EmitDefaultValue = false, Name = "metaTagDescription")]
        public string MetaTagDescription { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "metaTagKeywords")]
        public string MetaTagKeywords { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "metaTagTitle")]
        public string MetaTagTitle { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "productFullDescription")]
        public string ProductFullDescription { get; set; }
        //[DataMember(EmitDefaultValue = false)]
        //public int? ProductId { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "productImages")]
        public List<ProductLocalizedImage> ProductImages { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "productName")]
        public string ProductName { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "productShortDescription")]
        public string ProductShortDescription { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "seoFriendlyUrl")]
        public string SEOFriendlyUrl { get; set; }
        
        //price
        [DataMember(EmitDefaultValue = false, Name = "isoCurrencyCode")]
        public string ISOCurrencyCode { get; set; }
        //[DataMember(EmitDefaultValue = false, Name = "isTaxAmountPercent")]
        //public bool? IsTaxAmountPercent { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "listPrice")]
        public decimal? ListPrice { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "price")]
        public decimal? Price { get; set; }
        //[DataMember(EmitDefaultValue = false)]
        //public int? ProductId { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "salePrice")]
        public decimal? SalePrice { get; set; }
        //[DataMember(EmitDefaultValue = false, Name = "taxAmount")]
        //public decimal? TaxAmount { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "hasStandAloneOptions")]
        public bool? HasStandAloneOptions { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "hasConfigurableOptions")]
        public bool? HasConfigurableOptions { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "packageHeight")]
        public decimal? PackageHeight { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "packageLength")]
        public decimal? PackageLength { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "packageWidth")]
        public decimal? PackageWidth { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "packageWeight")]
        public decimal? PackageWeight { get; set; }
    }

    [DataContract]
    public class StockOnHandAdjustment
    {
        [DataMember(EmitDefaultValue = false, Name = "type")]
        public string Type { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "value")]
        public int Value { get; set; }
    }

    [DataContract]
    public class UnitOfMeasure
    {
        [DataMember(EmitDefaultValue = false, Name = "symbol")]
        public string Symbol { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "val")]
        public decimal? Val { get; set; }
    }

    [DataContract]
    public class Discount
    {
        [DataMember(EmitDefaultValue = false, Name ="id")]
        public int? DiscountId { get; set; }   
    }
    
    [DataContract]
    public class ProductLocalizedImage
    {

        [DataMember(EmitDefaultValue = false, Name = "alt")]
        public string AltText { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "imagePath")]
        public string ImagePath { get; set; }
     
        [DataMember(EmitDefaultValue = false, Name = "isoCultureCode")]
        public string ISOCultureCode { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "productId")]
        public int? ProductId { get; set; }
        [DataMember(EmitDefaultValue = false, Name = "videoUrl")]
        public string VideoUrl { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "sequence")]
        public int? Sequence { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "id")]
        public int? ImageId { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "url")]
        public string ImageUrl { get; set; }
    }
}