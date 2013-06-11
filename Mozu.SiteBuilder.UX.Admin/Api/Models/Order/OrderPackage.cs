using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    [DataContract]
    public class OrderPackage
    {
        [DataMember(Name="id")]
        public string Id { get; set; }

        /// <summary>
        /// "NotShipped" or "Shipped"
        /// </summary>
        [DataMember(Name="status")]
        public string Status { get; set; }

        [DataMember(Name="items")]
        public List<OrderPackageItem> Items { get; set; }
    }
}
