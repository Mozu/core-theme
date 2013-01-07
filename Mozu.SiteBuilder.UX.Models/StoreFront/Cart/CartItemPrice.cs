using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.StoreFront.Cart
{
    [DataContract]
    public class CartItemPrice
    {
        [DataMember(Name = "baseAmount")]
        public decimal BaseAmount { get; set; }

        [DataMember(Name = "discountAmount")]
        public decimal? DiscountAmount { get; set; }

        [DataMember(Name = "preTaxAmount")]
        public decimal PreTaxAmount { get; set; }

        [DataMember(Name = "taxAmount")]
        public decimal? TaxAmount { get; set; }

        [DataMember(Name = "fees")]
        public List<Fee> Fees { get; set; }

        [DataMember(Name = "finalAmount")]
        public decimal FinalAmount { get; set; }

        [DataMember(Name = "shippingAmount")]
        public decimal? ShippingAmount { get; set; }
    }
}
