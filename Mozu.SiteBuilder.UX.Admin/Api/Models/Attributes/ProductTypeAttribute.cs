using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes
{
    [DataContract]
    public class ProductTypeAttribute
    {
        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "productTypeId")]
        public int ProductTypeId { get; set; }

        [DataMember(Name = "index")]
        public int Index { get; set; }

        [DataMember(Name = "isRequired")]
        public bool IsRequired { get; set; }

        [DataMember(Name = "allowMulti")]
        public bool AllowMulti { get; set; }

        [DataMember(Name = "isHidden")]
        public bool IsHidden { get; set; }

        [DataMember(Name = "isLocked")]
        public bool IsLocked { get; set; }

        [DataMember(Name = "selectedValues")]
        public List<int> SelectedValues { get; set; }

        [DataMember(Name = "allValues")]
        public List<AttributeValue> AllValues { get; set; }

    

        [DataMember(Name = "usageTypes")]
        [JsonConverter(typeof(StringEnumConverter))]
        public List<ProductTypeAttributeUsageType> UsageTypes { get; set; }

        [DataMember(Name = "attributeName")]
        public string AttributeName  { get; set; }


        [DataMember(Name = "attributeInputTypes")]
        public AttributeInputType[] AttributeInputTypes { get; set; }
    }
}       