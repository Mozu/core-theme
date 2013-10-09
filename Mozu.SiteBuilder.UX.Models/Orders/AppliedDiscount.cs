using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Orders
{
    [DataContract]
    public class AppliedDiscount : ModelBase
    {
        [DataMember(Name = "Impact")]
        public decimal Impact { get; set; }

        [DataMember(Name = "Discount")]
        public Discount Discount { get; set; }

        [DataMember(Name = "CouponCode")]
        public string CouponCode { get; set; }
    }
}