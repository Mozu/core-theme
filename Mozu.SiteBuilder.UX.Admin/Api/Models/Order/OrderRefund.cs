using System;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    public class OrderRefund
    {
        public string Id { get; set; }
        public decimal Amount { get; set; }
        public string OrderId { get; set; }
        public string Reason { get; set; }
        public OrderPayment Payment { get; set; }

        public DateTime? CreateDate { get; set; }
        public string CreatedBy { get; set; }
    }
}