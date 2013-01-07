using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;

namespace Mozu.SiteBuilder.UX.Models.StoreFront.Cart
{
    [DataContract]
    public class Cart
    {
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name = "isoCountryCode")]
        public string ISOCurrencyCode { get; set; }

        [DataMember(Name = "items")]
        public List<CartItem> Items { get; set; }

        [DataMember(Name = "subTotal")]
        public decimal? SubTotal { get; set; }

        [DataMember(Name = "discountTotal")]
        public decimal? DiscountTotal { get; set; }

        [DataMember(Name = "shippingTotal")]
        public decimal? ShippingTotal { get; set; }

        [DataMember(Name = "taxTotal")]
        public decimal? TaxTotal { get; set; }

        [DataMember(Name = "feeTotal")]
        public decimal? FeeTotal { get; set; }

        [DataMember(Name = "total")]
        public decimal? Total { get; set; }

        [DataMember(Name = "lastValidationDate")]
        public DateTime? LastValidationDate { get; set; }

        [DataMember(Name = "expirationDate")]
        public DateTime? ExpirationDate { get; set; }
    }
}
