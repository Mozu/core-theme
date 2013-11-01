using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes
{
    [DataContract]
    public class ProductTypeAttribute
    {
        [DataMember(Name = "attributeFQN")]
        public string AttributeFQN { get; set; }

        [DataMember(Name = "productTypeId")]
        public int? ProductTypeId { get; set; }

        [DataMember(Name = "index")]
        public int? Index { get; set; }

        [DataMember(Name = "isRequired")]
        public bool? IsRequired { get; set; }

        [DataMember(Name = "allowMulti")]
        public bool? AllowMulti { get; set; }

        [DataMember(Name = "isHidden")]
        public bool? IsHidden { get; set; }

        [DataMember(Name = "isLocked")]
        public bool? IsLocked { get; set; }

        [DataMember(Name = "selectedValues")]
        public List<AttributeValue> SelectedValues { get; set; }

        [DataMember(Name = "allValues")]
        public List<AttributeValue> AllValues { get; set; }

        [DataMember(Name="dataType")]
        public string DataType { get; set; }

        [DataMember(Name = "inputType")]
        public string InputType { get; set; }

        [DataMember(Name = "attributeName")]
        public string AttributeName { get; set; }


        [DataMember(Name = "attributeMetadata")]
        public List<AttributeMetadataItem> AttributeMetadata { get; set; }
    }
}       