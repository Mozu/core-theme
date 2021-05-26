using Mozu.Core.Api.Contracts;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Models
{
    public class DetailedShipmentItem : CommerceRuntime.Contracts.Fulfillment.ShipmentItem
    {
        public Measurement AdjustedWeight { get; set; }
        public string ProductName { get; set; }
        public int StockOnHand { get; set; }
        public int StockAvailable { get; set; }
        public int StockAllocated { get; set; }
        public int StockOnBackOrder { get; set; }
        public int SafetyStock { get; set; }
        public decimal Ltd { get; set; }
        public int Floor { get; set; }
        public int PendingStock { get; set; }
    }
}