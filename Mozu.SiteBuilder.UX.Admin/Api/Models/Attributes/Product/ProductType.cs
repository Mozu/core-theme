using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Product
{
    
    public class ProductType
    {
        public int? Id { get; set; }

        public string Name { get; set; }

        public bool IsBase { get; set; }
        
        public string GoodsType { get; set; }

        [JsonProperty(PropertyName = "numberOfProducts")]
        public int? ProductCount { get; set; }

        public List<ProductTypeAttribute> Options { get; set; }

        public List<ProductTypeAttribute> Extras { get; set; }

        public List<ProductTypeAttribute> Properties { get; set; }

        public DateTime? ModifiedDate { get; set; }



        /// <summary>
        /// List of ProductUsages supported by the ProductType.
        /// </summary>
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public List<String> ProductUsages { get; set; }

    }
}
