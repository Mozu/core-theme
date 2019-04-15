using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels
{
    public class ProductImageGroup
    {
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string ProductImageGroupId { get; set; }


        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public List<ProductImageGroupTag> ProductImageGroupTags { get; set; }
    }

    public class ProductImageGroupTag
    {
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Fqn { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public List<string> Values { get; set; }
    }
}