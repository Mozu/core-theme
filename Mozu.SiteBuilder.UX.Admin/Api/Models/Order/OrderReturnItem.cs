using System;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    public class OrderReturnableItem
    {
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public decimal UnitPrice { get; set; }

        public int QuantityOrdered { get; set; }
        public int QuantityFulfilled { get; set; }
    }
}
