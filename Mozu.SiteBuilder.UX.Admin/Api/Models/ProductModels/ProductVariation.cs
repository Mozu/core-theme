using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using System.Web;
using Newtonsoft.Json.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels
{

    public class ProductVariation
    {
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? IsActive { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? IsOrphan { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "exists")]
        public bool? VariationExists { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "key")]
        public string Variationkey { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "productCode")]
        public string VariationProductCode { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "deltaPrice")]
        public Decimal? DeltaPriceValue { get; set; }

        /// <summary>
        /// MSRP of delta pricing
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "deltaMsrp")]
        public Decimal? DeltaMSRP { get; set; }

        /// <summary>
        /// Gift Card value or credit value.
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public decimal? CreditValue { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Decimal? DeltaWeight { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public int? StockOnHand { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public int? StockOnOrder { get; set; }

        /// <summary>
        /// Supported Fulfillment Types
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string[] FulfillmentTypesSupported { get; set; }

        /// <summary>
        /// Price Lookup Unit
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "upc")]
        public string UPC { get; set; }

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
        public decimal? DeltaCost { get; set; }

        #endregion

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public List<ProductVariationOption> Options { get; set; }
    }

    public class ProductVariationOption
    {
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string AttributeFQN { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public object Value { get; set; }

        //[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        //public AttributeVocabularyValueLocalizedContent Content { get; set; }
    }
}