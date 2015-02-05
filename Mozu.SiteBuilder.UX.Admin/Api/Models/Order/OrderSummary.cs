using System;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    public class OrderSummary
    {
        /// <summary>
        ///  total order amount
        /// </summary>
        public decimal TotalAmount { get; set; }

        /// <summary>
        /// amount collected so far
        /// </summary>
        public decimal AmountCollected { get; set; }

        /// <summary>
        /// remaining balance
        /// </summary>
        public decimal Balance { get; set; }

        /// <summary>
        /// Sum of all refunds applied to this order.
        /// </summary>
        public decimal AmountRefunded { get; set; }

        /// <summary>
        /// remaining balance
        /// </summary>
        public int TotalItemCount { get; set; }

        /// <summary>
        /// remaining balance
        /// </summary>
        public int FulfilledItemCount { get; set; }

        /// <summary>
        /// Total number of items that have been marked as shipped
        /// </summary>
        public int ShippedItemCount { get; set; }

        /// <summary>
        /// Total number of items in packages that have not been marked as shipped;
        /// </summary>
        public int UnshippedItemCount { get; set; }

        /// <summary>
        /// Total number of items in pickups that have been marked as pickeded up
        /// </summary>
        public int PickedupItemCount { get; set; }

        /// <summary>
        /// Total number of items in pickups that have not been marked as pickeded up
        /// </summary>
        public int UnpickedupItemCount { get; set; }

        /// <summary>
        /// remaining balance
        /// </summary>
        public int UnfulfilledItemCount { get; set; }
    }
}
