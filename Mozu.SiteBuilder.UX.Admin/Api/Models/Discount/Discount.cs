using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Discount
{
    [DataContract]
    public class Discount
    {
        [DataMember(Name = "discountId")]
        public int? DiscountId { get; set; }

        [DataMember(Name = "minimumOrderAmount")]
        public decimal? MinimumOrderAmount { get; set; }

        [DataMember(Name = "targetType")]
        public string TargetType { get; set; }

        [DataMember(Name = "categories")]
        public List<int> Categories { get; set; }

        [DataMember(Name = "products")]
        public List<string> Products { get; set; }

        [DataMember(Name = "shippingMethods")]
        public List<string> ShippingMethods { get; set; }

        [DataMember(Name = "maxRedemptionCount")]
        public int? MaxRedemptionCount { get; set; }

        [DataMember(Name = "currentRedemptionCount")]
        public int? CurrentRedemptionCount { get; set; }

        [DataMember(Name = "requiresCoupon")]
        public bool RequiresCoupon { get; set; }

        [DataMember(Name = "couponCode")]
        public string CouponCode { get; set; }

        [DataMember(Name = "amount")]
        public decimal? Amount { get; set; }

        [DataMember(Name = "amountType")]
        public string AmountType { get; set; }

        [DataMember(Name = "startDate")]
        public string StartDate { get; set; }

        [DataMember(Name = "endDate")]
        public string EndDate { get; set; }

        [DataMember(Name = "status")]
        public string Status { get; set; }

        // Flattened
        [DataMember(Name = "name")]
        public string Name { get; set; }
    }
}