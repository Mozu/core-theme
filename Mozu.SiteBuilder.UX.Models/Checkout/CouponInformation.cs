using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Checkout
{
    [DataContract]
    public class CouponInformation : CheckoutInformation
    {
        [DataMember(Name = "couponCode")]
        public string CouponCode { get; set; }
    }
}