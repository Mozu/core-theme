using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.StoreFront.Cart
{
    [DataContract]
    public class CartItemPrice
    {
        [DataMember(Name = "BaseAmount")]
        public decimal BaseAmount { get; set; }

        [DataMember(Name = "DiscountAmount")]
        public decimal? DiscountAmount { get; set; }

        [DataMember(Name = "DiscountedAmount")]
        public decimal? DiscountedAmount { get; set; }

        [DataMember(Name = "ListAmount")]
        public decimal? ListAmount { get; set; }

        [DataMember(Name = "SaleAmount")]
        public decimal? SaleAmount { get; set; }
    }
}
