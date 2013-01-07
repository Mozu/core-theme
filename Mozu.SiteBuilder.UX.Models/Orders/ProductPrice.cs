using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Orders
{
    [DataContract]
    public class ProductPrice : ModelBase
    {
        [DataMember(Name = "price")]
        public decimal? Price { get; set; }

        [DataMember(Name = "salePrice")]
        public decimal? SalePrice { get; set; }

        [DataMember(Name = "discount")]
        public AppliedDiscount Discount { get; set; }
    }
}
