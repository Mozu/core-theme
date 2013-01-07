using System;
using System.Collections.Generic;
using System.Web.Mvc;
using Mozu.SiteBuilder.UX.Models.ModelMetaData;


namespace Mozu.SiteBuilder.UX.Models.StoreFront.Catalog
{
    public class Product : ModelBase, IModelMetadataParentContainer
    {
        [AlternateName("detailsUrl")]
        public string Url
        {
            get
            {
                return "/product/" + this.ProductCode;

            }
        }

        [AlternateName("code")]
        [AdditionalMetadata("fieldName", "productCode")]
        [AdditionalMetadata("showLabel", false)]
        public string ProductCode { get; set; }

        public string BaseProductCode { get; set; }

        [AlternateName("name")]
        [AdditionalMetadata("fieldName", "productName")]
        [AdditionalMetadata("showLabel", true)]
        [AdditionalMetadata("fieldLabel", "Product Name Edit")]
        [AdditionalMetadata("fieldType", "text")]
        public string ProductName { get; set; }

        [AlternateName("fullDescription")]
        [AdditionalMetadata("fieldName", "productFullDescription")]
        [AdditionalMetadata("showLabel", false)]
        [AdditionalMetadata("fieldType", "html")]
        public string ProductFullDescription { get; set; }

        
        
        [AdditionalMetadata("fieldName", "productShortDescription")]
        [AdditionalMetadata("showLabel", false)]
        [AdditionalMetadata("fieldType", "html")]
        public string ProductShortDescription { get; set; }

        public string MetaTagTitle { get; set; }
        public string MetaTagDescription { get; set; }
        public string MetaTagKeywords { get; set; }

        [AdditionalMetadata("fieldName", "seoFriendlyUrl")]
        public string SEOFriendlyUrl { get; set; }

        [AlternateName("images")]
        [AdditionalMetadata("fieldType", "productImage")]
        [AdditionalMetadata("fieldName", "productImages")]
        public ProductImageCollection ProductImages { get; set; }
        [AlternateName("isPurchasable")]
        public bool IsPurchasable { get; set; }
        public string PurchasableMessage { get; set; }
        public bool? IsActive { get; set; }


        public ProductPrice Price { get; set; }

        public string ProductType { get; set; }
        public bool IsTaxable { get; set; }
        public int? AttributeSetId { get; set; }
        public bool IsRecurring { get; set; }
        public bool ManageStock { get; set; }
        public bool IsBackOrderAllowed { get; set; } 
        public int? StockOnHand { get; set; }
        public bool IsHiddenWhenOutOfStock { get; set; }
        public DateTime CreateDate { get; set; }
        public long? UPC { get; set; }
        public List<Category> Categories { get; set; }
        public bool FreeShipping { get; set; }
        public UnitOfMeasure PackageHeight { get; set; }
        public UnitOfMeasure PackageWidth { get; set; }
        public UnitOfMeasure PackageLength { get; set; }
        public UnitOfMeasure PackageWeight { get; set; }
        public List<ProductAttribute> Attributes { get; set; }
        public List<ProductOption> Options { get; set; }
       
        private Dictionary<string, ModelMetadata> _metaDataDictionary;

        public ModelMetadata GetModelMetadata(string propertyName)
        {
            if (_metaDataDictionary == null)
            {
                _metaDataDictionary = new Dictionary<string, ModelMetadata>();
            }

            ModelMetadata metaData;

            if (_metaDataDictionary.TryGetValue(propertyName, out metaData))
            {
                return metaData;
            }

            var prop = this.GetAlternateNamedProperty(propertyName);
            if (prop == null)
            {
                _metaDataDictionary[propertyName] = null;
                return null;
            }

            metaData = ModelMetadataProviders.Current.GetMetadataForProperty(() => prop.GetValue(this, null), this.GetType(), prop.Name );

            if ( !metaData.AdditionalValues.ContainsKey ("fieldType") )
            {
                metaData.AdditionalValues["fieldType"] = "text";
            }
            if (!metaData.AdditionalValues.ContainsKey("fieldName"))
            {
                //todo: turn off editing.
            }

            //mmd.AdditionalValues["productId"] = this.ProductId;
            metaData.AdditionalValues["productCode"] = this.ProductCode;
            metaData.AdditionalValues["entityType"] = "product";

            _metaDataDictionary[propertyName] = metaData;
            return metaData;
        }


       
    }
}
