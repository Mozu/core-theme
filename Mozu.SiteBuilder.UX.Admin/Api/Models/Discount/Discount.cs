using System;
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

        /// <summary>
        /// Target type.
        /// Valid values are "FreeShipping", "Order", "Product", and "AllProducts".
        /// </summary>
        [DataMember(Name = "targetType")]
        public string TargetType { get; set; }

        /// <summary>
        /// List of categories this discount applies to.
        /// </summary>
        [DataMember(Name = "categories")]
        public List<int> Categories { get; set; }

        /// <summary>
        /// List of products this discount applies to.
        /// </summary>
        [DataMember(Name = "products")]
        public List<string> Products { get; set; }

        /// <summary>
        /// List of shipping methods this discount applies to.
        /// </summary>
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

        /// <summary>
        /// Amount type.
        /// Valid values are "Percentage", "Amount", and "FreeShipping".
        /// </summary>
        [DataMember(Name = "amountType")]
        public string AmountType { get; set; }

        [DataMember(Name = "startDate")]
        public DateTime? StartDate { get; set; }

        [DataMember(Name = "endDate")]
        public DateTime? EndDate { get; set; }

        /// <summary>
        /// Status. Set by the service.
        /// Values are "Ended", "Scheduled", or "Active".
        /// </summary>
        [DataMember(Name = "status")]
        public string Status { get; set; }

        // Flattened
        [DataMember(Name = "name")]
        public string Name { get; set; }
    }
}