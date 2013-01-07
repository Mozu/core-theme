using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Shipping
{
    [DataContract]
    public class FlatPerCartShippingRate
    {
        [DataMember(Name="price")]
        public ShippingRatePrice Price { get; set; }
    }
}