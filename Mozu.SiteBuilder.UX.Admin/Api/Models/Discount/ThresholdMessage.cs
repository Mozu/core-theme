namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Discount
{
    public class ThresholdMessage
    {
        /// <summary>
        /// Unique identifier of the threshold message. System-supplied and read-only.
        /// </summary>
        public int? Id { get; set; }

        /// <summary>
        /// Unique identifier of the discount. System-supplied and read-only.
        /// </summary>
        public int DiscountId { get; set; }

        /// <summary>
        /// The cart total amount that must be met before the threshold message is displayed
        /// </summary>
        public decimal ThresholdValue { get; set; }

        /// <summary>
        /// Indicates if threshold messages are active for this discount
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// Indicates if the threshold message will display in the cart  
        /// </summary>
        public bool ShowInCart { get; set; }

        /// <summary>
        /// Indicates if the threshold message will display on the checkout page
        /// </summary>
        public bool ShowOnCheckout { get; set; }

        /// <summary>
        /// Indicates if the threshold message will display when a promo code is evaluated
        /// </summary>
        public bool RequiresCouponCode { get; set; }

        /// <summary>
        /// The message template for a discounts threshold message
        /// </summary>
        public string MessageTemplate { get; set; }
    }
}