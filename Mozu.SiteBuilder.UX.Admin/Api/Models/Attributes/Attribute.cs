using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes
{
    [DataContract]
    public class Attribute
    {
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

         [JsonConverter(typeof(StringEnumConverter))]
        [DataMember(Name = "inputType")]
        public AttributeInputType InputType { get; set; }

         [JsonConverter(typeof(StringEnumConverter))]
        [DataMember(Name = "dataType")]
        public AttributeDataType DataType { get; set; }


        [DataMember(Name = "isOption")]
        public bool IsOption { get; set; }

        [DataMember(Name = "isExtra")]
        public bool? IsExtra { get; set; }

        [DataMember(Name = "isProperty")]
        public bool? IsProperty { get; set; }


        [DataMember(Name = "valueType")]
        [JsonConverter(typeof(StringEnumConverter))]
        public AttributeValueType ValueType { get; set; }


        [DataMember(Name = "attributeMetadata")]
        public List<AttributeMetadataItem> AttributeMetadata { get; set; }

        

 

        [DataMember(Name = "min")]
        public decimal? Min { get; set; }

        [DataMember(Name = "minDate")]
        public DateTime? MinDate { get; set; }

        [DataMember(Name = "max")]
        public decimal? Max { get; set; }

        [DataMember(Name = "maxDate")]
        public DateTime? MaxDate { get; set; }

        [DataMember(Name = "regex")]
        public string Regex { get; set; }

         [DataMember(Name = "adminName")]
        public string AdminName { get; set; }

        [DataMember(Name = "values")]
        public List<AttributeValue> Values { get; set; }


    }


    [DataContract]
    public class AttributeMetadataItem
    {
        [DataMember(EmitDefaultValue = false, Name="key")]
        public string Key { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "value")]
        public string Value { get; set; }
    }
}