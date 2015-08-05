namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Discount
{
    public class Coupon
    {
        public int CouponSetId { get; set; }

        /// <summary>
        ///     Link to associated coupon
        /// </summary>
        public string CouponSetCode { get; set; }

        /// <summary>
        ///     The code the customer uses to claim this coupon
        /// </summary>
        public string CouponCode { get; set; }

        /// <summary>
        ///     Total number of times this code has been redeemed. ReadOnly, calculated.
        ///     Only returned with response group includeCounts
        /// </summary>
        public int? RedemptionCount { get; set; }
    }
}