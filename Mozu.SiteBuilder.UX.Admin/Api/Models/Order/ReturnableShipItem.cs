using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    public class ReturnableShipItem
    {
        /// <summary>
        /// The Id of the shipment where this item was found.
        /// </summary>
        public string ShipmentNumber { get; set; }

        /// <summary>
        /// The Id of the shipment item where this item was found.
        /// </summary>
        public string ShipmentItemId { get; set; }

        /// <summary>
        /// The quantity of this item in the shipment.
        /// </summary>
        public int QuantityOrdered { get; set; }

        /// <summary>
        /// The quantity of the item that was fulfilled.
        /// If the shipment has been fulfilled, this should be the same as <see cref="QuantityOrdered"/>, otherwise 0.
        /// </summary>
        public int QuantityFulfilled { get; set; }

        /// <summary>
        /// The number if times the shipment item was found in live returns (not cancelled or rejected).
        /// </summary>
        public int QuantityReturned { get; set; }

        /// <summary>
        /// The number of units returnable for this shipment item.
        /// </summary>
        public int QuantityReturnable { get; set; }
    }
}