using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Orders
{
    [DataContract]
    public class AppliedDiscount : ModelBase
    {
        [DataMember(Name = "impact")]
        public decimal Impact { get; set; }

        [DataMember(Name = "discount")]
        public Discount Discount { get; set; }

        [DataMember(Name = "couponCode")]
        public string CouponCode { get; set; }
    }
}