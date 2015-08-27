using System;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    
    public class OrderItemDiscount
    {
        public int DiscountId { get; set; }

        public int Quantity { get; set; }

        public string Description { get; set; }

        public decimal UnitPrice { get; set; }

        public decimal Total { get; set; }

        public string CouponCode { get; set; }

        public bool IsActive { get; set; }

        public bool? AppliesToSalePrice { get; set; }
    }
}
