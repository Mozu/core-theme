using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.StoreFront.Cart
{
    [DataContract]
    public class CartItem
    {
        [DataMember(Name = "Id")]
        public string Id { get; set; }

        [DataMember(Name = "Product")]
        public Product Product { get; set; }

        [DataMember(Name = "UnitPrice")]
        public CartItemPrice UnitPrice { get; set; }

        [DataMember(Name = "Quantity")]
        public int Quantity { get; set; }

        [DataMember(Name = "Subtotal")]
        public decimal? SubTotal { get; set; }

        [DataMember(Name = "DiscountTotal")]
        public decimal? DiscountTotal { get; set; }

        [DataMember(Name = "TaxableTotal")]
        public decimal? TaxableTotal { get; set; }

        [DataMember(Name = "FeeTotal")]
        public decimal? FeeTotal { get; set; }

        [DataMember(Name = "Total")]
        public decimal? Total { get; set; }
    }
}
