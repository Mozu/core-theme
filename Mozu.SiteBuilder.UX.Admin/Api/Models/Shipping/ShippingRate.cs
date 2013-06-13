using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Shipping
{
    
    public class ShippingRate
    {
        public string name { get; set; }
        public string type { get; set; }
        public string isActive { get; set; }
        public int? sequence { get; set; }
        public float? amount { get; set; }
    }
}