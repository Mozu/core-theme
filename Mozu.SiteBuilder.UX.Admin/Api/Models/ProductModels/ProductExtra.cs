using System.Collections.Generic;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Product;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels
{
    //
    //public class ProductExtraValueDeltaPrice
    //{
	//	[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
    //    public string CurrencyCode { get; set; }

	//	[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
    //    public decimal DeltaPrice { get; set; }
    //}

    
    public class ProductExtraValue
    {
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public object Value { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public decimal DeltaPrice { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public decimal? DeltaWeight { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? IsDefaulted { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "detail")]
        public AttributeVocabularyValue AttributeVocabularyValueDetail { get; set; }


         [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public int? Quantity { get; set; }
    }

    
    public class ProductExtra
    {
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string AttributeFQN { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? IsRequired { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? IsMultiSelect { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public List<ProductExtraValue> Values { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "detail")]
        public Attribute AttributeDetail { get; set; }
    }
}
