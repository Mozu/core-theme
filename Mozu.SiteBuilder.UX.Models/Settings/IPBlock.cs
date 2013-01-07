using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Settings
{
    [DataContract]
    public class IPBlock
    {
        [DataMember(Name = "id")]
        public int? Id { get; set; }

        [DataMember(Name = "start")]
        public string RangeStart { get; set; }

        [DataMember(Name = "end")]
        public string RangeEnd { get; set; }
    }
}