using System;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    public abstract class AbstractOrderPackageItem
    {
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public int Quantity { get; set; }

        public decimal? Weight { get; set; }

        public decimal UnitPrice { get; set; }
        public decimal Total { get; set; }

        /// <summary>
        /// The line id associated with the fulfillment.
        /// </summary>
        public int LineId { get; set; }

        public string FulfillmentStatus { get; set; }
        
    }
}
