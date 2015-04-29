using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using Mozu.Core.Api.Descriptor;
using Mozu.Core.Extensions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.UX.Models.Settings
{
    [DataContract]
    public class IpBlockingSettings : ModelBase
    {
        [DataMember(Name = "DownloadDate")]
        public DateTime? DownloadDate { get; set; }

        [DataMember(Name = "IsEnabled")]
        public bool Enabled { get; set; }

        [DataMember(Name = "IPAddress")]
        public string IpAddress { get; set; }
    }

}