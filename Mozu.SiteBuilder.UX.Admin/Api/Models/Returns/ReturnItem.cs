using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Returns
{
    public class ReturnItem
    {
        public string Id { get; set; }

        public string RmaNote { get; set; }

        /// <summary>
        /// Need OrderItemId or ProductCode.
        /// </summary>
        public string OrderItemId { get; set; }

        /// <summary>
        /// The OrderLineId that this ReturnItem is associated with. If order item is present, the orderLineId should be present also.
        /// </summary>
        public int OrderLineId { get; set; }

        /// <summary>
        /// This is the Option attribute FQN for the item being returned .. typically only when the return item is a product bundle item.
        /// </summary>
        public string OrderItemOptionAttributeFQN { get; set; }

        /// <summary>
        /// Need ProductCode or OrderItemId.
        /// </summary>
        public string ProductCode { get; set; }

        /// <summary>
        /// Damaged, Defective, MissingParts, DifferentExpectations, Late, NoLongerWanted, Other
        /// This value is provided by the Shopper when they request a Return.
        ///</summary>
        public string ReturnReason { get; set; }

        /// <summary>
        /// The quantity of this item that the shopper wants to return.
        ///</summary>
        public int Quantity { get; set; }

        /// <summary>
        /// The amount of this item actually received from the shopper. It may differ
        /// from the sum of the ReturnReasons above.  This is populated by the system
        /// when the Receive action is performed.
        /// </summary>
        public int QuantityReceived { get; set; }

        /// <summary>
        /// Of the Quantity returned, how many of this item can be added back into the
        /// inventory? This item is set by the merchant via an UpdateReturn call.  It
        /// is used during the Restock action to set some number of this OrderItemId
        /// back into the inventory management system.
        /// </summary>
        public int QuantityRestockable { get; set; }

        /// <summary>
        /// The amount of this item sent to the shopper.
        /// </summary>
        public int QuantityShipped { get; set; }

        /// <summary>
        /// The loss incurred of the returned products, used for accounting purposes.
        /// </summary>
        public decimal? ProductLossAmount { get; set; }

        /// <summary>
        /// The tax on the returned products, used for accounting purposes.
        /// </summary>
        public decimal? ProductLossTaxAmount { get; set; }

        /// <summary>
        /// The loss incurred of the returned product shipping, used for accounting purposes.
        /// </summary>
        public decimal? ShippingLossAmount { get; set; }

        /// <summary>
        ///  The tax on the returned product shipping, used for accounting purposes.
        /// </summary>
        public decimal? ShippingLossTaxAmount { get; set; }
    }
}
