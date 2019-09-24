using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    public class OrderItemStock
    {
        public bool ManageStock { get; set; }
        public bool IsOnBackOrder { get; set; }
        public DateTime? AvailableDate { get; set; }
        public int? StockAvailable { get; set; }
    }
}