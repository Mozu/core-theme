using System;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    
    public class ShippingDiscount
    {
        public int DiscountId { get; set; }

        public string MethodCode { get; set; }

        public string Description { get; set; }

        public decimal Total { get; set; }

        public string CouponCode { get; set; }

        public bool IsActive { get; set; }
    }
}
