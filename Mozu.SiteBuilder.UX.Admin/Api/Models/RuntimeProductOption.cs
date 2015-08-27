using System;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models
{
    
    public class RuntimeProductOptions
    {
        
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
