using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Returns
{
    public class ProductOption
    {
        public string AttributeFQN { get; set; }
        public string DataType { get; set; }
        public string Name { get; set; }
        public object ShopperEnteredValue { get; set; }
        public string StringValue { get; set; }
        public string Value { get; set; }
    }

    public class ReturnItem
    {
        public string Id { get; set; }
        
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
        /// Product Name
        /// </summary>
        public string ProductName { get; set; }

        /// <summary>
        /// Product option attributes.
        /// </summary>
        public List<ProductOption> ProductOptions { get; set; }

        /// <summary>
        /// Bundle items.
        /// </summary>
        public List<BundledProduct> BundleItems { get; set; }

        /// <summary>
        /// Extras.
        /// </summary>
        public List<BundledProduct> Extras { get; set; }

        /// <summary>
        /// Notes from the storefront.
        /// </summary>
        public List<OrderNote> Notes { get; set; } 

        /// <summary>
        /// Image URL for display of image.
        /// </summary>
        public string ImageUrl { get; set; }

        /// <summary>
        /// Image alternate text if the image URL isn't available.
        /// </summary>
        public string ImageAlternateText { get; set; }

        /// <summary>
        /// Damaged, Defective, MissingParts, DifferentExpectations, Late, NoLongerWanted, Other
        /// This value is provided by the Shopper when they request a Return.
        ///</summary>
        public string ReturnReason { get; set; }

        /// <summary>
        /// If this return item refers to a product/bundle that has product extras, this specifies whether those child items should be included or excluded.
        /// For backward compatibility, a null value will be treated as false, i.e. include the extras.
        /// </summary>
        public bool? ExcludeProductExtras { get; set; }

        /// <summary>
        /// Specifies whether the requested resolution for this item is Refund or Replace.
        /// </summary>
        public string ReturnType { get; set; }

        /// <summary>
        /// Specifies whether this item should be returned to the merchant, e.g. if the item is irreparably damaged and it's not worth shipping back.
        /// Even if this is set to true, <see cref="QuantityShipped"/> should still be set to the quantity of items involved in the return.
        /// </summary>
        public bool ReturnNotRequired { get; set; }

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
        /// Describes the receive status of this item.
        /// If <see cref="ReturnNotRequired"/> is <c>true</c>, then this should be 'NotRequested'.
        /// Otherwise the value should be 'Received' or 'Waiting' depending on <see cref="QuantityReceived"/>.
        /// </summary>
        public string ReceiveStatus { get; set; }

        /// <summary>
        /// Of the Quantity returned, how many of this item can be added back into the
        /// inventory? This item is set by the merchant via an UpdateReturn call.  It
        /// is used during the Restock action to set some number of this OrderItemId
        /// back into the inventory management system.
        /// </summary>
        public int QuantityRestockable { get; set; }

        public int QuantityRestocked { get; set; }

        public int QtyRestockable { get { return QuantityRestocked; } }
        

        /// <summary>
        /// If a refund is issued for the return, how much of the refund amount is for this particular item.
        /// </summary>
        public decimal? RefundAmount { get; set; }

        /// <summary>
        /// Describes the refund status of this item.
        /// If <see cref="ReturnType"/> is 'Replace', then this should be 'NotRequested'.
        /// Otherwise the value should be 'Refunded' or 'NotRefunded' depending on <see cref="RefundAmount"/>.
        /// </summary>
        public string RefundStatus { get; set; }

        /// <summary>
        /// Specifies whether this item has been replaced, i.e. has it been used to generate a replacement order for the return.
        /// </summary>
        public int? QuantityReplaced { get; set; }

        /// <summary>
        /// Describes the replace status of this item.
        /// If <see cref="ReturnType"/> is 'Refund', then this should be 'NotRequested'.
        /// Otherwise the value should be 'Replaced' or 'NotReplaced' depending on <see cref="QuantityReplaced"/>.
        /// </summary>

        public string ReplaceStatus { get; set; }

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

        /// <summary>
        /// The total cost of the products, including weighted values from the order, discounts and tax.
        /// </summary>
        public decimal? ProductTotal { get; set; }

        /// <summary>
        /// The total cost of shipping and handling, including weighted values from the order, discounts and tax.
        /// </summary>
        public decimal? ShippingAndHandlingTotal { get; set; }

        /// <summary>
        /// The quantity that is returnable now.
        /// </summary>
        public int? QuantityReturnable { get; set; }
        public int? ShipmentItemId { get; set; }

        public int? ShipmentNumber { get; set; }

        public string OriginalShipmentId { get; set; }
    }
}
