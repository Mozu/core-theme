using System;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels
{
    
    public class ProductLocalizedImage
    {
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string ProductCode { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "alt")]
        public string Alt { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string CmsId { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "isoCultureCode")]
        public string ISOCultureCode { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string VideoUrl { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public int? Sequence { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "id")]
        public int? ImageId { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "url")]
        public string ImageUrl { get; set; }
    }
}
