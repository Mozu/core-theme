using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Shipping
{
    [DataContract]
    public class ShippingRatePrice
    {
        [DataMember(Name="amount")]
        public decimal? Amount { get; set; }

        [DataMember(Name = "isAmountPercent")]
        public bool? IsAmountPercent { get; set; }

        [DataMember(Name = "isoCurrencyCode")]
        public string ISOCurrencyCode { get; set; }
    }
}