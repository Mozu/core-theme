using System.Collections.Generic;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.GeneralSettings
{
    
    public class IPBlock
    {
        [JsonProperty(PropertyName = "start")]
        public string RangeStart { get; set; }

        [JsonProperty(PropertyName = "end")]
        public string RangeEnd { get; set; }

        public int? SiteId { get; set; }
    }
}
