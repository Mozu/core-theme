using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.PriceLists
{
    public class PriceListEntryExtra
    {
        /// <summary>
        /// AttributeFQN of the extra
        /// </summary>
        [JsonProperty(PropertyName = "attributeFqn")]
        public string AttributeFQN { get; set; }

        // below are read only
        public string AttributeCode { get; set; }

        public string AttributeName { get; set; }

        /// <summary>
        /// value extra
        /// </summary>
        public string DisplayValue { get; set; }

        public string Value { get; set; }

        /// <summary>
        /// Existing value of the extra
        /// </summary>
        public decimal? CatalogPrice { get; set; }

        public decimal? OverridePrice { get; set; }
    }
}