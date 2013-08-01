using System;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    [DataContract]
    public class ShippingDiscount
    {
        [DataMember(Name="discountId")]
        public int DiscountId { get; set; }

        [DataMember(Name="methodCode")]
        public string MethodCode { get; set; }

        [DataMember(Name = "description")]
        public string Description { get; set; }

        [DataMember(Name = "total")]
        public decimal Total { get; set; }

        [DataMember(Name = "couponCode")]
        public string CouponCode { get; set; }

        [DataMember(Name = "isActive")]
        public bool IsActive { get; set; }
    }
}
