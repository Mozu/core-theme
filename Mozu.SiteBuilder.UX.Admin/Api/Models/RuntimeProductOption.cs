using System;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models
{
    [DataContract]
    public class RuntimeProductOptions
    {
        [DataContract]
        public class AttributeDetail
        {
            public string Name { get; set; }
            public string UsageType { get; set; }
            public string ValueType { get; set; }
            public string InputType { get; set; }
            public string Description { get; set; }
        }
    }
}
