using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Order
{
    public class SubPayment
    {
        public string Status { get; set; }
        public decimal AmountCollected { get; set; }
        public decimal AmountCredited { get; set; }
        public decimal AmountRequested { get; set; }
        public decimal AmountRefunded { get; set; }
        public PaymentActionTarget Target { get; set; }
    }
}