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
        public int Id { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "inputType")]
        public AttributeInputType InputType { get; set; }

        [DataMember(Name = "dataType")]
        public AttributeDataType DataType { get; set; }

        [DataMember(Name = "valueType")]
        public string ValueType { get; set; }

        [DataMember(Name = "usageTypes")]
        [JsonConverter(typeof(StringEnumConverter))]
        public List<ProductTypeAttributeUsageType> UsageTypes { get; set; }

        [DataMember(Name = "min")]
        public object Min { get; set; }

        [DataMember(Name = "max")]
        public object Max { get; set; }

        [DataMember(Name = "regex")]
        public string Regex { get; set; }
    }
}