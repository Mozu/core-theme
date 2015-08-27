using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json;
using System.Xml.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels
{
    
    public class StockOnHandAdjustment
    {
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Type { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public int Value { get; set; }
    }

    
    public class UnitOfMeasure
    {
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Symbol { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public decimal? Val { get; set; }
    }
}
