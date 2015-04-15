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
    public class IpBlocking : ModelBase
    {
        [DataMember(Name = "DownloadDate")]
        public string DownloadDate { get; set; }

        [DataMember(Name = "IsEnabled")]
        public bool IsEnabled { get; set; }

        [DataMember(Name = "IPAddress")]
        public string IpAddress { get; set; }
    }

}