using System.Collections.Generic;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Product
{
    
    public class ProductTypeAttribute
    {
        public string AttributeFQN { get; set; }

        public int? ProductTypeId { get; set; }

        public int? Index { get; set; }

        public bool? IsRequired { get; set; }

        public bool? AllowMulti { get; set; }

        public bool? IsHidden { get; set; }

        public bool? IsLocked { get; set; }

        public List<AttributeValue> SelectedValues { get; set; }

        public List<AttributeValue> AllValues { get; set; }

        public string DataType { get; set; }

        public string InputType { get; set; }

        public string AdminName { get; set; }

        public string AttributeName { get; set; }

        public List<AttributeMetadataItem> AttributeMetadata { get; set; }

        public int Order { get; set; }
    }
}       
