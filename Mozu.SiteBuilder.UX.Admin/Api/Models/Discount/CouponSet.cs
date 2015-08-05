using System;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Discount
{
    public class CouponSet
    {

        /// <summary>
        ///     Internal unique identifier of the couponset. System-supplied and read-only.
        /// </summary>
        public int? Id { get; set; }

        /// <summary>
        ///     Unique tenant supplied identifier.
        ///     Used as the prefix for generated sets.
        ///     Required
        ///     System generated if left null.
        /// </summary>
        //[MaxLength(32)]
        public string CouponSetCode { get; set; } //See category code for generation algo.

        /// <summary>
        ///     CouponSet Name
        /// </summary>
        //[MaxLength(200)]
        public string Name { get; set; }

        /// <summary>
        ///     Determines if the coupon is a persisted list of codes (static) or a list based on generated specification
        ///     (dynamic).
        /// </summary>
        public string CouponCodeType { get; set; }

        /// <summary>
        ///     CouponSet status which can be: Active, Expired,  Inactive
        ///     System-supplied and read-only.
        /// </summary>
        public string Status { get; set; }

        /// <summary>
        ///     Signifies that the coupon has not been exported and can be updated
        ///     ReadOnly
        /// </summary>
        public bool CanBeDeleted { get; set; }

        /// <summary>
        ///     Maximum number of times any single user can redeem any code.
        ///     Must be null, >=1 or -1.
        ///     Defaults to 1 on creation if null.
        ///     -1 indicates unlimited.
        /// </summary>
        public int? MaxRedemptionsPerUser { get; set; }

        /// <summary>
        ///     Maximum number of times any code can de used.
        ///     Must be null, >=1 or -1.
        ///     Defaults to 1 on creation if null.
        ///     -1 indicates unlimited.
        /// </summary>
        public int? MaxRedemptionsPerCouponCode { get; set; }

        /// <summary>
        ///     Date and time that the coupon codes becomes expired
        /// </summary>
        public DateTime? EndDate { get; set; }

        /// <summary>
        ///     Date and time that the coupon codes becomes active
        /// </summary>
        public DateTime? StartDate { get; set; }

        #region Dynamic CouponSet Only

        /// <summary>
        ///     Sets the number of codes to generate for dynamic coupons
        ///     Required when CouponCodeType is "Dynamic"
        /// </summary>
        public int? SetSize { get; set; }

        #endregion

        #region Response Group Properties

        /// <summary>
        ///     Count of associated couponCodes.
        ///     Must use "counts" response group to get this value
        ///     ReadOnly
        /// </summary>
        public int? CouponCodeCount { get; set; }

        /// <summary>
        ///     ReadOnly count of all redemptions for this coupon set.
        /// </summary>
        public int? RedemptionCount { get; set; }

        /// <summary>
        ///     ReadOnly sum of all redemptions for this coupon.
        ///     Use "counts" response group.
        /// </summary>
        public int? AssignedDiscountCount { get; set; }

        #endregion

        /// <summary>
        ///     Valid CouponCodeTypes
        /// </summary>
        public static class CouponCodeTypes
        {
            public const string Generated = "Generated";
            public const string Manual = "Manual";
        }
    }
}