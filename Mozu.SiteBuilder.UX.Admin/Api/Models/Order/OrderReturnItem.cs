namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    /// <summary>
    /// A totally made up thing to help the UI count returned inventory.
    /// </summary>
    public class OrderReturnableItem
    {
        /// <summary>
        /// The Id of the associated OrderItem.
        /// </summary>
        public string OrderItemId { get; set; }

        /// <summary>
        /// The LineId of the associated OrderItem.
        /// </summary>
        public int OrderLineId { get; set; }

        /// <summary>
        /// The product code of the associated item. For bundle items/extras, this will likely be different than the parent product.
        /// </summary>
        public string ProductCode { get; set; }

        /// <summary>
        /// The name of the associated product.
        /// </summary>
        public string ProductName { get; set; }

        /// <summary>
        /// If this item refers to a product extra, this is the associated OptionAttributeFQN.
        /// For bundle items, this should be null/empty.
        /// </summary>
        public string OrderItemOptionAttributeFQN { get; set; }

        /// <summary>
        /// Whether this item excludes product extras. If the OrderItem has extras, there should be two entries for the parent product.
        /// One entry will have this set to false, in which case quantities of extra items are taken into account for quantity and status calculations.
        /// The other entry will have this set to true, in which case extra items are ignored for quantity and status calculations.
        /// </summary>
        public bool ExcludeProductExtras { get; set; }

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

        /// <summary>
        /// If this item refers to a bundle item/extra, this will be the product code of the parent product.
        /// </summary>
        public string ParentProductCode { get; set; }

        /// <summary>
        /// If this item refers to a bundle item/extra, this will be the name of the parent product.
        /// </summary>
        public string ParentProductName { get; set; }

        /// <summary>
        /// The fulfillment status of the associated item.
        /// If the associated item is a bundle or product with extras, this takes the fulfillment status of the child items into account.
        /// </summary>
        public string FulfillmentStatus { get; set; }
    }
}
