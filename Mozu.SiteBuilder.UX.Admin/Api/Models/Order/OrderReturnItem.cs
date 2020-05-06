using System.Collections.Generic;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    /// <summary>
    /// A totally made up thing to help the UI count returned inventory.
    /// </summary>
    public class OrderReturnableItem
    {
        /// <summary>
        /// The product code of the associated item.
        /// </summary>
        public string ProductCode { get; set; }

        /// <summary>
        /// The name of the associated product.
        /// </summary>
        public string ProductName { get; set; }

        /// <summary>
        /// Shipment Number associated with product
        /// </summary>
        public int? ShipmentNumber { get; set; }

        /// <summary>
        /// Shipment Item Id Number associated with product
        /// </summary>
        public int? ShipmentItemId { get; set; }

        /// <summary>
        /// The number of units ordered.
        /// </summary>
        public int QuantityOrdered { get; set; }

        /// <summary>
        /// The number of units fulfilled.
        /// </summary>
        public int QuantityFulfilled { get; set; }

        /// <summary>
        /// The number if times this item configuration was found in live returns (not cancelled or rejected).
        /// </summary>
        public int QuantityReturned { get; set; }

        /// <summary>
        /// The number of units returnable.
        /// </summary
        public int QuantityReturnable
        {
            get { return QuantityFulfilled - QuantityReturned; }
        }

        public string FulfillmentStatus { get; set; }

        public string OrderItemId { get; set; }

        public int OrderLineId { get; set; }

        public string OrderItemOptionAttributeFQN { get; set; }

        public int UnitQuantity { get; set; }

        public string ParentProductCode { get; set; }

        public string ParentProductName { get; set; }


    }

}
