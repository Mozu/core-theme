using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using System.Web;
using Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Facets
{
    
    public class FacetSet
    {
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public List<Facet> Configured { get; set; }



		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public int CategoryId { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public List<FacetSource> Available { get; set; }
    }
    
    public class Facet
    {
       
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName ="id")]
        public int? FacetId { get; set; }



		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string  SourceId { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string SourceName { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string SourceType { get; set; }
        
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string SourceDataType { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string FacetType { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public int Order { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public int CategoryId { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public int? OverrideFacetId { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "isInheritedHidden")]
        public bool IsHidden { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "isvalid")]
        public bool ValidityIsValid { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "validityCode")]
        public string ValidityReasonCode { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "ranges")]
        public List<FacetRangeQuery> RangeQueries { get; set; }


		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? AllowsRangeQuery { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string ValueSortType { get; set; }       
    }
    
    public class FacetRangeQuery
    {
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "start")]
        public object RangeValueStart { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "end")]
        public object RangeValueEnd { get; set; }
    }

    
    public class FacetSource
    {
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "sourceId")]
        public string Id { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "sourceType")]
        public string Type { get; set; }
        
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "sourceDataType")]
        public string DataType { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "sourceName")]
        public string Name { get; set; }


		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? AllowsRangeQuery { get; set; }

        
    }
}
