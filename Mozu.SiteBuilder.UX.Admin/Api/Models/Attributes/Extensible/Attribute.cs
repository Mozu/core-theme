using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Extensible
{
    
    public class Attribute
    {
        public string Id { get; set; }

        public int? AttributeId { get; set; }



        [JsonProperty(PropertyName = "code")]
        public string AttributeCode { get; set; }

        public string Name { get; set; }

         [JsonConverter(typeof(StringEnumConverter))]
        public AttributeInputType InputType { get; set; }

         [JsonConverter(typeof(StringEnumConverter))]
        public AttributeDataType DataType { get; set; }


        public bool IsOption { get; set; }

        public bool? IsExtra { get; set; }

        public bool? IsProperty { get; set; }

        public bool? IsActive { get; set; }
        public bool IsRequired { get; set; }
        public bool IsVisible { get; set; }

        

        public string DisplayGroup { get; set; }

        [JsonConverter(typeof(StringEnumConverter))]
        public AttributeValueType ValueType { get; set; }


        public List<AttributeMetadataItem> AttributeMetadata { get; set; }

        

 

        public decimal? Min { get; set; }

        public DateTime? MinDate { get; set; }

        public decimal? Max { get; set; }

        public DateTime? MaxDate { get; set; }

        public string Regex { get; set; }

        public string AdminName { get; set; }

        public List<AttributeValue> Values { get; set; }

    }


    
    public class AttributeMetadataItem
    {
		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Key { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Value { get; set; }
    }
}
