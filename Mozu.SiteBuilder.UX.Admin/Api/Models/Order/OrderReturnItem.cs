namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    /// <summary>
    /// A totally made up thing to help the UI count returned inventory.
    /// </summary>
    public class OrderReturnableItem
    {
        public string Key { get; set; }

        public string OrderItemId { get; set; }
        public int OrderLineId { get; set; }

        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public string OrderItemOptionAttributeFQN { get; set; }
        public bool ExcludeProductExtras { get; set; }
        public decimal? UnitPrice { get; set; }

        /// <summary>
        /// The number of units ordered.
        /// </summary>
        public int QuantityOrdered { get; set; }

        /// <summary>
        /// The number of units fulfilled.
        /// For bundles or products including extras, the number of whole units fulfilled.
        /// </summary>
        public int QuantityFulfilled { get; set; }

        /// <summary>
        /// The number if times this exact item configuration was found in live returns (not cancelled or rejected).
        /// </summary>
        public int QuantityDirectlyReturned { get; set; }

        /// <summary>
        /// The number of times this item configuration is seen across all live returns without being directly used.
        /// In the case of bundles or products including extras, this will include partial units.
        /// For example, given a bundle consisting of a shirt, tie, and pants, if the shirt and tie are returned, one partial bundle has been returned.
        /// </summary>
        public int QuantityIndirectlyReturned { get; set; }

        /// <summary>
        /// The number of units returnable.
        /// For bundles or products including extras, the number of whole units returnable.
        /// </summary>
        public int QuantityReturnable { get; set; }

        /// <summary>
        /// If this configuration refers to a bundle item or extra, this is the quantity per whole unit.
        /// </summary>
        public int UnitQuantity { get; set; }

        public string ParentItemId { get; set; }
        public string ParentProductCode { get; set; }
        public string ParentProductName { get; set; }

        public string FulfillmentStatus { get; set; }
    }
}
