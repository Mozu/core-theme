using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.StoreFront.Cart
{
    [DataContract]
    public class CartItem
    {
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name = "product")]
        public Product Product { get; set; }

        [DataMember(Name = "unitPrice")]
        public CartItemPrice UnitPrice { get; set; }

        [DataMember(Name = "quantity")]
        public int Quantity { get; set; }

        [DataMember(Name = "subTotal")]
        public decimal? SubTotal { get; set; }

        [DataMember(Name = "discountTotal")]
        public decimal? DiscountTotal { get; set; }

        [DataMember(Name = "taxTotal")]
        public decimal? TaxTotal { get; set; }

        [DataMember(Name = "feeTotal")]
        public decimal? FeeTotal { get; set; }

        [DataMember(Name = "total")]
        public decimal? Total { get; set; }
    }
}
