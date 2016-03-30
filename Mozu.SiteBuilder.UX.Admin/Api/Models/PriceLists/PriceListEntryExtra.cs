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

        /// <summary>
        /// value extra
        /// </summary>
        public object Value { get; set; }

        /// <summary>
        /// overriden value of the extra
        /// </summary>
        public decimal DeltaPrice { get; set; }

        // below are read only
        public string AttributeCode { get; set; }

        public string AttributeName { get; set; }

        public string StringValue { get; set; }
    }
}