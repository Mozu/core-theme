using System;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    public class OrderReturnableItem
    {
        /// <summary>
        /// A totally made up thing to help the UI count returned inventory.
        /// </summary>
        public string Key { get; set; }

        public string OrderItemId { get; set; }

        public string ProductCode { get; set; }
        public string ProductName { get; set; }

        public decimal? UnitPrice { get; set; }

        public int QuantityOrdered { get; set; }
        public int QuantityFulfilled { get; set; }

        public string ParentItemId { get; set; }
        public string ParentProductCode { get; set; }
        public string ParentProductName { get; set; }
        public int OrderLineId { get; set; }
        public string FulfillmentStatus { get; set; }
    }
}
