using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Models
{
    public class ShipmentInventoryDetails : Kibo.Fulfillment.Contracts.Model.Item
    {
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
