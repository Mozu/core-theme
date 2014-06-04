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
        /// remaining balance
        /// </summary>
        public int TotalItemCount { get; set; }

        /// <summary>
        /// remaining balance
        /// </summary>
        public int FulfilledItemCount { get; set; }

        /// <summary>
        /// remaining balance
        /// </summary>
        public int UnfulfilledItemCount { get; set; }
    }
}
