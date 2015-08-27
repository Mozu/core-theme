using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels
{
    
    public class ProductProperty
    {
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string AttributeFQN { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public List<object> Values { get; set; }

        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore, PropertyName = "exists")]
        public bool? VariationExists { get; set; }
    }


  //  
   
    ////public class ProductPropertyValue
    ////{
	////	[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
    ////    public object Value { get; set; }

	////	[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
    ////    public string LocalizedValue { get; set; }

        
    ////}
}
